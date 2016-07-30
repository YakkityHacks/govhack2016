const request = require( 'request' ).defaults( {
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
    lat: -27.4976785,
    lng: 153.0141404,
};

var b = {
    "mid": "mid.1469851462949:7d941e2bfb608a9989",
    "seq": 57,
    "attachments": [ {
        "title": "Pablo's Location",
        "url": "https://www.facebook.com/l.php?u=https%3A%2F%2Fwww.bing.com%2Fmaps%2Fdefault.aspx%3Fv%3D2%26pc%3DFACEBK%26mid%3D8100%26where1%3D-27.497312%252C%2B153.015008%26FORM%3DFBKPL1%26mkt%3Den-US&h=OAQHHo_hN&s=1&enc=AZN6jVdV0FmOtl02IrhuWBoZ2myVGQy37ROzhWmrbamjFhoch9GyyVIw_vp8FTeKoaxYtC7Aqx5mKVcCGCSzR1Rphtpk7_dxyK-OWXOvINRctg",
        "type": "location",
        "payload": {
            "coordinates": {
                "lat": -27.497312,
                "long": 153.015008
            }
        }
    } ]
};

var qs = {
    key: 'WMGj4AkJOg+iLtT8qhha',
    // address: '24 Bruce Road Glenbrook NSW 2773',
    // radius: 400,
    top_right_lat: coords.lat + COOORD_WIDTH / 2,
    top_right_lng: coords.lng + COOORD_WIDTH / 2,
    bottom_left_lat: coords.lat - COOORD_WIDTH / 2,
    bottom_left_lng: coords.lng - COOORD_WIDTH / 2,
};
console.log( qs );
request.get( 'https://api.planningalerts.org.au/applications.js', {
    qs: qs
}, ( error, response, body ) => {
    if ( error ) throw error;
    console.log( JSON.stringify( body, null, '    ' ) );
    console.log('Count', body.length);
    var count = 0;
    body = body.filter(item => count++ < 2);
    console.log('Count', body.length);
} );