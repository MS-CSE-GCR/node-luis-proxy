var express = require('express');

var request = require('request');
var querystring = require('querystring');

var router = express.Router();

var model = require('./model/test.js')

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
        res.json(intent2result(intents))
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

function intent2result(intents) {
    const indexRange = [];
    const result = [];
    result.push(`用户意图：${intents.topScoringIntent.intent}`);
    if(intents.topScoringIntent.intent && model[intents.topScoringIntent.intent]) {
        for(let entity of model[intents.topScoringIntent.intent].entities) {
            let found = false;
            for(let entityTypeFunc of entity.type) {
                if(found) {
                    break;
                }
                for(let intententity of intents.entities) {
                    try{
                        if(intententity.type === Object.keys(entityTypeFunc)[0]) {
                            var msg = entityTypeFunc[intententity.type](intententity)
                            if(checkRange(indexRange, msg.startIndex, msg.endIndex)) {
                                result.push(`${entity.name}: ${msg}`)
                                found = true;
                                
                            }
                        }
                    } catch(e) {
                        console.log(e)
                        found = false;
                    }
                }
                
            }
            if(!found) {
                result.push(`缺失参数：${entity.name}`)
            }
        }

    } else {
        for(let intententity of intents.entities) {
            result.push(`${intententity.entity} ${intententity.type}`)
        }
    }
    var json = {
        intents:intents,
        result:result

    }
    return json
}

function checkRange(ranges, start, end) {
    for(let range of ranges) {
        if((start>=range.startIndex && start<=range.endIndex) || (end>=range.startIndex && end<=range.endIndex)) {
            return false;
        }
    }
    ranges.push({startIndex:start,endIndex:end})
    return true
}

module.exports = router;

