'use strict';
/* global console, require, setTimeout */
const crypto = require( 'crypto' ),
    request = require( 'request' ),
    googleMapImg = require( './googleMapImg' ),
    envVars = require( './envVars.js' );

let messengerGeneric = {

    /*
     * Send a text message using the Send API.
     *
     */
    sendTextMessage( recipientId, messageText ) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: messageText,
                metadata: "DEVELOPER_DEFINED_METADATA"
            }
        };

        this.callSendAPI( messageData );
    },
    /*
     * Send an image using the Send API.
     *
     */
    sendImageMessage( recipientId, imageUrl ) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "image",
                    payload: {
                        url: imageUrl
                    }
                }
            }
        };
        this.callSendAPI( messageData );
    },

    /*
     * Send a Gif using the Send API.
     *
     */
    sendGifMessage( recipientId ) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "image",
                    payload: {
                        url: envVars.SERVER_URL + "/assets/pikachu.gif"
                    }
                }
            }
        };
        this.callSendAPI( messageData );
    },

    /*
     * Send audio using the Send API.
     *
     */
    sendAudioMessage( recipientId ) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "audio",
                    payload: {
                        url: envVars.SERVER_URL + "/assets/sample.mp3"
                    }
                }
            }
        };

        this.callSendAPI( messageData );
    },
    /*
     * Send a video using the Send API.
     *
     */
    sendVideoMessage( recipientId ) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "video",
                    payload: {
                        url: envVars.SERVER_URL + "/assets/allofus480.mov"
                    }
                }
            }
        };

        this.callSendAPI( messageData );
    },

    /*
     * Send a video using the Send API.
     *
     */
    sendFileMessage( recipientId ) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "file",
                    payload: {
                        url: envVars.SERVER_URL + "/assets/test.txt"
                    }
                }
            }
        };

        this.callSendAPI( messageData );
    },



    /*
     * Send a button message using the Send API.
     *
     */
    sendSingleApplication( recipientId, item ) {
        var application = item.application;
        var text = application.address + '\n' +
            '\nCouncil Ref: ' + application.council_reference +
            '\nDescription: ' + application.description +
            '\nDate received: ' + ( application.date_received ? application.date_received : 'unknown' ) +
            '\nDate received: ' + ( application.date_received ? application.date_received : 'unknown' ) +
            ( item.data ? '\nStatus: ' + item.data.status : '' ) +
            '';

        console.log( text );

        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: text,
                        buttons: [ {
                            type: "postback",
                            title: "Subscribe",
                            payload: JSON.stringify( {
                                command: 'SUBSCRIBE',
                                address: application.address
                            } )
                        }, {
                            type: "web_url",
                            url: application.info_url,
                            title: "Website"
                        } ]
                    }
                }
            }
        };
        if ( application.comment_url && application.comment_url.indexOf( 'http' ) !== -1 ) {
            messageData.message.attachment.payload.buttons.push( {
                type: "web_url",
                title: "Comment",
                url: application.comment_url,
            } );
        }

        //send image post
        this.sendImageMessage( recipientId, googleMapImg.getMapImageUrlByAddress( application.address ) );

        var that = this;
        setTimeout( function () {
            that.callSendAPI( messageData );
        }, 1000 );
    },

    /*
     * Send a Structured Message (Generic Message type) using the Send API.
     *
     */
    sendGenericMessage( recipientId ) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [ {
                            title: "rift",
                            subtitle: "Next-generation virtual reality",
                            item_url: "https://www.oculus.com/en-us/rift/",
                            image_url: envVars.SERVER_URL + "/assets/rift.png",
                            buttons: [ {
                                type: "web_url",
                                url: "https://www.oculus.com/en-us/rift/",
                                title: "Open Web URL"
                            }, {
                                type: "postback",
                                title: "Call Postback",
                                payload: "Payload for first bubble",
                            } ],
                        }, {
                            title: "touch",
                            subtitle: "Your Hands, Now in VR",
                            item_url: "https://www.oculus.com/en-us/touch/",
                            image_url: envVars.SERVER_URL + "/assets/touch.png",
                            buttons: [ {
                                type: "web_url",
                                url: "https://www.oculus.com/en-us/touch/",
                                title: "Open Web URL"
                            }, {
                                type: "postback",
                                title: "Call Postback",
                                payload: "Payload for second bubble",
                            } ]
                        } ]
                    }
                }
            }
        };

        this.callSendAPI( messageData );
    },

    sendPropertyResults( recipientId, results ) {

        //show success text
        this.sendTextMessage( recipientId, "Found " + results.length + " development applications near the area you selected:" );

        var elements = [];
        results.forEach( result => {
            console.log( 'Got result', JSON.stringify( result, null, 4 ) );
            var element = {
                title: result.application.address,
                subtitle: result.application.description,
                item_url: result.application.info_url,
                image_url: googleMapImg.getStreetViewImageUrlByAddress( result.application.address ),
                buttons: [ {
                    type: "postback",
                    title: "More info...",
                    payload: JSON.stringify( {
                        command: 'MORE_INFO',
                        address: result.application.address,
                    } )
                }, {
                    type: "postback",
                    title: "Search again...",
                    payload: JSON.stringify( {
                        command: 'SEARCH_AGAIN',
                    } )
                } ],
            };
            if ( results.data ) {
                element.subtitle += ' Status: ' + results.data.status;
            }
            elements.push( element );
        } );

        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: elements
                    }
                }
            }
        };

        console.log( 'Sending', JSON.stringify( messageData, null, 4 ) );
        this.callSendAPI( messageData );

    },

    /*
     * Send a receipt message using the Send API.
     *
     */
    sendReceiptMessage( recipientId ) {
        // Generate a random receipt ID as the API requires a unique ID
        var receiptId = "order" + Math.floor( Math.random() * 1000 );

        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "receipt",
                        recipient_name: "Peter Chang",
                        order_number: receiptId,
                        currency: "USD",
                        payment_method: "Visa 1234",
                        timestamp: "1428444852",
                        elements: [ {
                            title: "Oculus Rift",
                            subtitle: "Includes: headset, sensor, remote",
                            quantity: 1,
                            price: 599.00,
                            currency: "USD",
                            image_url: envVars.SERVER_URL + "/assets/riftsq.png"
                        }, {
                            title: "Samsung Gear VR",
                            subtitle: "Frost White",
                            quantity: 1,
                            price: 99.99,
                            currency: "USD",
                            image_url: envVars.SERVER_URL + "/assets/gearvrsq.png"
                        } ],
                        address: {
                            street_1: "1 Hacker Way",
                            street_2: "",
                            city: "Menlo Park",
                            postal_code: "94025",
                            state: "CA",
                            country: "US"
                        },
                        summary: {
                            subtotal: 698.99,
                            shipping_cost: 20.00,
                            total_tax: 57.67,
                            total_cost: 626.66
                        },
                        adjustments: [ {
                            name: "New Customer Discount",
                            amount: -50
                        }, {
                            name: "$100 Off Coupon",
                            amount: -100
                        } ]
                    }
                }
            }
        };

        this.callSendAPI( messageData );
    },

    /*
     * Send a message with Quick Reply buttons.
     *
     */
    sendQuickReply( recipientId ) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: "What's your favorite movie genre?",
                metadata: "DEVELOPER_DEFINED_METADATA",
                quick_replies: [ {
                    "content_type": "text",
                    "title": "Action",
                    "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
                }, {
                    "content_type": "text",
                    "title": "Comedy",
                    "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
                }, {
                    "content_type": "text",
                    "title": "Drama",
                    "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
                } ]
            }
        };

        this.callSendAPI( messageData );
    },

    /*
     * Send a message with Quick Reply buttons.
     *
     */
    sendTrendingIssues( recipientId ) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: "What city do you want to know about?",
                metadata: "DEVELOPER_DEFINED_METADATA",
                quick_replies: [ {
                    "content_type": "text",
                    "title": "Brisbane",
                    "payload": "TRENDING_ISSUES_BRISBANE"
                }, {
                    "content_type": "text",
                    "title": "Logan",
                    "payload": "TRENDING_ISSUES_LOGAN"
                }, {
                    "content_type": "text",
                    "title": "Adelaide",
                    "payload": "TRENDING_ISSUES_ADELAIDE"
                }, {
                    "content_type": "text",
                    "title": "Gelong",
                    "payload": "TRENDING_ISSUES_GELONG"
                } ]
            }
        };

        this.callSendAPI( messageData );
    },

        /*
     * Send a message with Quick Reply buttons.
     *
     */
    sendTrendingIssuesBrisbane( recipientId, cityName) {
        messengerGeneric.sendTextMessage( senderID, "Brisbane" );

        var elements = [];
        
         elements.push({
                title: "443 Queen Street",
                subtitle: "Appeal Dismissed",
                item_url: 'https://brisbanedevelopment.com/443-queen-street-given-green-light/',
                image_url: 'https://brisbanedevelopment.com/wp-content/uploads/2016/07/street-hero-e1469171664245.png',
            });

         sendTrendingIssuesMessage(elements);
    },

    sendTrendingIssuesMessage( recipientId, elements) {

        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: elements
                    }
                }
            }
        };

        console.log( 'Sending', JSON.stringify( messageData, null, 4 ) );
        this.callSendAPI( messageData );
    },

    /*
     * Send a read receipt to indicate the message has been read
     *
     */
    sendReadReceipt( recipientId ) {
        console.log( "Sending a read receipt to mark message as seen" );

        var messageData = {
            recipient: {
                id: recipientId
            },
            sender_action: "mark_seen"
        };

        this.callSendAPI( messageData );
    },

    /*
     * Turn typing indicator on
     *
     */
    sendTypingOn( recipientId ) {
        console.log( "Turning typing indicator on" );

        var messageData = {
            recipient: {
                id: recipientId
            },
            sender_action: "typing_on"
        };

        this.callSendAPI( messageData );
    },

    /*
     * Turn typing indicator off
     *
     */
    sendTypingOff( recipientId ) {
        console.log( "Turning typing indicator off" );

        var messageData = {
            recipient: {
                id: recipientId
            },
            sender_action: "typing_off"
        };

        this.callSendAPI( messageData );
    },

    /*
     * Send a message with the account linking call-to-action
     *
     */
    sendAccountLinking( recipientId ) {
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: "Welcome. Link your account.",
                        buttons: [ {
                            type: "account_link",
                            url: envVars.SERVER_URL + "/authorize"
                        } ]
                    }
                }
            }
        };

        this.callSendAPI( messageData );
    },

    /*
     * Call the Send API. The message data goes in the body. If successful, we'll
     * get the message id in a response
     *
     */
    callSendAPI( messageData, cb ) {

        //custom callback
        cb = cb || function () {};

        request( {
            uri: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {
                access_token: envVars.PAGE_ACCESS_TOKEN
            },
            method: 'POST',
            json: messageData

        }, function ( error, response, body ) {
            if ( !error && response.statusCode == 200 ) {
                var recipientId = body.recipient_id;
                var messageId = body.message_id;

                if ( messageId ) {
                    console.log( "Successfully sent message with id %s to recipient %s",
                        messageId, recipientId );
                    cb();
                } else {
                    console.log( "Successfully called Send API for recipient %s",
                        recipientId );
                    cb();
                }
            } else {
                console.error( response.error );
            }
        } );
    },

    /*
     * Verify that the callback came from Facebook. Using the App Secret from
     * the App Dashboard, we can verify the signature that is sent with each
     * callback in the x-hub-signature field, located in the header.
     *
     * https://developers.facebook.com/docs/graph-api/webhooks#setup
     *
     */
    verifyRequestSignature( req, res, buf ) {
        var signature = req.headers[ "x-hub-signature" ];

        if ( !signature ) {
            // For testing, let's log an error. In production, you should throw an
            // error.
            console.error( "Couldn't validate the signature." );
        } else {
            var elements = signature.split( '=' );
            var method = elements[ 0 ];
            var signatureHash = elements[ 1 ];

            var expectedHash = crypto.createHmac( 'sha1', envVars.APP_SECRET )
                .update( buf )
                .digest( 'hex' );

            if ( signatureHash != expectedHash ) {
                throw new Error( "Couldn't validate the request signature." );
            }
        }
    },
    /*
     * Authorization Event
     *
     * The value for 'optin.ref' is defined in the entry point. For the "Send to
     * Messenger" plugin, it is the 'data-ref' field. Read more at
     * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
     *
     */
    receivedAuthentication( event ) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfAuth = event.timestamp;

        // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
        // The developer can set this to an arbitrary value to associate the
        // authentication callback with the 'Send to Messenger' click event. This is
        // a way to do account linking when the user clicks the 'Send to Messenger'
        // plugin.
        var passThroughParam = event.optin.ref;

        console.log( "Received authentication for user %d and page %d with pass " +
            "through param '%s' at %d", senderID, recipientID, passThroughParam,
            timeOfAuth );

        // When an authentication is received, we'll send a message back to the sender
        // to let them know it was successful.
        sendTextMessage( senderID, "Authentication successful" );
    }


};

module.exports = messengerGeneric;