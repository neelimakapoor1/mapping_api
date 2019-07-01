import { Component } from '@angular/core';
import {Http, Headers} from '@angular/http';


export class IndoorMapDataSource {
  buildingId: number;
  buildingUid: string;
  floorId: number;
  http: Http;
  gisUrl: string = 'https://estapi.dev10.in/gis/api/';
  cityCode: string;
  apiKey: string;
  languageId: number = 1;

  constructor(options) {
    this.buildingId = options.buildingId;
    this.buildingUid = options.buildingUid;
    this.floorId = options.floorId;
    this.cityCode = options.cityCode;
    this.apiKey = options.apiKey;
    this.http = options.http;
  }
}