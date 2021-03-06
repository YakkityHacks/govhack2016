'use strict';
/* global console, require, setTimeout */

const request = require( 'request' ).defaults( {
    json: true,
} );
const messengerGeneric = require( './messengerGeneric.js' );
const dataFinder = require( './dataFinder.js' );
const async = require( 'async' );
const COOORD_WIDTH = 0.01; //1.1km
const PLANNING_ALERT_KEY = 'WMGj4AkJOg+iLtT8qhha';

let botLoop = {
    processEvent: function ( pageEntry ) {

        var pageID = pageEntry.id;
        var timeOfEvent = pageEntry.time;

        // Iterate over each messaging event
        pageEntry.messaging.forEach( function ( messagingEvent ) {
            if ( messagingEvent.optin ) {
                messengerGeneric.receivedAuthentication( messagingEvent );
            } else if ( messagingEvent.message ) {
                this.receivedMessage( messagingEvent );
            } else if ( messagingEvent.delivery ) {
                this.receivedDeliveryConfirmation( messagingEvent );
            } else if ( messagingEvent.postback ) {
                this.receivedPostback( messagingEvent );
            } else if ( messagingEvent.read ) {
                this.receivedMessageRead( messagingEvent );
            } else if ( messagingEvent.account_linking ) {
                this.receivedAccountLink( messagingEvent );
            } else {
                console.log( "Webhook received unknown messagingEvent: ", messagingEvent );
            }
        }, this );
    },

    /*
     * Message Event
     *
     * This event is called when a message is sent to your page. The 'message'
     * object format can vary depending on the kind of message that was received.
     * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
     *
     * For this example, we're going to echo any text that we get. If we get some
     * special keywords ('button', 'generic', 'receipt'), then we'll send back
     * examples of those bubbles to illustrate the special message bubbles we've
     * created. If we receive a message with an attachment (image, video, audio),
     * then we'll simply confirm that we've received the attachment.
     *
     */
    receivedMessage( event ) {

        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfMessage = event.timestamp;
        var message = event.message;

        console.log( "Received message for user %d and page %d at %d with message:",
            senderID, recipientID, timeOfMessage );
        console.log( 'Message', JSON.stringify( message ) );

        var isEcho = message.is_echo;
        var messageId = message.mid;
        var appId = message.app_id;
        var metadata = message.metadata;

        // You may get a text or attachment but not both
        var messageText = message.text;
        var messageAttachments = message.attachments;
        var quickReply = message.quick_reply;

        if ( isEcho ) {
            // Just logging message echoes to console
            console.log( "Received echo for message %s and app %d with metadata %s",
                messageId, appId, metadata );
            return;
        } else if ( quickReply ) {
            var quickReplyPayload = quickReply.payload;
            console.log( "Quick reply for message %s with payload %s",
                messageId, quickReplyPayload );

            switch ( messageText ) {
            case 'City Issues':
                messengerGeneric.sendTrendingIssues( senderID );
                break;

            case 'Find Applications':
                messengerGeneric.sendTextMessage( senderID, 'Hi!\nShare a location from the toolbar below and I\'ll search for future development applications in the area.' );
                break;

            case 'Brisbane':
                messengerGeneric.sendTrendingIssuesBrisbane( senderID, messageText );
                break;

            case 'Logan':
                messengerGeneric.sendTextMessage( senderID, 'Area coming soon.' );
                setTimeout( () => messengerGeneric.sendTrendingIssues( senderID ), 1000 );
                // messengerGeneric.sendTrendingIssuesLogan( senderID, messageText );
                break;

            case 'Geelong':
                messengerGeneric.sendTextMessage( senderID, 'Area coming soon.' );
                setTimeout( () => messengerGeneric.sendTrendingIssues( senderID ), 1000 );
                // messengerGeneric.sendTrendingIssuesGeelong( senderID, messageText );
                break;

            case 'Adelaide':
                messengerGeneric.sendTextMessage( senderID, 'Area coming soon.' );
                setTimeout( () => messengerGeneric.sendTrendingIssues( senderID ), 1000 );
                // messengerGeneric.sendTrendingIssuesAdelaide( senderID, messageText );
                break;

            default:
                messengerGeneric.sendTextMessage( senderID, "Quick reply tapped" );
                break;
            }

            return;
        }

        if ( messageText ) {

            // If we receive a text message, check to see if it matches any special
            // keywords and send back the corresponding example. Otherwise, just echo
            // the text we received.
            switch ( messageText.toLowerCase().trim() ) {
            case 'image':
                messengerGeneric.sendImageMessage( senderID );
                break;

            case 'pokemon':
                messengerGeneric.sendGifMessage( senderID );
                break;

            case 'audio':
                messengerGeneric.sendAudioMessage( senderID );
                break;

            case 'video':
                messengerGeneric.sendVideoMessage( senderID );
                break;

            case 'file':
                messengerGeneric.sendFileMessage( senderID );
                break;

            case 'generic':
                messengerGeneric.sendGenericMessage( senderID );
                break;

            case 'receipt':
                messengerGeneric.sendReceiptMessage( senderID );
                break;

            case 'quick reply':
                messengerGeneric.sendQuickReply( senderID );
                break;

            case 'city issues':
                messengerGeneric.sendTrendingIssues( senderID );
                break;

            case 'read receipt':
                messengerGeneric.sendReadReceipt( senderID );
                break;

            case 'typing on':
                messengerGeneric.sendTypingOn( senderID );
                break;

            case 'typing off':
                messengerGeneric.sendTypingOff( senderID );
                break;

            case 'account linking':
                messengerGeneric.sendAccountLinking( senderID );
                break;

            case 'developments':
                messengerGeneric.sendTextMessage( senderID, 'Hi!\nShare a location from the toolbar below and I\'ll search for future development applications in the area.' );
                break;

            default:
                messengerGeneric.sendMainOptions( senderID );
                break;
            }

        } else if ( messageAttachments ) {
            var replied = false;
            messageAttachments.forEach( attachment => {
                if ( attachment.type === 'location' ) {
                    replied = true;
                    console.log( 'Got location attachment', attachment.payload );

                    var coords = {
                        lat: attachment.payload.coordinates.lat,
                        lng: attachment.payload.coordinates.long,
                    };
                    var qs = {
                        key: PLANNING_ALERT_KEY,
                        top_right_lat: coords.lat + COOORD_WIDTH / 2,
                        top_right_lng: coords.lng + COOORD_WIDTH / 2,
                        bottom_left_lat: coords.lat - COOORD_WIDTH / 2,
                        bottom_left_lng: coords.lng - COOORD_WIDTH / 2,
                    };

                    messengerGeneric.sendTypingOn( senderID );

                    request.get( 'https://api.planningalerts.org.au/applications.js', {
                        qs: qs
                    }, ( error, response, body ) => {
                        if ( error ) throw error;
                        if ( body.length === 0 ) {
                            return messengerGeneric.sendTextMessage( senderID, "No results found in this area." );
                        }
                        var count = 0;
                        var getDistance = ( coords, item ) => {
                            var dx = coords.lng - item.application.lng;
                            var dy = coords.lat - item.application.lat;
                            var dist = Math.sqrt( Math.pow( dx, 2 ), Math.pow( dy, 2 ) );
                            return dist;
                        };
                        body.sort( ( itemA, itemB ) => {
                            return getDistance( coords, itemA ) - getDistance( coords, itemB );
                        } );
                        //TODO: Sort by distance to address.
                        async.each( body, dataFinder.findMoreData, ( error ) => {
                            var filtered = body.filter( item => count++ < 10 );
                            console.log( 'Got', body.length, 'results. Filtered to', filtered.length );

                            var centerLoc = attachment.payload.coordinates.lat + ',' + attachment.payload.coordinates.long;
                            return messengerGeneric.sendPropertyResults( senderID, filtered, centerLoc );
                        } );
                    } );
                }
            } );
            if ( !replied ) {
                messengerGeneric.sendTextMessage( senderID, "Message with attachment received" );
            }
        }
    },


    /*
     * Delivery Confirmation Event
     *
     * This event is sent to confirm the delivery of a message. Read more about
     * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
     *
     */
    receivedDeliveryConfirmation( event ) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var delivery = event.delivery;
        var messageIDs = delivery.mids;
        var watermark = delivery.watermark;
        var sequenceNumber = delivery.seq;

        if ( messageIDs ) {
            messageIDs.forEach( function ( messageID ) {
                console.log( "Received delivery confirmation for message ID: %s",
                    messageID );
            } );
        }

        console.log( "All message before %d were delivered.", watermark );
    },


    /*
     * Postback Event
     *
     * This event is called when a postback is tapped on a Structured Message.
     * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
     *
     */
    receivedPostback( event ) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfPostback = event.timestamp;

        // The 'payload' param is a developer-defined field which is set in a postback
        // button for Structured Messages.
        var payload = event.postback.payload;

        console.log( "Received postback for user %d and page %d with payload '%s' " +
            "at %d", senderID, recipientID, payload, timeOfPostback );

        try {
            payload = JSON.parse( payload );
        } catch ( e ) {
            console.error( 'Failed to parse postback payload' );
        }
        switch ( payload.command ) {
        case 'SUBSCRIBE':
            messengerGeneric.sendTextMessage( senderID, 'Cool. We will send you a message when the application is updated.' );

            // setTimeout( function () {
            //     messengerGeneric.sendTextMessage( senderID, 'Property application updated' );
            // }, 4000 );

            break;
        case 'SEARCH_AGAIN':
            messengerGeneric.sendTextMessage( senderID, 'Share a location with me from the toolbar and I\'ll do another search.' );
            break;
        case 'MORE_INFO':
            messengerGeneric.sendTypingOn( senderID );

            request.get( 'https://api.planningalerts.org.au/applications.js', {
                qs: {
                    key: PLANNING_ALERT_KEY,
                    address: payload.address,
                    radius: 100,
                }
            }, ( error, response, body ) => {
                if ( error ) throw error;
                console.log( 'Single property search found ', body.length );

                if ( body.length === 0 ) {
                    return messengerGeneric.sendTextMessage( senderID, 'Couldn\'t find that address for some reason. Try again later.' );
                }
                body = body.filter( item => item.application.address === payload.address );
                dataFinder.findMoreData( body[ 0 ], ( error, item ) => {
                    messengerGeneric.sendSingleApplication( senderID, item );
                } );
            } );
            break;
        default:

        }


    },

    /*
     * Message Read Event
     *
     * This event is called when a previously-sent message has been read.
     * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
     *
     */
    receivedMessageRead( event ) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;

        // All messages before watermark (a timestamp) or sequence have been seen.
        var watermark = event.read.watermark;
        var sequenceNumber = event.read.seq;

        console.log( "Received message read event for watermark %d and sequence " +
            "number %d", watermark, sequenceNumber );
    },

    /*
     * Account Link Event
     *
     * This event is called when the Link Account or UnLink Account action has been
     * tapped.
     * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
     *
     */
    receivedAccountLink( event ) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;

        var status = event.account_linking.status;
        var authCode = event.account_linking.authorization_code;

        console.log( "Received account link event with for user %d with status %s " +
            "and auth code %s ", senderID, status, authCode );
    }

};

module.exports = botLoop;