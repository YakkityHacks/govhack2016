const csv = require( 'csv-parser' ),
    fs = require( 'fs' ),
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
    lat: -27.694530,
    lng: 153.152546,
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
        var loganKey = item.application.council_reference ? item.application.council_reference.replace( '-', '/' ) : null;
        if ( loganKey && logan[ loganKey ] ) {
            console.log( loganKey, item.application.council_reference );
            item.data = logan[ loganKey ];
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

    // body = body.filter( item => !!item.data );

    console.log( JSON.stringify( body[0], null, '    ' ) );
    console.log( 'Count', body.length );
} );