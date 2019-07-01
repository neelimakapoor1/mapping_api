import { Component } from '@angular/core';
import { LayerDataSource } from './layerdatasource';
import { IndoorMapDataSource } from './indoormapdatasource';
import { Style } from './style';
import { Map } from './map';
import { Layer } from './layer';

export class IndoorMap extends Map {
    styleMap: any;
    onError: any;
    onSuccess: any;
    source: IndoorMapDataSource;
    floorSwitcherElement: any;
    floorLayer: Layer;
    unitLayer: Layer;
    floorList: any;

    constructor(options){
      super(options);
      this.styleMap = options.styleMap;
      this.source = options.source;
      this.onSuccess = options.onSuccess;
      this.onError = options.onError;
      this.floorSwitcherElement = options.floorSwitcherElement;

      if (typeof this.source == 'undefined'){
        if (this.onError) this.onError('No source defined');
        return;
      }
      else if (typeof this.source.buildingId != 'undefined'){
        this.getFloorList((floorList) => {
          this.floorList = floorList;
          if (typeof this.source.floorId == 'undefined'){
            this.source.floorId = this.getLowestPositiveFloorId();
          }
          this.displayFloorSwitcher();
          this.addIndoorMapLayersForFloor();
        });
      }
      else if (typeof this.source.buildingUid != 'undefined'){
        this.getBuildingInfo((buildingId) => {
          this.source.buildingId = buildingId;
          this.getFloorList((floorList) => {
            this.floorList = floorList;
            if (typeof this.source.floorId == 'undefined'){
              this.source.floorId = this.getLowestPositiveFloorId();
            }
            this.displayFloorSwitcher();
            this.addIndoorMapLayersForFloor();
          });
        });
      }
      else {
        throw 'Either provide source.buildingId or provide source.buildingUid';
      }
    }

    destroy() {
      super.destroy();
      this.floorLayer.destroy();
      this.floorLayer = undefined;
      this.unitLayer.destroy();
      this.unitLayer = undefined;
      this.source = undefined;
      this.floorSwitcherElement = undefined;
      this.floorList = [];
      this.onSuccess = undefined;
      this.onError = undefined;
      this.styleMap = undefined;
    }

    getBuildingInfo(onSuccess){
      var buildingsDataSource = new LayerDataSource({
        'format': 'json',
        'layerName': 'buildings',
        'cityCode': this.source.cityCode,
        'filter': {
          'building_uid': this.source.buildingUid, 
          'building_id': this.source.buildingId
        },
        'apiKey': this.source.apiKey,
        'http': this.source.http
      })
      buildingsDataSource.get(
        (data) => {
          if (data == null || data.length == 0){
            if (this.onError) this.onError('Invalid buildingUid provided in source');
            return;
          }
          onSuccess(data[0].building_id);
        },
        (error) => {
          if (this.onError) this.onError(error);
        }
      );
    };

    getFloorList(onSuccess){
      var floorDataSource = new LayerDataSource({
        'format': 'json',
        'layerName': 'floors',
        'cityCode': this.source.cityCode,
        'filter': {
          'building_id': this.source.buildingId
        },
        'apiKey': this.source.apiKey,
        'http': this.source.http
      });
      floorDataSource.get(
        (data) => {
          onSuccess(data);
        },
        (error) => {
          if (this.onError) this.onError(error);
        }
      );
    };

    addIndoorMapLayersForFloor(){
      this.floorLayer = this.addIndoorMapLayerForFloor('floors', 'floor_name');
      this.unitLayer = this.addIndoorMapLayerForFloor('units', 'unit_name', null, 'unit_url');
    };

    getUnitLayer(): Layer{
      return this.unitLayer;
    };

    getFloorLayer(): Layer{
      return this.floorLayer;
    };

    addIndoorMapLayerForFloor(layerName:string, titleField: string, descField: string, iconUrlField: string): Layer{
      if (typeof this.source.floorId == 'undefined'){
        if (this.onError) this.onError('floorId is not defined in source');
        return null;
      }
      let layerOptions = {
        'name': layerName,
        'map': this,
        'zoomToLayer': true,
        'style': this.styleMap[layerName],
        'onError': this.onError,
        'onSuccess': () => {
          if (this.floorLayer.isDataLoaded && this.unitLayer.isDataLoaded){
            if (this.onSuccess) this.onSuccess();
          }
        },
        'source': new LayerDataSource({
          'format': 'geojson',
          'layerName': layerName,
          'cityCode': this.source.cityCode,
          'titleField': titleField,
          'descField': descField,
          'apiKey': this.source.apiKey,
          'http': this.source.http,
          'iconUrlField': iconUrlField
        })
      };
      if (layerName == 'floors'){
        layerOptions.source['featureId'] = this.source.floorId; 
      }
      else {
        layerOptions.source['filter'] = {
          'floor_id': this.source.floorId
        };
      }
      return new Layer(layerOptions);
    };

    getLowestPositiveFloorId(): number{
      let lowestPositiveFloorNo:number = 1000;
      let lowestPositiveFloorId:number;
      for (var i = 0; i < this.floorList.length; i++) {
        let floorInfo = this.floorList[i];
        if (floorInfo.floor_no >= 0 && floorInfo.floor_no < lowestPositiveFloorNo){
          lowestPositiveFloorNo = floorInfo.floor_no;
          lowestPositiveFloorId = floorInfo.floor_id;
        }
      }
      return lowestPositiveFloorId;
    };

    displayFloorSwitcher() {
      if (typeof this.floorSwitcherElement == 'undefined'){
        return;
      }
      let floorSwitcher = document.createElement('select');
      floorSwitcher.id = 'mapFloorSelector';
      for (var i = 0; i < this.floorList.length; i++) {
        let floorInfo = this.floorList[i];
        let floorOption = document.createElement('option');
        let opt_txt = document.createTextNode (floorInfo.floor_name);
        floorOption.appendChild (opt_txt);
        floorOption.setAttribute('value', floorInfo.floor_id);
        if (floorInfo.floor_id == this.source.floorId){
          floorOption.setAttribute('selected', 'selected');
        }
        floorSwitcher.appendChild(floorOption);
      }
      floorSwitcher.addEventListener("change", (e:Event) => {
        let floorSwitcher = <HTMLSelectElement>e.target;
        console.log('selected floor:' + floorSwitcher.options[ floorSwitcher.selectedIndex ].value );
        this.switchFloor(parseInt(floorSwitcher.options[ floorSwitcher.selectedIndex ].value));
      });
      this.floorSwitcherElement.appendChild(floorSwitcher);
      //let floorSwitcher = document.getElementById("mapFloorSelector");
    };

    switchFloor(floorId: number) {
      if (typeof floorId == 'undefined'){
        if (this.onError) this.onError('floorId is not provided');
        return;
      }
      this.floorLayer.clear();
      this.unitLayer.clear();
      this.source.floorId = floorId;
      this.floorLayer.source['featureId'] = floorId;
      this.floorLayer.loadData();
      this.unitLayer.source.filter['floor_id'] = floorId;
      this.unitLayer.loadData();
    };
}