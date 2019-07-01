import { Component } from '@angular/core';
import { } from '@types/googlemaps';
import { Style } from './style';

export class Feature {
    id: any;
    geometry: string;
    attributes: Object;

    constructor(options) {
      this.id = options.id;
      this.geometry = options.geometry;
      this.attributes = options.attributes;
    }

    destroy(){
      
    }

    getId(): number {
      return this.id;
    }

    toJSON(): string {
      return null;
    }

    static fromJSON(json: string): Feature {
      let feature = Object.create(Feature.prototype);
      return feature;
    }
}