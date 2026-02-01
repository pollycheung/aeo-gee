/**
 * JRC.js
 * Reference water products from JRC Global Surface Water
 * - long-term max extent
 * - long-term occurrence mask
 */

// ============================================================================================
// GLOBALS
// ============================================================================================

// Occurrence threshold (%)
var OCCURRENCE_THR = 50;

// JRC datasets
var GSW_STATIC  = ee.Image('JRC/GSW1_4/GlobalSurfaceWater');
var GSW_MONTHLY = ee.ImageCollection('JRC/GSW1_4/MonthlyHistory');


// ============================================================================================
// 1) LONG-TERM PRODUCTS
// ============================================================================================

// ---- Max extent (ever water) ----
exports.GetMaxMask = function(roi) {

  var maxExtent = GSW_STATIC
    .select('max_extent')
    .clip(roi);

  return maxExtent.updateMask(maxExtent);
};


// ---- Occurrence water mask (> threshold %) ----
exports.GetOccurrenceMask = function(roi) {

  var occurrence = GSW_STATIC
    .select('occurrence')
    .clip(roi);

  var mask = occurrence.gt(OCCURRENCE_THR);

  return mask.updateMask(mask);
};

// ============================================================================================
// 2) WATER SURFACE AREA FROM MAX EXTENT (m²)
// ============================================================================================

exports.GetMaxWaterArea_m2 = function(roi, scale) {

  scale = scale || 30;

  var maxMask = exports.GetMaxMask(roi);

  var areaImage = maxMask.multiply(ee.Image.pixelArea());

  var area = areaImage.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: roi,
    scale: scale,
    bestEffort: true,
    maxPixels: 1e13
  });

  return ee.Number(area.get('max_extent'));
};
