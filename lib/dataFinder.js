'use strict';
/* global module, console, require */

const csv = require( 'csv-parser' ),
    fs = require( 'fs' );

var logan = {};

//Data from http://data.logancity.opendata.arcgis.com/datasets?q=building+works&sort_by=relevance
fs.createReadStream( '../data/Logan_City_Building_Works.csv' )
    .pipe( csv() )
    .on( 'data', function ( data ) {
        //NFI why I had to do this.
        var applicationNumber = data[ Object.keys( data )[ 0 ] ];
        logan[ applicationNumber ] = data;
    } );


module.exports = {

    findMoreData: function ( item, callback ) {
        var loganKey = item.application.council_reference ? item.application.council_reference.replace( '-', '/' ) : null;
        if ( loganKey && logan[ loganKey ] ) {
            console.log( loganKey, item.application.council_reference );
            item.data = logan[ loganKey ];
            item.data.status = item.data.Status;
        }
        callback(null, item);
    },

};