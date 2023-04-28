# mapping_api

Overview
---------
This TypeScript API allows users to display outdoor and indoor maps in a web-application. Users can switch between 2D maps and 3D maps. 2D maps are displayed using Google Maps API and 3D maps are displayed using Cesium API.


Description of Classes
-----------------------

**Map Class**
Create new instance of this class to embed map-panel in a web-application with or without google-maps in background. 
- Method addLayer allows user to display geojson or WMS layer. WMS layers are rendered by GeoServer on server-side. 
- Method addEventListener allows user to register touch and mouse events on map.
- Method addMarker allows to add markers on map.
- Method addIndoorMap allows to display indoor floor-wise unit-layout in 2D or 3D
- getFeatureByLocation allows user to get features at given point-location.
- Zoom/ pan methods are available to navigate on map
- Routing methods are also available on demand.

**Layer Class**
Layer/overlay added on map. Currently it allows user to add vector (GeoJSON) and raster (WMS) layers. 
- Method getFeaturesByAttributes allows user to search features on map based on their attributes/properties.

**Feature Class**
A single vector-layer added on map, having geometry and attributes. E.g.: Building footprint having name and UID.

**IndoorMap Class**
Indoor-map is the indoor floor-wise unit-layout added on map. It comprises of building-footprint layer, floor layer, unit layer, furniture layer etc. 
- Method switchFloor allows user to switch from one floor to another.

**LatLon Class**
Point location with latitude and longitude

**LayerDataSource Class**
Datasource information of layer.

**Style Class**
Styles to be applied to vector features on map.

**IndoorMapDataSource Class**
Datasource information of all layers on indoor-map.


Sample Code
------------
Sample code is available in examples folder.
