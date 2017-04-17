'use strict';
var Alexa = require('alexa-sdk');
var dataAccess = require('./dataAccess')

var TIME = 'Time';
var TIME_KEY = '%t';

// Messages
var HELP_MESSAGE = 'To hear the work out of the day, try asking for today or tomorrows workout. ' + 
				   'You can also ask for announcements to hear todays announcements. What would you like to do?';
var REPROMPT_MESSAGE = 'Would you like to hear today or tomorrows workout or would you like to hear todays announcements?';
var UNHANDLED_MESSAGE = 'Sorry, I didnt recognize that command. ' + REPROMPT_MESSAGE;
var WORKOUT_ERROR = 'The workout has not yet been posted. Check back later.';
var ANNOUNCEMENT_ERROR = 'There are no announcements today. Check back later.';
var WELCOME_MESSAGE = 'Welcome to Crossfit Felix. ' + REPROMPT_MESSAGE;
var STOP_MESSAGE = 'Goodbye!';

// Config
var APP_ID = 'amzn1.ask.skill.1959573a-c819-4e46-9e4b-b0fb16d726cbs';

exports.handler = (event, context, callback) => {
    var alexa = Alexa.handler(event, context);	
    
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
	'LaunchRequest': function () {
		console.log('Calling LaunchRequest');
        this.emit(':ask', WELCOME_MESSAGE, REPROMPT_MESSAGE);
    },
	'GetWorkoutForTodayIntent': function() {
		console.log('Calling GetWorkoutForTodayIntent.');
		getWorkout(this, dataAccess.TODAY);
	},
	'GetWorkoutForTomorrowIntent': function() {
		console.log('Calling GetWorkoutForTomorrowIntent.');
		getWorkout(this, dataAccess.TOMORROW);
	},
	'GetAnnouncementsIntent': function() {
		console.log('Calling GetAnnouncementsIntent.');
		getAnnouncements(this);
	},
	'AMAZON.HelpIntent': function () {
		this.emit(':ask', HELP_MESSAGE, REPROMPT_MESSAGE);
	},
	'AMAZON.CancelIntent': function () {
		console.log('Calling CancelIntent.');
		this.emit('SessionEndedRequest');
	},
	'AMAZON.StopIntent': function () {
		console.log('Calling StopIntent.');
		this.emit('SessionEndedRequest');
	},
	'SessionEndedRequest':function () {
        this.emit(':tell', STOP_MESSAGE);
    },
	'Unhandled': function () {
        this.emit(':ask', UNHANDLED_MESSAGE, REPROMPT_MESSAGE);
    }
};

var getWorkout = function(scope, time) {
	dataAccess.getWorkout({
		time: time,
		onSuccess: emitPayload(scope, { Time: time }),
		onError: function() {
			scope.emit(':tell', WORKOUT_ERROR);
		}
	});
};

var getAnnouncements = function(scope) {
	dataAccess.getAnnouncements({
		time: dataAccess.TODAY,
		onSuccess: emitPayload(scope),
		onError: function() {
			scope.emit(':tell', ANNOUNCEMENT_ERROR);
		}
	});
};

var emitPayload = function(scope, options) {
	return function(payload) {
		var readoutText = payload['readoutText'];
		if (TIME in (options || {})) {
			readoutText = readoutText.replace(TIME_KEY, options[TIME]);
		}
		var title = payload['title'];
		var displayText = payload['displayText'];
		scope.emit(':tellWithCard', readoutText, title, displayText);
	};
};
