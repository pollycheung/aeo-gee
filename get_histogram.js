var ROI  = require('users/pollycheung43/aeo-paper:modules/ROI.js');
var HIST = require('users/pollycheung43/aeo-paper:modules/HIST.js');
var SNT2 = require('users/pollycheung43/aeo-paper:modules/SNT2.js');

var ctxBIG = require('users/pollycheung43/aeo-paper:thresholds/BIG.js').context;
var ctxSMALL = require('users/pollycheung43/aeo-paper:thresholds/SMALL.js').context;

var bboxBIG = ROI.bboxBIG;
var bboxSMALL = ROI.bboxSMALL;

var mndwiBig = SNT2.getMedianMNDWI(bboxBIG, 1, ctxBIG.fromYear, ctxBIG.toYear);
var mndwiSmall = SNT2.getMedianMNDWI(bboxSMALL, 1, ctxSMALL.fromYear, ctxSMALL.toYear);

HIST.uniformHistogram(mndwiBig, 'MNDWI', bboxBIG, 20, { bins: ctxBIG.bins }, function(hist) {
  HIST.plotUniformHistogram(hist, { title: 'BIG Q1 MNDWI', color: '#1f77b4' });
});

HIST.uniformHistogram(mndwiSmall, 'MNDWI', bboxSMALL, 20, { bins: ctxSMALL.bins }, function(hist) {
  HIST.plotUniformHistogram(hist, { title: 'SMALL Q1 MNDWI', color: '#ff7f0e' });
});
