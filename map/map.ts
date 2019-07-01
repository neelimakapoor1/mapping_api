import { Component } from '@angular/core';
import { } from '@types/googlemaps';
import { Layer } from './layer';
import { Feature } from './feature';
import { LatLon } from './latlon';

export class Map {
  api: string;
  id: string;
  map: any;
  locationMarker: google.maps.Marker;
  constructor(options) {
    //Create id for map
    this.id = '_' + Math.random().toString(36).substr(2, 9);

    //Add 2D map
    if (!options) options = {};
    if (typeof options.api == 'undefined') options.api = 'googlemap';
    this.api = options.api;
    if (!options.element){
    	throw 'Element not provided';
    }
    if (!options.center){
    	throw 'Center not provided';
    }
    if (this.api == 'googlemap'){
	    let googleMapProp = {
	      center: new google.maps.LatLng(options.center.getLat(), options.center.getLon()),
	      zoom: (typeof options.zoom != 'undefined')? options.zoom: 18,
	      zoomControl: (typeof options.showZoomControl != 'undefined')? options.showZoomControl: false,
	      scaleControl: (typeof options.showScaleControl != 'undefined')? options.showScaleControl: false,
	      fullScreenControl: (typeof options.showFullScreenControl != 'undefined')? options.showFullScreenControl: false,
	      streetViewControl: false,
	      mapTypeControl: (typeof options.showBaseMapTypeControl != 'undefined')? options.showBaseMapTypeControl: true,
	      mapTypeControlOptions: {
	        position: google.maps.ControlPosition.TOP_RIGHT
	      },
	      mapTypeId: google.maps.MapTypeId.ROADMAP
	    };

	    this.map = new google.maps.Map(options.element, googleMapProp);
    } //googlemap ends
    else if (this.api == 'cesium'){
      //Create's a 1x1 transparent base layer so that the globe has no imagery
      var transparentBaseLayer = new Cesium.SingleTileImageryProvider({
          url : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
      });

      //Create the viewer, must specify alpha :true in order for the globe and
      //background to be transparent
      this.map = new Cesium.Viewer(options.element, {
        skyBox : false,
        scene3DOnly: true,
        creditContainer: document.getElementById('cesiumLogo'),
        navigationInstructionsInitiallyVisible: false,
        navigationHelpButton: false,
        timeline: false,
        selectionIndicator: false,
        sceneModePicker: false,
        fullscreenButton: (typeof options.showFullScreenControl != 'undefined')? options.showFullScreenControl: false,
        vrButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: true,
        animation: false,
        skyAtmosphere : false,
        baseLayerPicker : (typeof options.showBaseMapTypeControl != 'undefined')? options.showBaseMapTypeControl: false,
        imageryProvider : (typeof options.showBaseLayer == 'undefined' || options.showBaseLayer == false)? transparentBaseLayer: undefined,
        contextOptions : (typeof options.showBaseLayer == 'undefined' || options.showBaseLayer == false)? {
            webgl: {
                alpha: true
            }
        }: undefined
      });

      if (typeof options.showBaseLayer == 'undefined' || options.showBaseLayer == false){
        //Set the background of the scene to transparent
        this.map.scene.backgroundColor = Cesium.Color.TRANSPARENT;

        //Set the globe base color to transparent
        this.map.scene.globe.baseColor = Cesium.Color.TRANSPARENT;

        //Work around https://github.com/AnalyticalGraphicsInc/cesium/issues/2866
        this.map.scene.fxaa = false;
      }

      var rectangle = Cesium.Rectangle.fromDegrees(47.9722470872006,29.3736781404947,47.9743440598899,29.3750708433858);
      Cesium.Camera.DEFAULT_VIEW_FACTOR = (typeof options.zoom != 'undefined')? options.zoom: 18;
      Cesium.Camera.DEFAULT_VIEW_RECTANGLE = rectangle;
      (<HTMLElement>document.getElementsByClassName('cesium-widget-credits')[0]).style.display = 'none';
    }
  }

  destroy(){
    this.map = undefined;
    this.locationMarker = undefined;
  }

  addEventListener(name, callback){
  	if (this.api == 'googlemap'){
  		this.map.addListener(name, (e) => {
  			e.latlon = new LatLon(e.latLng.lat(), e.latLng.lng());
  			callback(e);
  		});
  	}
    else if (this.api == 'cesium'){
      let eventType = null;
      switch (name){
        case 'mousedown':
          eventType = Cesium.ScreenSpaceEventType.LEFT_DOWN;
          break;
        case 'mouseup':
          eventType = Cesium.ScreenSpaceEventType.LEFT_UP;
          break;
        case 'leftclick':
          eventType = Cesium.ScreenSpaceEventType.LEFT_CLICK;
          break;
        case 'doubleclick':
          eventType = Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK;
          break;
        case 'rightclick':
          eventType = Cesium.ScreenSpaceEventType.RIGHT_CLICK;
          break;
      }
      let handler = new Cesium.ScreenSpaceEventHandler(this.map.scene.canvas);
      handler.setInputAction((e) => {
        let ray = this.map.camera.getPickRay(e.position);
        let position = this.map.scene.globe.pick(ray, this.map.scene);
        if (Cesium.defined(position)) {
            let cart = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
            e.latlon = new LatLon(parseFloat(Cesium.Math.toDegrees(cart.latitude).toFixed(10)), parseFloat(Cesium.Math.toDegrees(cart.longitude).toFixed(10)), cart.height);
            callback(e);
        }
        /*var pickedObject = viewer.scene.pick(movement.position);
        if (Cesium.defined(prevEntity)) {
          prevEntity.polygon.material = unitsMaterial;
          prevEntity.polygon.outlineColor = unitsOutlineColor;
        }
        if (Cesium.defined(pickedObject) && pickedObject.id.properties.hasProperty('description')) {
          pickedObject.id.polygon.material.color = unitsSelectMaterial;
          pickedObject.id.polygon.outlineColor = unitsSelectOutlineColor;
          prevEntity = pickedObject.id;
        }*/
      }, eventType);
    }
  }

  panTo(latlon){
  	if (this.api == 'googlemap'){
  		this.map.panTo(new google.maps.LatLng(latlon.getLat(), latlon.getLon()));
  	}
    else if (this.api == 'cesium'){
      this.map.camera.flyTo({
        destination : Cesium.Cartesian3.fromDegrees(latlon.getLon(), latlon.getLat())
      });
    }
  }

  zoomTo(latlon, zoomLevel){
  	if (this.api == 'googlemap'){
  		this.map.setZoom(zoomLevel);
  		this.map.panTo(new google.maps.LatLng(latlon.getLat(), latlon.getLon()));
  	}
    else if (this.api == 'cesium'){
      let center = Cesium.Cartesian3.fromDegrees(latlon.getLon(), latlon.getLat());
      let heading = Cesium.Math.toRadians(50.0);
      let pitch = Cesium.Math.toRadians(-20.0);
      let range = 5000.0;
      this.map.camera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, range));
    }
  }

  zoomToFeature(feature){
    if (this.api == 'googlemap'){
      
    }
    else if (this.api == 'cesium'){
      for (var i = 0; i < this.map.dataSources.length; i++) {
        let entity = this.map.dataSources.get(i).entities.getById(feature.id);
        if (typeof entity != 'undefined'){
          this.map.flyTo(entity, {
              offset: new Cesium.HeadingPitchRange(0, -Cesium.Math.PI_OVER_FOUR, 0.0)
          });
          this.map.selectedEntity = entity;
          entity = undefined;
          break;
        }
      }
    }
  }

  fitBounds(north, south, east, west){
  	if (this.api == 'googlemap'){
  		var bounds = {
		    north: north,
		    south: south,
		    east: east,
		    west: west
		  };
		  this.map.fitBounds(bounds);
  	}
    else if (this.api == 'cesium'){
      this.map.camera.flyTo({
        destination : Cesium.Rectangle.fromDegrees(west, south, east, north)
      });
    }
  }

  addMarker(latLon, options) {
  	if (!options) options = {};
  	if (this.api == 'googlemap'){
	  	var marker = new google.maps.Marker({
		    position: new google.maps.LatLng(latLon.getLat(), latLon.getLon()),
		    map: this.map,
		    title: options.title
	  	});

	  	if (options.info){
	  		var infowindow = new google.maps.InfoWindow({
			    content: options.info,
			    maxWidth: 200
			});
			infowindow.open(this.map, marker);
	  	}
  	}
    else if (this.api == 'cesium'){
      this.map.entities.add({
        position : Cesium.Cartesian3.fromDegrees(latlon.lon, latlon.lat),
        billboard : {
            image : options.iconUrl, // default: undefined
            show : true, // default
            horizontalOrigin : Cesium.HorizontalOrigin.CENTER, // default
            verticalOrigin : Cesium.VerticalOrigin.BOTTOM, 
            width : options.iconWidth || 100, // default: undefined
            height : options.iconHeight || 100 // default: undefined
        }
    });
    }
  }

  getLayer(name): Layer {
    return null;
  }

  showInfo(latLon, content, options) {

  }
}
