var ROI = require('users/pollycheung43/aeo-paper:modules/ROI.js');
var OTSU = require('users/pollycheung43/aeo-paper:modules/OTSU.js');
var HIST = require('users/pollycheung43/aeo-paper:modules/HIST.js');
var SNT2 = require('users/pollycheung43/aeo-paper:modules/SNT2.js');


// big ROI
/*var bbox = ROI.bboxBIG; var bboxName='BIG';
var fromYear = 2017;
var toYear   = 2025;
var numBins = 1024;
*/

// small ROI
var bbox = ROI.bboxSMALL; var bboxName='SMALL';
var fromYear = 2017;
var toYear   = 2025;
var numBins = 1024;


ROI.drawOutline_tomap(bbox);

var quarters = [1, 2, 3, 4];
var thresholds = {};   // {1:thr, 2:thr, 3:thr, 4:thr}

function whenAllReady() {
  if (Object.keys(thresholds).length !== quarters.length) return;

  var info = 'OTSU Quarter Thresholds ' + fromYear + '-' + toYear;

  var result = {
    info: info,
    bins: numBins,
    bbox: bboxName,
    fromYear: fromYear,
    toYear: toYear,
    thresholds: {
      Q1: thresholds[1],
      Q2: thresholds[2],
      Q3: thresholds[3],
      Q4: thresholds[4]
    }
  };

  print(JSON.stringify(result, null, 2));
}

// Loop
quarters.forEach(function(q) {

  var mndwiQ = SNT2.getMedianMNDWI(bbox, q, fromYear, toYear);

  HIST.uniformHistogram(
    mndwiQ,
    'MNDWI',
    bbox,
    20,
    { bins: numBins },
    function(hist) {

      var thr = OTSU.otsuFromHistogram(hist);

      thresholds[q] = thr;

      whenAllReady();
    }
  );
});


Map.centerObject(bbox, 12);
