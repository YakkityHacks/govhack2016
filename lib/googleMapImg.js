'use strict';

const GoogleMapsAPI = require('googlemaps'),
envVars = require( './envVars.js' );

var publicConfig = {
  key: envVars.GOOGLE_MAPS_API_KEY,
  stagger_time:       1000, // for elevationPath
  encode_polylines:   false,
  secure:             true, // use https
  };

  var gmAPI = new GoogleMapsAPI(publicConfig);

let googleMapImg = {
  /*
    Get image URL of a map
  */
  getMapImageUrl: function(lat, lon) {

    var params = {
      center: lat + ',' + lon,
      zoom: 15,
      size: '800x600',
      maptype: 'roadmap',
      markers: [
        {
          location: lat + ',' + lon,
          color   : 'yellow'
        }
      ],
      style: [
        {
          feature: 'road',
          element: 'all',
          rules: {
            hue: '0x00ff00'
          }
        }
      ]
    };

    return gmAPI.staticMap(params); // return static map URL
  },

  /*
    Get image URL of street view
  */
  getStreetViewImageUrl: function(lat, lon) {
    var params = {
      location: lat + ',' + lon,
      size: '800x600',
      heading: 108.4,
      pitch: 7,
      fov: 40
    };
    return gmAPI.streetView(params);
  }
};

module.exports = googleMapImg;
