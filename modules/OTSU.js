/**
 * OTSU.js
 * Fast Otsu threshold module (Liao et al., 2001)
 *
 * This version relies on HIST.js for histogram creation.
 *
 * Exports:
 *   - otsuFromHistogram(hist, opts)
 *   - computeOtsuThreshold(image, bandName, roi, scale, opts, callback)
 *
 * Notes:
 *   - HIST.uniformHistogram returns a client-side histogram object {x:[], n:[], meta:{}}
 *   - Otsu here is computed client-side from that histogram
 *   - Works for uniform histograms and any histogram with numeric bin centers in hist.x
 */

// ============================================================================================
// DEPENDENCY
// ============================================================================================

var HIST = require('users/pollycheung43/aeo-paper:modules/HIST.js');

// ============================================================================================
// 1) OTSU ON A GENERAL HISTOGRAM (CLIENT-SIDE)
// ============================================================================================

exports.otsuFromHistogram = function(hist, opts) {

  opts = opts || {};

  if (!hist || !hist.x || !hist.n || hist.x.length < 2 || hist.n.length < 2) {
    return null;
  }

  var counts = hist.n;
  var values = hist.x;
  var N = counts.length;

  // total count
  var total = 0;
  for (var i = 0; i < N; i++) total += counts[i];
  if (total <= 0) return null;

  // cumulative weight and cumulative mean (use values, not indices)
  var P = [];
  var S = [];

  var p0 = counts[0] / total;
  P[0] = p0;
  S[0] = values[0] * p0;

  for (var i = 1; i < N; i++) {
    var pi = counts[i] / total;
    P[i] = P[i - 1] + pi;
    S[i] = S[i - 1] + (values[i] * pi);
  }

  var muT = S[N - 1];

  var maxVar = -1;
  var bestIdx = 0;

  for (var t = 0; t < N - 1; t++) {
    var w1 = P[t];
    var w2 = 1 - w1;
    if (w1 < 1e-6 || w2 < 1e-6) continue;

    var mu1 = S[t] / w1;
    var mu2 = (muT - S[t]) / w2;

    // between-class variance
    var varBetween = w1 * w2 * (mu1 - mu2) * (mu1 - mu2);

    if (varBetween > maxVar) {
      maxVar = varBetween;
      bestIdx = t;
    }
  }

  var thr = values[bestIdx];

  if (opts.log) {
    print('OTSU from histogram, bins:', N);
    if (hist.meta) print('OTSU hist meta:', hist.meta);
    print('OTSU threshold computed:', thr);
  }

  return thr;
};

// ============================================================================================
// 2) CONVENIENCE WRAPPER: IMAGE -> HIST (via HIST.js) -> OTSU (CLIENT-SIDE) -> CALLBACK
// ============================================================================================

exports.computeOtsuThreshold = function(image, bandName, roi, scale, opts, callback) {

  // Allow opts to be optional
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  opts = opts || {};

  // If user did not pass histogram options, HIST.js will use its own defaults.
  HIST.uniformHistogram(image, bandName, roi, scale, opts, function(hist) {

    if (!hist) {
      print('Error: histogram creation failed.');
      callback(null);
      return;
    }

    var thr = exports.otsuFromHistogram(hist, {log: opts.log});

    callback(thr);
  });
};
