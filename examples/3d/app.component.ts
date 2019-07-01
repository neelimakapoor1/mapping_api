import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { IndoorMap } from './map/indoormap';
import { LatLon } from './map/latlon';
import { LayerDataSource } from './map/layerdatasource';
import { Layer } from './map/layer';
import { Style } from './map/style';
import {Http} from '@angular/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {  
  @ViewChild('map') mapElement: any;
  @ViewChild('floorSwitcherContainer') floorSwitcherElement: any;
  map: IndoorMap;
  constructor(private http: Http) {
    this.http = http;
  }

  ngOnInit(){
    //Add map
    var options = {
      center: new LatLon(29.374732, 47.974151),
      zoom: 18,
      showZoomControl: false,
      showScaleControl: false,
      showBaseLayer: false,
      showBaseMapTypeControl: false,
      showFullScreenControl: true,
      api: 'cesium',
      element: this.mapElement.nativeElement,
      floorSwitcherElement: this.floorSwitcherElement.nativeElement,
      source: {
        buildingId: 1,
        floorId: 1,
        apiKey: 'test',
        http: this.http,
        cityCode: 'kwt'
      },
      styleMap: {
        'floors': new Style({
          'fillColor': '#bab7a9',
          'baseHeight': 0,
          'topHeight': 0.75,
          'closeTop': true
        }),
        'units': new Style({
          'fillColor': 'lightgray',
          'outlineColor': 'lightgray',
          'baseHeight': 0.80,
          'topHeight': 2.5,
          'closeTop': true,
          'iconWidth': 10.0,
          'iconHeight': 10.0
        })
      },
      onError: (error) => {
        alert(error);
      },
      onSuccess: () => {
        console.log('IndoorMap loaded');
        let unitFeatures = this.map.getUnitLayer().getFeaturesByAttributes({
          'unit_id': 4192
        });
        if (unitFeatures != null && unitFeatures.length > 0){
          this.map.getUnitLayer().setStyle(unitFeatures[0], new Style({
            'fillColor': 'blue'
          }));
          this.map.zoomToFeature(unitFeatures[0]);
        }
      }
    };
    this.map = new IndoorMap(options);    

    
    //Get long-press event to map by finding time-gap between mousedown and mouseup
    let start;
    this.map.addEventListener('mousedown', (e) => {
        start = new Date().getTime(); 
    });
    this.map.addEventListener('mouseup', (e) => {
       let end = new Date().getTime();
       let longpress = (end - start < 500) ? false : true; 
       if (longpress){
        //Add marker to map
        this.map.addMarker(e.latlon, {
          'title': 'My property',
          'info': '<div id="content">'+
              'This is my new property' +
              '</div>'
        });

        //Zoom + pan to marker
        this.map.zoomTo(e.latlon, 20);
       }
    });

    /*let buildingLayer = new Layer({
      'name': 'building layer',
      'style': new Style({
        'fillColor': 'blue',
        'outlineColor': 'yellow'
      }),
      'source': new LayerDataSource({
        'format': 'geojson',
        'layerName': 'buildings',
        'cityCode': 'KWT',
        'filter': {
          'building_uid': 'BKWTAA0001'
        },
        'apiKey': 'test',
        'http': this.http
      })
    });*/

    /*let floorLayer = new Layer({
      'name': 'floor layer',
      'map': this.map,
      'zoomToLayer': true,
      'style': new Style({
        'fillColor': 'blue',
        'outlineColor': 'yellow'
      }),
      'source': new LayerDataSource({
        'format': 'geojson',
        'layerName': 'floors',
        'cityCode': 'KWT',
        'filter': {
          'building_id': 1,
          'floor_uid': 'FKWTAA0001'
        },
        'apiKey': 'test',
        'http': this.http
      })
    });

    let unitLayer = new Layer({
      'name': 'unit layer',
      'map': this.map,
      'style': new Style({
        'fillColor': 'blue',
        'outlineColor': 'yellow'
      }),
      'source': new LayerDataSource({
        'format': 'geojson',
        'layerName': 'units',
        'cityCode': 'KWT',
        'filter': {
          'floor_id': 1
        },
        'apiKey': 'test',
        'http': this.http
      })
    });*/
  }
}
