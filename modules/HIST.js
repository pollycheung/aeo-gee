/**
 * HIST.js
 * Uniform histogram utilities
 */

var HIST_MIN  = -1;
var HIST_MAX  =  1;
var HIST_BINS = 128;

// ============================================================================================
// 1. BUILD UNIFORM HISTOGRAM (CLIENT-SIDE RETURN)
// ============================================================================================

exports.uniformHistogram = function(image, bandName, roi, scale, opts, callback) {

  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  opts = opts || {};

  var bins = (opts.bins !== undefined) ? opts.bins : HIST_BINS;
  var hmin = (opts.min  !== undefined) ? opts.min  : HIST_MIN;
  var hmax = (opts.max  !== undefined) ? opts.max  : HIST_MAX;

  scale = scale || 20;

  var histDict = image.select(bandName).reduceRegion({
    reducer: ee.Reducer.fixedHistogram(hmin, hmax, bins),
    geometry: roi,
    scale: scale,
    bestEffort: true,
    maxPixels: 1e13
  });

  // --- ALWAYS-ON SPINNER TRIGGER ---
  // Printing a server-side object forces a tracked request and shows "Computing".
  print('Computing Histogram (' + bandName + ')...', histDict);

  histDict.get(bandName).evaluate(function(histData) {

    if (!histData || histData.length < 2) {
      callback(null);
      return;
    }

    callback({
      x: histData.map(function(b) { return b[0]; }), // bin centers
      n: histData.map(function(b) { return b[1]; }), // counts
      meta: { min: hmin, max: hmax, bins: bins, scale: scale }
    });
  });
};


// ============================================================================================
// 2. BAR HISTOGRAM PLOT (CLIENT-SIDE)
// ============================================================================================

exports.plotUniformHistogram = function(hist, opts) {

  if (!hist) {
    print('No histogram data to plot.');
    return;
  }

  opts = opts || {};
  var title = opts.title || 'Histogram';
  var color = opts.color || '#1f77b4';

  var table = [['x', 'count']];

  for (var i = 0; i < hist.x.length; i++) {
    table.push([hist.x[i], hist.n[i]]);
  }

  var chart = ui.Chart(table)
    .setChartType('ColumnChart')
    .setOptions({
      title: title,
      hAxis: { title: 'Value' },
      vAxis: { title: 'Count' },
      legend: 'none',
      colors: [color],
      bar: { groupWidth: '95%' }
    });

  print(chart);
};

