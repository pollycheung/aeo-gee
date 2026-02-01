// ----------------------------
// Self-contained export script
// ----------------------------

var ROI = require('users/pollycheung43/aeo-paper:modules/ROI.js');
var JRC = require('users/pollycheung43/aeo-paper:modules/JRC.js');

// Choose ROI
var bbox = ROI.bboxBIG;   // or ROI.bboxSMALL

// ----------------------------
// JRC max water mask
// ----------------------------

var JRCmax_mask = JRC.GetMaxMask(bbox);

// Clean binary mask
var jrcMaxBinary = JRCmax_mask
  .unmask(0)
  .gt(0)
  .selfMask();

// ----------------------------
// Raster → vector
// ----------------------------

var jrcMaxVectors = jrcMaxBinary.reduceToVectors({
  geometry: bbox,
  scale: 30,              // JRC resolution
  geometryType: 'polygon',
  eightConnected: false,
  labelProperty: 'water',
  reducer: ee.Reducer.countEvery(),
  bestEffort: true,
  maxPixels: 1e13
});

// ----------------------------
// Bounding box as feature
// ----------------------------

var bboxFeature = ee.Feature(bbox, {name: 'ROI_bbox'});
var bboxCollection = ee.FeatureCollection([bboxFeature]);

// ----------------------------
// (Optional) preview
// ----------------------------

Map.centerObject(bbox, 9);
Map.addLayer(bbox, {color: 'red'}, 'Bounding box');
Map.addLayer(jrcMaxBinary, {palette: ['0000FF']}, 'JRC max mask');
Map.addLayer(jrcMaxVectors, {}, 'Water polygons');

// ----------------------------
// Export GeoJSONs
// ----------------------------

// Water mask polygons
Export.table.toDrive({
  collection: jrcMaxVectors,
  description: 'JRCmax_mask_polygons',
  fileFormat: 'GeoJSON'
});

// Bounding box
Export.table.toDrive({
  collection: bboxCollection,
  description: 'ROI_bounding_box',
  fileFormat: 'GeoJSON'
});
