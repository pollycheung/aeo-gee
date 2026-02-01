# AEO Paper — Earth Engine Scripts

This repository contains the Google Earth Engine (GEE) scripts used to compute MNDWI‑based water masks, derive OTSU thresholds, and evaluate accuracy against the JRC reference product. The workflow is modular: ROIs and processing utilities live in `modules/`, while entry-point scripts (`get_*.js`) run specific experiments and export JSON summaries for the paper.

## General Idea
1. **Define regions of interest** (`modules/ROI.js`): a full study area (`bboxBIG`) and a focal subset (`bboxSMALL`).
2. **Compute quarterly MNDWI** (Q1–Q4) over a specified year range using `modules/SNT2.js`.
3. **Derive OTSU thresholds**  `get_otsu.js` loads `modules/OTSU.js` which derives OTSU threshold from MNDWI histograms build via `modules/HIST.js` 
4. **Evaluate against JRC** `get_kappa.js` obtain confusion‑matrix, and Cohen’s kappa w.r.t. JRC occurences (`modules/JRC.js`)

## Scripts
### `get_otsu.js`
Computes per‑quarter OTSU thresholds from MNDWI histograms for either `bboxBIG` or `bboxSMALL`. The script prints a JSON object to the console. Due to GEE limitations (no direct file writes), this JSON is **manually copied** into:
- `thresholds/BIG.js`
- `thresholds/SMALL.js`

### `get_kappa.js`
Generates per‑quarter evaluation statistics using the thresholds in `thresholds/*.js` and the JRC reference from `modules/JRC.js`. Outputs JSON with:
- FP, FN, TP, TN (areas)
- Cohen’s kappa

### `get_histogram.js`
Plots Q1 MNDWI histograms for both ROIs using `modules/HIST.js`. Useful for diagnostic plots and for validating the histogram binning used by OTSU.

## Modules
- `modules/ROI.js`: ROI definitions (`bboxBIG`, `bboxSMALL`)
- `modules/JRC.js`: JRC reference products (occurrence, max extent)
- `modules/SNT2.js`: Sentinel‑2 MNDWI processing and quarterly medians
- `modules/HIST.js`: histogram utilities + plotting
- `modules/OTSU.js`: OTSU thresholding (depends on `HIST.js`)

## Thresholds
Thresholds are stored as JS modules for easy reuse in GEE (Each exports a `context` object containing `fromYear`, `toYear`, `bins`, and per‑quarter thresholds)
- `thresholds/BIG.js`

```json
{
  "info": "(BIG) OTSU Quarter Thresholds 2017-2025",
  "bins": 1024,
  "bbox": "BIG",
  "fromYear": 2017,
  "toYear": 2025,
  "thresholds": {
    "Q1": 0.037109375,
    "Q2": 0.033203125,
    "Q3": 0.03125,
    "Q4": 0.03125
  }
}
```

- `thresholds/SMALL.js`

```json
{
  "info": "(SMALL) OTSU Quarter Thresholds 2017-2025",
  "bins": 1024,
  "bbox": "SMALL",
  "fromYear": 2017,
  "toYear": 2025,
  "thresholds": {
    "Q1": 0.05859375,
    "Q2": 0.056640625,
    "Q3": 0.056640625,
    "Q4": 0.052734375
  }
}
```


## Results

FP,FN are false positive and false negative percentages of OTSU based classification (% of area which, according to JRC occurence statistics, corresponds to misclassified water/non-water). KAPPA is Cohen’s kappa statistic. sFP,sFN,sKAPPA are the same statistics but computed using a static MNDWI threshold of 0.0 for all quarters.

* `results/big.json`

```json
{
  "info": "(BIG) OTSU Quarter Thresholds 2017-2025",
  "bins": 1024,
  "fromYear": 2017,
  "toYear": 2025,
  "FP": {
    "Q1": 1.1124788941209507,
    "Q2": 1.1976598622694634,
    "Q3": 1.1851465783212178,
    "Q4": 1.1766649067557013
  },
  "FN": {
    "Q1": 1.056155270672028,
    "Q2": 1.025068199175833,
    "Q3": 1.0299132871953216,
    "Q4": 1.0343563071313093
  },
  "KAPPA": {
    "Q1": 0.9421526035912343,
    "Q2": 0.940801691330398,
    "Q3": 0.9409922470651786,
    "Q4": 0.941089668167407
  },
  "sFP": {
    "Q1": 1.4769889550320552,
    "Q2": 1.5084800754506018,
    "Q3": 1.4887024866982723,
    "Q4": 1.4826429675714123
  },
  "sFN": {
    "Q1": 0.8886123378384363,
    "Q2": 0.8918416362171482,
    "Q3": 0.9019343960361901,
    "Q4": 0.9051662297912775
  },
  "sKAPPA": {
    "Q1": 0.9373442717542582,
    "Q2": 0.9364485035191252,
    "Q3": 0.936679822677127,
    "Q4": 0.9367469169187422
  }
}
```

* `results/small.json`

```json
{
  "info": "(SMALL) OTSU Quarter Thresholds 2017-2025",
  "bins": 1024,
  "fromYear": 2017,
  "toYear": 2025,
  "FP": {
    "Q1": 2.3205949674290345,
    "Q2": 2.4703110018090735,
    "Q3": 2.4403690160750906,
    "Q4": 2.380480373236581
  },
  "FN": {
    "Q1": 4.060326343262777,
    "Q2": 3.970491884203647,
    "Q3": 4.03038100515535,
    "Q4": 4.03038100515535
  },
  "KAPPA": {
    "Q1": 0.8338188422271576,
    "Q2": 0.8327452610046442,
    "Q3": 0.8317848512295832,
    "Q4": 0.8332208082051522
  },
  "sFP": {
    "Q1": 4.012362138379384,
    "Q2": 4.042303763203018,
    "Q3": 4.042303763203018,
    "Q4": 4.042303763203018
  },
  "sFN": {
    "Q1": 3.203936843256703,
    "Q2": 3.2039386403669963,
    "Q3": 3.2039386403669963,
    "Q4": 3.2937675908924033
  },
  "sKAPPA": {
    "Q1": 0.8176968816996587,
    "Q2": 0.8170048885336331,
    "Q3": 0.8170048885336331,
    "Q4": 0.8145404362745611
  }
}
```
