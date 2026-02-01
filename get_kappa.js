var ROI  = require('users/pollycheung43/aeo-paper:modules/ROI.js');
var JRC  = require('users/pollycheung43/aeo-paper:modules/JRC.js');
var HIST = require('users/pollycheung43/aeo-paper:modules/HIST.js');
var OTSU = require('users/pollycheung43/aeo-paper:modules/OTSU.js');
var SNT2 = require('users/pollycheung43/aeo-paper:modules/SNT2.js');

// ----------------------------
// Context (fixed thresholds)
// ----------------------------
var context = require('users/pollycheung43/aeo-paper:/thresholds/SMALL.js').context;
var bbox = ROI.bboxSMALL;
Map.centerObject(bbox, 12);

// ----------------------------
// Layers
// ----------------------------
var JRCmax_mask = JRC.GetMaxMask(bbox);

var JRCocc_mask = JRC.GetOccurrenceMask(bbox);
ROI.drawOutline_tomap(bbox);
Map.addLayer(JRCmax_mask, {palette: ['0000FF']}, 'JRCmax');
Map.addLayer(JRCocc_mask, {palette: ['00FF00']}, 'JRCocc');

// ----------------------------
// JRC max water area (spinner)
// ----------------------------
var WaterJRCmax = JRC.GetMaxWaterArea_m2(bbox);
print('Computing JRC max water area...', WaterJRCmax);

// ----------------------------
// Quarter loop
// ----------------------------
var quarters = [1, 2, 3, 4];

// quick visual reference
var mndwiQ_vis = SNT2.getMedianMNDWI(bbox, 1, context.fromYear, context.toYear);
Map.addLayer(mndwiQ_vis, {min: -0.5, max: 0.5, palette: ['000000', 'FF0000']}, 'MNDWI Q1 (red)');
Map.addLayer(mndwiQ_vis.gt(0).selfMask(), {palette: ['FF0000']}, 'MNDWI > 0 (red mask)');

// JRC occurrence water reference as 0/1 everywhere inside bbox
var jrcOcc01 = JRC.GetOccurrenceMask(bbox).unmask(0).rename('jrcOcc01');

// Areas of reference classes (m²)
var pixArea = ee.Image.pixelArea();

var areaTotal_m2 = ee.Number(
  pixArea.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: bbox,
    scale: 30,
    bestEffort: true,
    maxPixels: 1e13
  }).get('area')
);

areaTotal_m2 = ee.Number(ee.Algorithms.If(areaTotal_m2, areaTotal_m2, 0));
print('Computing total bbox area (m²)...', areaTotal_m2);


// ----------------------------
// Storage (client-side, per quarter)
// FP, FN are reported as % of area(JRC water), same convention as before
// Kappa is dimensionless [-1..1]
// ----------------------------
var FP = [null, null, null, null];
var FN = [null, null, null, null];
var KAPPA = [null, null, null, null];

var sFP = [null, null, null, null];
var sFN = [null, null, null, null];
var sKAPPA = [null, null, null, null];

function whenAllReady() {
  for (var i = 0; i < 4; i++) {
    if (FP[i] === null || FN[i] === null || KAPPA[i] === null) return;
    if (sFP[i] === null || sFN[i] === null || sKAPPA[i] === null) return;
  }

  var out = {
    info: context.info,
    bins: context.bins,
    fromYear: context.fromYear,
    toYear: context.toYear,
    FP: { Q1: FP[0], Q2: FP[1], Q3: FP[2], Q4: FP[3] },
    FN: { Q1: FN[0], Q2: FN[1], Q3: FN[2], Q4: FN[3] },
    KAPPA: { Q1: KAPPA[0], Q2: KAPPA[1], Q3: KAPPA[2], Q4: KAPPA[3] },
    sFP: { Q1: sFP[0], Q2: sFP[1], Q3: sFP[2], Q4: sFP[3] },
    sFN: { Q1: sFN[0], Q2: sFN[1], Q3: sFN[2], Q4: sFN[3] },
    sKAPPA: { Q1: sKAPPA[0], Q2: sKAPPA[1], Q3: sKAPPA[2], Q4: sKAPPA[3] }
  };

  print(JSON.stringify(out, null, 2));

  // Plot 1: FP vs sFP
  var tFP = [
    ['Quarter', 'FP', 'sFP'],
    ['Q1', FP[0], sFP[0]],
    ['Q2', FP[1], sFP[1]],
    ['Q3', FP[2], sFP[2]],
    ['Q4', FP[3], sFP[3]]
  ];
  print(
    ui.Chart(tFP).setChartType('ColumnChart').setOptions({
      title: 'FP (% of JRC water area) ' + context.fromYear + '-' + context.toYear,
      hAxis: { title: 'Quarter' },
      vAxis: { title: '% of JRC water area' },
      legend: { position: 'top' },
      bar: { groupWidth: '70%' }
    })
  );

  // Plot 2: FN vs sFN
  var tFN = [
    ['Quarter', 'FN', 'sFN'],
    ['Q1', FN[0], sFN[0]],
    ['Q2', FN[1], sFN[1]],
    ['Q3', FN[2], sFN[2]],
    ['Q4', FN[3], sFN[3]]
  ];
  print(
    ui.Chart(tFN).setChartType('ColumnChart').setOptions({
      title: 'FN (% of JRC water area) ' + context.fromYear + '-' + context.toYear,
      hAxis: { title: 'Quarter' },
      vAxis: { title: '% of JRC water area' },
      legend: { position: 'top' },
      bar: { groupWidth: '70%' }
    })
  );

  // Plot 3: Kappa vs sKappa
  var tK = [
    ['Quarter', 'KAPPA', 'sKAPPA'],
    ['Q1', KAPPA[0], sKAPPA[0]],
    ['Q2', KAPPA[1], sKAPPA[1]],
    ['Q3', KAPPA[2], sKAPPA[2]],
    ['Q4', KAPPA[3], sKAPPA[3]]
  ];
  print(
    ui.Chart(tK).setChartType('ColumnChart').setOptions({
      title: 'Cohen\'s Kappa ' + context.fromYear + '-' + context.toYear,
      hAxis: { title: 'Quarter' },
      vAxis: { title: 'Kappa' },
      legend: { position: 'top' },
      bar: { groupWidth: '70%' }
    })
  );
}

// Helper: compute kappa from areas
function kappaFromAreas(tp, fp, fn, tn) {
  var total = tp.add(fp).add(fn).add(tn);

  var po = tp.add(tn).divide(total);

  var predYes = tp.add(fp);
  var predNo  = fn.add(tn);
  var refYes  = tp.add(fn);
  var refNo   = fp.add(tn);

  var pe = predYes.multiply(refYes).add(predNo.multiply(refNo)).divide(total.multiply(total));

  var k = po.subtract(pe).divide(ee.Number(1).subtract(pe));
  k = ee.Number(ee.Algorithms.If(ee.Algorithms.IsEqual(k, null), 0, k));
  return k;
}

quarters.forEach(function(q) {

  var thrDyn = context.thresholds['Q' + q];
  var thr0 = 0;

  var mndwiQ = SNT2.getMedianMNDWI(bbox, q, context.fromYear, context.toYear);

  // predicted water masks (unmasked 0/1 images)
  var predDyn = mndwiQ.gt(thrDyn).unmask(0).rename('pred');
  var pred0   = mndwiQ.gt(thr0).unmask(0).rename('pred');

  // reference masks (0/1)
  var ref = jrcOcc01.rename('ref');

  // confusion masks as 0/1 images
  var tpDyn = predDyn.eq(1).and(ref.eq(1)).rename('c');
  var fpDyn = predDyn.eq(1).and(ref.eq(0)).rename('c');
  var fnDyn = predDyn.eq(0).and(ref.eq(1)).rename('c');
  var tnDyn = predDyn.eq(0).and(ref.eq(0)).rename('c');

  var tp0 = pred0.eq(1).and(ref.eq(1)).rename('c');
  var fp0 = pred0.eq(1).and(ref.eq(0)).rename('c');
  var fn0 = pred0.eq(0).and(ref.eq(1)).rename('c');
  var tn0 = pred0.eq(0).and(ref.eq(0)).rename('c');

  // areas (m²)
  function areaM2(mask01, label) {
    var a = ee.Number(
      mask01.selfMask().multiply(pixArea).reduceRegion({
        reducer: ee.Reducer.sum(),
        geometry: bbox,
        scale: 20,
        bestEffort: true,
        maxPixels: 1e13
      }).get('c')
    );
    a = ee.Number(ee.Algorithms.If(ee.Algorithms.IsEqual(a, null), 0, a));
    print(label + ' Q' + q + '...', a);
    return a;
  }

  var tpDyn_m2 = areaM2(tpDyn, 'Computing TP (dyn)');
  var fpDyn_m2 = areaM2(fpDyn, 'Computing FP (dyn)');
  var fnDyn_m2 = areaM2(fnDyn, 'Computing FN (dyn)');
  var tnDyn_m2 = areaM2(tnDyn, 'Computing TN (dyn)');

  var tp0_m2 = areaM2(tp0, 'Computing TP (thr=0)');
  var fp0_m2 = areaM2(fp0, 'Computing FP (thr=0)');
  var fn0_m2 = areaM2(fn0, 'Computing FN (thr=0)');
  var tn0_m2 = areaM2(tn0, 'Computing TN (thr=0)');

  // FP and FN as % of reference total area (areaTotal_m2), same convention you used earlier
  var fpPctDyn = fpDyn_m2.divide(areaTotal_m2).multiply(100);
  var fnPctDyn = fnDyn_m2.divide(areaTotal_m2).multiply(100);

  var fpPct0 = fp0_m2.divide(areaTotal_m2).multiply(100);
  var fnPct0 = fn0_m2.divide(areaTotal_m2).multiply(100);

  // Kappa
  var kDyn = kappaFromAreas(tpDyn_m2, fpDyn_m2, fnDyn_m2, tnDyn_m2);
  var k0   = kappaFromAreas(tp0_m2, fp0_m2, fn0_m2, tn0_m2);

  fpPctDyn.evaluate(function(v) { FP[q - 1] = v; whenAllReady(); });
  fnPctDyn.evaluate(function(v) { FN[q - 1] = v; whenAllReady(); });
  kDyn.evaluate(function(v)     { KAPPA[q - 1] = v; whenAllReady(); });

  fpPct0.evaluate(function(v) { sFP[q - 1] = v; whenAllReady(); });
  fnPct0.evaluate(function(v) { sFN[q - 1] = v; whenAllReady(); });
  k0.evaluate(function(v)     { sKAPPA[q - 1] = v; whenAllReady(); });
});
