var express = require('express');

var request = require('request');
var querystring = require('querystring');

var router = express.Router();



const LUIS_SUBSCRIPTION_KEY = process.env.LUIS_SUBSCRIPTION_KEY;
const LUIS_APP_ID = process.env.LUIS_APP_ID;

const welcome = `<h4>Welcome!</h4>`;

router.get('/', function (req, res, next) {

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(welcome);

});


router.get('/test/:q', function (req, res) {
    var utterance = req.params.q;
    getLuisIntent(utterance, function (intents) {
        res.json(intents);
    })

});


router.get('/check', function (req, res) {
    if(!LUIS_SUBSCRIPTION_KEY) {
        res.end('LUIS_SUBSCRIPTION_KEY is empty')
    } else if(!LUIS_APP_ID) {
        res.end('LUIS_APP_ID is empty')
    } else {
        res.end('Success.')
    }

});







function getLuisIntent(utterance, callback) {
    var endpoint =
        "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/";

    // Set the LUIS_APP_ID environment variable 
    // to df67dcdb-c37d-46af-88e1-8b97951ca1c2, which is the ID
    // of a public sample application.    
    var luisAppId = process.env.LUIS_APP_ID;

    // Set the LUIS_SUBSCRIPTION_KEY environment variable
    // to the value of your Cognitive Services subscription key
    var queryParams = {
        "subscription-key": process.env.LUIS_SUBSCRIPTION_KEY,
        "timezoneOffset": "0",
        "verbose":  true,
        "q": utterance
    }

    var luisRequest =
        endpoint + luisAppId +
        '?' + querystring.stringify(queryParams);

    request(luisRequest,
        function (err,
            response, body) {
            if (err)
                console.log(err);
            else {
                var data = JSON.parse(body);
                callback(data)
                // console.log(`Query: ${data.query}`);
                // console.log(`Top Intent: ${data.topScoringIntent.intent}`);
                // console.log('Intents:');
                // console.log(data.intents);
            }
        });
}

module.exports = router;

