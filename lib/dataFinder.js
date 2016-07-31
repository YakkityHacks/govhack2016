'use strict';
/* global module, console, require, __dirname */

const csv = require( 'csv-parser' ),
    fs = require( 'fs' ),
    xml2js = require( 'xml2js' ),
    xmlparser = new xml2js.Parser();

var logan = {};
var geelong = {};

//Data from http://data.logancity.opendata.arcgis.com/datasets?q=building+works&sort_by=relevance
fs.createReadStream( __dirname + '/../data/Logan_City_Building_Works.csv' )
    .pipe( csv() )
    .on( 'data', function ( data ) {
        //NFI why I had to do this.
        var applicationNumber = data[ Object.keys( data )[ 0 ] ];
        logan[ applicationNumber ] = data;
    } );

fs.readFile( __dirname + '/../data/geelong-adplanning-all.xml', function ( error, data ) {
    if ( error ) throw error;
    xmlparser.parseString( data, function ( error, result ) {
        if ( error ) throw error;
        result.rss.channel[ 0 ].item.forEach( item => {
            geelong[ item.GUID ] = item;
        } );
    } );
} );

module.exports = {

    findMoreData: function ( item, callback ) {
        var key = item.application.council_reference;
        var loganKey = key ? key.replace( '-', '/' ) : null;
        if ( loganKey && logan[ loganKey ] ) {
            console.log( 'Found Logan data', loganKey );
            item.data = logan[ loganKey ];
            item.data.status = item.data.Status;
        }
        if ( geelong[ key ] ) {
            console.log( 'Found Gelong data', key );
            item.data = geelong[ key ];
            item.data.status = 'Open';
        }
        callback( null, item );
    },

};