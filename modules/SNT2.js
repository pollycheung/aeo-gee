/**
 * S2_MNDWI.js
 * Sentinel-2 SR Harmonized, quarter-based median MNDWI builder.
 *
 * Inputs:
 *   - roi: ee.Geometry
 *   - quarter: 1..4
 *   - fromYear: number
 *   - toYear: optional number (defaults to fromYear)
 *
 * Output:
 *   - ee.Image with band name 'MNDWI' (median over the selected quarter interval)
 */

// ============================================================================================
// 1. QUARTER DATE HELPERS
// ============================================================================================

function pad2(n) {
  return (n < 10) ? ('0' + n) : ('' + n);
}

function quarterStartEnd(year, quarter) {
  var startMonth = (quarter - 1) * 3 + 1;     // 1,4,7,10
  var endMonth = startMonth + 2;             // 3,6,9,12

  var start = ee.Date.fromYMD(year, startMonth, 1);
  var end = start.advance(3, 'month');       // exclusive end for filterDate

  return { start: start, end: end };
}

// ============================================================================================
// 2. SENTINEL-2 QUARTERLY MEDIAN MNDWI
// ============================================================================================

exports.getMedianMNDWI = function(roi, quarter, fromYear, toYear, opts) {

  opts = opts || {};
  var cloudPct = (opts.cloudPct !== undefined) ? opts.cloudPct : 30;
  var scale = (opts.scale !== undefined) ? opts.scale : 20;

  toYear = (toYear === undefined || toYear === null) ? fromYear : toYear;

  var start = quarterStartEnd(fromYear, quarter).start;
  var end = quarterStartEnd(toYear, quarter).end;

  var mndwi = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(roi)
    .filterDate(start, end)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', cloudPct))
    .map(function(img) {
      return img.normalizedDifference(['B3', 'B11']).rename('MNDWI').clip(roi);
    })
    .median()
    .clip(roi);

  return mndwi;
};
