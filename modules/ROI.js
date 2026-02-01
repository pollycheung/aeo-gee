/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = 
    /* color: #98ff00 */
    /* displayProperties: [
      {
        "type": "rectangle"
      },
      {
        "type": "marker"
      },
      {
        "type": "marker"
      }
    ] */
    ee.Geometry({
      "type": "GeometryCollection",
      "geometries": [
        {
          "type": "Polygon",
          "coordinates": [
            [
              [
                5.033779617097998,
                52.1980956522916
              ],
              [
                5.033779617097998,
                52.19025629626597
              ],
              [
                5.047126289156103,
                52.19025629626597
              ],
              [
                5.047126289156103,
                52.1980956522916
              ]
            ]
          ],
          "geodesic": false,
          "evenOdd": true
        },
        {
          "type": "Point",
          "coordinates": [
            5.033559250740756,
            52.190276970447925
          ]
        },
        {
          "type": "Point",
          "coordinates": [
            5.047292160897006,
            52.19814262705208
          ]
        }
      ],
      "coordinates": []
    });
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// Naardermeer ROI + helper to draw dashed outline.


exports.bboxBIG = ee.Geometry.Polygon([[
  [5.02, 52.26],
  [5.12, 52.26],
  [5.12, 52.18],
  [5.02, 52.18]
]]);


exports.bboxSMALL = ee.Geometry.Polygon([[
  [5.033559250740756, 52.190276970447925],
  [5.047292160897006, 52.190276970447925],
  [5.047292160897006, 52.19814262705208],
  [5.033559250740756, 52.19814262705208]
]]);

exports.drawOutline_tomap = function(bbox,opts) {

  opts = opts || {};

  var color = opts.color || 'red';
  var width = opts.width || 2;
  var lineType = opts.lineType || 'dashed';
  var name = opts.name || 'ROI (outline)';

  var outline = ee.FeatureCollection([ee.Feature(bbox)]).style({
    color: color,
    fillColor: '00000000',
    width: width,
    lineType: lineType
  });

  Map.addLayer(outline, {}, name);
};
