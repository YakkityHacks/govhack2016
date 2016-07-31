# Fresh Plan - Facebook Messenger Bot

This project was built as part of the 2016 [GovHack][http://www.govhack.org/] event, which aims to bring startups, developers and the broad community together to create solutions using open government data.

**Fresh Plan** is a Facebook Messenger bot and allows community members, planners and property developers to interact with large amounts of data in a human-friendly way, to increase participation and reduce costs/friction for governments and planners to provide personalised services to the different stakeholders.

The current prototype allows users to explore **property development applications** in the surroundings of an area they select. Users get a quick view of the properties, their address and type of application. This data is pulled from government data sources. The bot also makes it easy for users to access more details about these applications, and facilitates the process of participation through the official channels available in most property applications.

## Setup

Run `npm start` to start the bot app in a server. In order for it to work as a Facebook Messenger, follow the [official documentation](https://developers.facebook.com/docs/messenger-platform).

The server will need to have the following environmental variables for the bot to work:

- APP_SECRET: secret of your Facebook app.
- VALIDATION_TOKEN: arbitrary value used to validate your webhook.
- PAGE_ACCESS_TOKEN: token of your Facebook page.
- SERVER_URL: url of your live server.
- GOOGLE_MAPS_API_KEY: Google API key, must have Google Maps and Street Views API enabled.

# Team

- Andrew Saul  
- Dale Freya
- Elizabeth Gray
- Glen Arrowsmith
- Loyce Lau
- Pablo Farias Navarro

## License

See the LICENSE file in the root directory of this source tree.
