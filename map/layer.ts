import { Component } from '@angular/core';
import { } from '@types/googlemaps';
import { LayerDataSource } from './layerdatasource';
import { Style } from './style';
import { Feature } from './feature';
import { Map } from './map';

export class Layer {
    name: string;
    source: LayerDataSource;
    style: Style;
    map: Map;
    zoomToLayer: boolean;
    isDataLoaded: boolean = false;
    isLoadedFirstTime: boolean = true;
    onError: any;
    onSuccess: any;
    dataSource: any;

    constructor(options){
      this.map = options.map;
      this.name = options.name;
      this.source = options.source;
      this.style = options.style;
      this.zoomToLayer = options.zoomToLayer;
      this.onError = options.onError;
      this.onSuccess = options.onSuccess;
      if (typeof this.source != 'undefined'){
        this.loadData();
      }
    }

    loadData() {
      this.isDataLoaded = false;
      this.source.get(
        (data) => {
          this.onDataLoad(data);
        },
        (error) => {
          if (this.onError) this.onError('Error code:' + error.statusCode + 'message:' + error.statusText);
        }
      );
    }

    getFeaturesByAttributes(filter, options): Feature[]  {
      if (!filter) filter = this.source.filter;
      let features = [];
      if (this.map.api == 'cesium'){
        let entities = this.__dataSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
          let entity = entities[i];
          let properties = entity.properties.getValue(new Cesium.JulianDate());
          let keys = Object.keys(filter);
          let filterMatches = false;
          for (var i = 0; i < keys.length; i++) {
            if (properties[keys[i]] == filter[keys[i]]){
              filterMatches = true;
            }
            else {
              filterMatches = false;
              break;
            }
          }
          if (filterMatches){
            let feature = new Feature({
              'attributes': properties
            });
            feature.id = entity.id;
            features.push(feature);
          }
        }
      }
      return features;
    }

    getFeaturesByLocation(lat, lon, radius, options): Feature[]  {
      return null;
    }

    getFeaturesByGeometry(geometry, radius, options): Feature[]  {
      return null;
    }

    getFeatureById(id): Feature  {
      //get feature with given id
      return null;
    }

    addFeature(feature, pesist): boolean {
      //add feature to map.
      //if persist = true, then add it to the layer-datasource
      return true;
    }

    destroy(){
      this.clear();
      this.__dataSource = null;
      this.onSuccess = undefined;
      this.onError = undefined;
      this.map = undefined;
      this.source = undefined;
    }

    clear(){
      this.map.map.dataSources.remove(this.__dataSource, true);
      this.isDataLoaded = false;
    }

    setStyle(feature: Feature, style: Style) {
      if (this.map.api == 'cesium'){
        let entity = this.__dataSource.entities.getById(feature.id);
        if (typeof entity != 'undefined'){
          entity.polygon.fill = (typeof style.fillColor != 'undefined');
          entity.polygon.outline = (typeof style.outlineColor != 'undefined');
          entity.polygon.closeTop = (typeof style.closeTop != 'undefined')? this.style.closeTop: true;
          entity.polygon.closeBottom = (typeof style.closeBottom != 'undefined')? this.style.closeBottom: true;
          if (typeof style.fillColor != 'undefined'){
            entity.polygon.material = Cesium.Color.fromCssColorString(style.fillColor);
          }
          if (typeof style.outlineColor != 'undefined'){
            entity.polygon.outlineColor = Cesium.Color.fromCssColorString(style.outlineColor);
          }
          if (typeof style.outlineWidth != 'undefined'){
            entity.polygon.outlineWidth = style.outlineWidth;
          }
          entity = undefined;
        }
      }
    }
    
    onDataLoad(data: string) {
      if (this.map.api == 'googlemap'){

      }
      else if (this.map.api == 'cesium'){
        Cesium.GeoJsonDataSource
          .load(data)
          .then((dataSource) => {
            try {
              let entities = dataSource.entities.values;  
              for (let i = 0; i < entities.length; i++) {
                let entity = entities[i];

                //Height
                if (typeof this.style.baseHeight != 'undefined'){
                  entity.polygon.height = this.style.baseHeight;
                }
                else if (typeof this.source.baseHeightField != 'undefined'){
                  entity.polygon.height = entity.properties[this.source.baseHeightField];
                }
                else {
                  entity.polygon.height = 0;
                }
                if (typeof this.style.topHeight != 'undefined'){
                  entity.polygon.extrudedHeight = this.style.topHeight;
                }
                else if (typeof this.source.topHeightField != 'undefined'){
                  entity.polygon.extrudedHeight = entity.properties[this.source.topHeightField];
                }
                else {
                  entity.polygon.extrudedHeight = 0;
                }

                //Polygon color
                entity.polygon.fill = (typeof this.style.fillColor != 'undefined');
                entity.polygon.outline = (typeof this.style.outlineColor != 'undefined');
                entity.polygon.closeTop = (typeof this.style.closeTop != 'undefined')? this.style.closeTop: true;
                entity.polygon.closeBottom = (typeof this.style.closeBottom != 'undefined')? this.style.closeBottom: true;
                if (typeof this.style.fillColor != 'undefined'){
                  entity.polygon.material = Cesium.Color.fromCssColorString(this.style.fillColor);
                }
                if (typeof this.style.outlineColor != 'undefined'){
                  entity.polygon.outlineColor = Cesium.Color.fromCssColorString(this.style.outlineColor);
                }
                if (typeof this.style.outlineWidth != 'undefined'){
                  entity.polygon.outlineWidth = this.style.outlineWidth;
                }

                //Icon
                if (typeof this.style.iconUrl != 'undefined'){
                   if (!entity.position && entity.polygon) {
                      let center = Cesium.BoundingSphere.fromPoints(entity.polygon.hierarchy.getValue().positions).center;
                      Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(center, center);
                      entity.position = new Cesium.ConstantPositionProperty(center);
                  }
                  entity.billboard =  {
                      image : this.style.iconUrl,
                      position : entity.position.getValue(),
                      sizeInMeters : true,
                      height: this.style.iconWidth,
                      width: this.style.iconHeight,
                      verticalOrigin: Cesium.VerticalOrigin.CENTER,
                      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                      heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
                  };
                }
                else if (typeof this.source.iconUrlField != 'undefined' && entity.properties.getValue(new Cesium.JulianDate())[this.source.iconUrlField] != null){
                   if (!entity.position && entity.polygon) {
                      let center = Cesium.BoundingSphere.fromPoints(entity.polygon.hierarchy.getValue().positions).center;
                      Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(center, center);
                      entity.position = new Cesium.ConstantPositionProperty(center);
                  }
                  entity.billboard =  {
                      image : entity.properties.getValue(new Cesium.JulianDate())[this.source.iconUrlField],
                      position : entity.position.getValue(),
                      sizeInMeters : true,
                      height: this.style.iconWidth,
                      width: this.style.iconHeight,
                      //pixelOffset : new Cesium.Cartesian2(0, -50), // default: (0, 0)
                      //eyeOffset : new Cesium.Cartesian3(0.0, 0.0, 0.0), // default
                      horizontalOrigin : Cesium.HorizontalOrigin.CENTER, // default
                      verticalOrigin : Cesium.VerticalOrigin.BOTTOM, // default: CENTER
                      heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
                  };
                }


                if (typeof this.source.titleField != 'undefined'){
                  entity.name = entity.properties[this.source.titleField];
                }
                if (typeof this.source.descField != 'undefined'){
                  entity.description = entity.properties[this.source.descField];
                }
                else {
                  entity.description = null;
                }
              }
              this.map.map.dataSources.add(dataSource);
              this.__dataSource = dataSource;
              if (this.isLoadedFirstTime){
                if (this.zoomToLayer){
                  this.map.map.zoomTo(dataSource);
                }
                this.isLoadedFirstTime = false;
              }
              this.isDataLoaded = true;
              if (this.onSuccess) this.onSuccess();
            }
            catch(e){
              if (this.onError) this.onError('Error in fetching layer-data from source: ' + e.message);
            }
          });
      }
    }
}