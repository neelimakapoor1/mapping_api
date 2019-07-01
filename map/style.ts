import { Component } from '@angular/core';



export class Style {
    fillColor: string;
    outlineColor: string;
    outlineWidth: number;
    iconUrl: string;
    iconHeight: number;
    iconWidth: number;
    baseHeight: number;
    topHeight: number;
    closeTop: boolean;
    closeBottom: boolean;

    constructor(options) {
    	this.fillColor = options.fillColor;
    	this.outlineColor = options.outlineColor;
    	this.outlineWidth = options.outlineWidth;
    	this.iconUrl = options.iconUrl;
    	this.iconHeight = options.iconHeight;
    	this.iconWidth = options.iconWidth;
        this.baseHeight = options.baseHeight;
        this.topHeight = options.topHeight;
        this.closeTop = options.closeTop;
        this.closeBottom = options.closeBottom;
    }
    
}