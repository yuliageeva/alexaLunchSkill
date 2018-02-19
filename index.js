'use strict';
const Alexa = require("alexa-sdk");
const JSONReq = require('request-json');

var alexaSpeech = null;

// function removeDetails(menuString)
// {
//     menuString = menuString.substring(0, menuString.indexOf('('));
//     return menuString;
// }

exports.handler = function(event, context, callback) {
    var client = JSONReq.createClient('http://www.amica.fi/');

    client.get('modules/json/json/Index?costNumber=0083&language=en', function(err, res, body) {

        alexaSpeech = "Here is Today's menu at Haaga-Helia";
        
        var menuArray = body.MenusForDays;
        var currentDate = new Date();
        var currentDay = currentDate.getDate();
        var todaysMenu = null;

        console.log(currentDate);
        console.log(currentDay);

        for(var i = 0; i < menuArray.length; i++)
        {
            var tempDate = new Date(menuArray[i].Date);
            console.log("tempDate = " + tempDate );

            if(tempDate.getDate()+1 == currentDay)
            {
                console.log("Match");
                todaysMenu = menuArray[i];
                break;
            }
        }

        todaysMenu = todaysMenu.SetMenus;
        var tempString = null;

        if(todaysMenu.length != 0)
        {    
            for(var i = 0; i < todaysMenu.length; i++)
            {
                console.log("todaysMenu.length = " + todaysMenu.length);
                for(var j = 0; j < todaysMenu[i].Components.length; j++)
                {
                    console.log("todaysMenu.Components.length = " + todaysMenu[i].Components.length);
                    tempString = todaysMenu[i].Components[j];
                    tempString = tempString.substring(0, tempString.indexOf('('));
                    alexaSpeech += " " + tempString + "<break time='500ms'/>";
                }
            }

        }
        else
        {
            alexaSpeech = " Sorry! There is no menu available for today";
        }
        
        console.log(alexaSpeech);

        const alexa = Alexa.handler(event, context);
        alexa.registerHandlers(handlers);
        alexa.execute();
    });

};

const handlers = {

    'lunch': function () {
        alexaSpeech = alexaSpeech.toString();
        console.log(alexaSpeech);
        this.emit(':tell', alexaSpeech);
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = 'This is the Haaga Helia lunch skill, ask me whats for lunch. ';
        const reprompt = 'Say lunch menu, to hear todays lunch menu at Haaga-Helia.';

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak('Goodbye!');
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak('See you later!');
        this.emit(':responseReady');
    }
};