const csv = require( 'csv-parser' ),
    fs = require( 'fs' ),
    xml2js = require( 'xml2js' ),
    request = require( 'request' ).defaults( {
        json: true,
    } );

const COOORD_WIDTH = 0.01; //1.11km

var coords = {
    // lat: -27.468217,
    // lng: 153.0590176,

    // nsw
    // lat: -29.113775,
    // lng: 153.325195,

    // bne
    // lat: -27.468217,
    // lng: 153.0590176,

    // uni
    // lat: -27.4976785,
    // lng: 153.0141404,

    // logan
    // lat: -27.694530,
    // lng: 153.152546,

    // gelong
    lat: -38.0969637,
    lng: 144.334708,
};

var logan = {};
//Data from http://data.logancity.opendata.arcgis.com/datasets?q=building+works&sort_by=relevance
fs.createReadStream( './data/Logan_City_Building_Works.csv' )
    .pipe( csv() )
    .on( 'data', function ( data ) {
        //NFI why I had to do this.
        var applicationNumber = data[ Object.keys( data )[ 0 ] ];
        logan[ applicationNumber ] = data;
    } );

var geelong = {};
var xmlparser = new xml2js.Parser();
fs.readFile( './data/geelong-adplanning-all.xml', function ( error, data ) {
    if ( error ) throw error;
    xmlparser.parseString( data, function ( error, result ) {
        if ( error ) throw error;
        result.rss.channel[ 0 ].item.forEach( item => {
            geelong[ item.GUID ] = item;
        } );
    } );
} );

var qs = {
    key: 'WMGj4AkJOg+iLtT8qhha',
    // address: '24 Bruce Road Glenbrook NSW 2773',
    // radius: 400,
    top_right_lat: coords.lat + COOORD_WIDTH / 2,
    top_right_lng: coords.lng + COOORD_WIDTH / 2,
    bottom_left_lat: coords.lat - COOORD_WIDTH / 2,
    bottom_left_lng: coords.lng - COOORD_WIDTH / 2,
};
request.get( 'https://api.planningalerts.org.au/applications.js', {
    qs: qs
}, ( error, response, body ) => {
    if ( error ) throw error;
    console.log( 'Count', body.length );
    body.forEach( item => {
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
    } );

    var getDistance = ( coords, item ) => {
        var dx = coords.lng - item.application.lng;
        var dy = coords.lat - item.application.lat;
        var dist = Math.sqrt( Math.pow( dx, 2 ), Math.pow( dy, 2 ) );
        return dist;
    };
    body.sort( ( itemA, itemB ) => {
        return getDistance( coords, itemA ) - getDistance( coords, itemB );
    } );

    body = body.filter( item => !!item.data );

    console.log( JSON.stringify( body[ 0 ], null, '    ' ) );
    console.log( 'Count', body.length );
} );