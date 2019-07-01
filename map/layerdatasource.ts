import { Component } from '@angular/core';
import {Http, Headers} from '@angular/http';


export class LayerDataSource {
  format: string;
  layerName: string;
  cityCode: string;
  featureId: number;
  filter: object;
  http: Http;
  gisUrl: string = 'https://estapi.dev10.in/gis/api/';
  apiKey: string;
  languageId: number = 1;
  titleField: string;
  descField: string;
  baseHeightField: string;
  topHeightField: string;
  iconUrlField: string;

  constructor(options) {
    this.format = options.format;
    this.layerName = options.layerName;
    this.cityCode = options.cityCode;
    this.apiKey = options.apiKey;
    this.http = options.http;
    this.filter = options.filter;
    this.featureId = options.featureId;
    this.titleField = options.titleField;
    this.descField = options.descField;
    this.topHeightField = options.topHeightField;
    this.baseHeightField = options.baseHeightField;
    this.iconUrlField = options.iconUrlField;
  }

  destroy(){

  }

  get(onSuccess, onError) {
    this.getByFilter(this.filter, onSuccess, onError);
  }

  getByFilter(filter, onSuccess, onError) {
     let url = this.gisUrl + this.layerName + '/';
     if(typeof this.featureId != 'undefined') url += this.featureId + '/';
     url += this.format;
     if (typeof filter == 'undefined') filter = {};
     if (typeof filter.limit == 'undefined') filter.limit = 10000;
     url += '?limit=' + filter.limit;
     Object.keys(filter).forEach(key => {
        if (key != 'limit' && typeof filter[key] != 'undefined'){
          url += '&' + key + '=' + filter[key];
        }
     });
     if (typeof this.cityCode == 'undefined'){
      if (onError) onError('No cityCode defined in source');
      return;
     }
     if (typeof this.apiKey == 'undefined'){
      if (onError) onError('No apiKey defined in source');
      return;
     }
     let headers = new Headers({
      'Content-Type': 'application/json',
      'USER-CITY': this.cityCode,
      'API-KEY':  this.apiKey,
      'USER-LANGUAGE': ''+this.languageId+''
     });
     this.http.get(url, {'headers': headers}).subscribe(
        data => onSuccess(data.json()),
        error => onError(error)
     );
  }
}