import { Component } from '@angular/core';

export class LatLon {
  lat: number;
  lon: number;
  height: number;
  constructor(lat, lon, height) {
    this.lat = lat;
    this.lon = lon;
    this.height = height;
  }

  getLat(): number  {
  	return this.lat;
  }

  getLon(): number  {
  	return this.lon;
  }

  getHeight(): number {
    return this.height;
  }

}