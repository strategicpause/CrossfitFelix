'use strict';
var Alexa = require('alexa-sdk');
var dataAccess = require('./dataAccess')

var TIME = 'Time';
var TIME_KEY = '%t';

// Messages
var HELP_MESSAGE = 'Try asking for today or tomorrows workout. You can also ask for announcements.';
var UNHANDLED_MESSAGE = 'I didn\'t recognize that command. Try instead asking for today\'s workout.';
var WORKOUT_ERROR = 'The workout has not yet been posted. Check back later.';
var ANNOUNCEMENT_ERROR = 'There are no announcements today. Check back later.';

// Config
var APP_ID = 'amzn1.ask.skill.1959573a-c819-4e46-9e4b-b0fb16d726cbs';

exports.handler = (event, context, callback) => {
    var alexa = Alexa.handler(event, context);
    
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
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
		this.emit(':tell', HELP_MESSAGE);
	},
	'AMAZON.CancelIntent': function () {
		this.emit(':tell', this.t("STOP_MESSAGE"));
	},
	'AMAZON.StopIntent': function () {
		this.emit(':tell', this.t("STOP_MESSAGE"));
	},
	'Unhandled': function () {
        this.emit(':tell', UNHANDLED_MESSAGE);
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
		if (TIME in (options || {})) {
			payload = payload.replace(TIME_KEY, options[TIME]);
		}
		scope.emit(':tell', payload);
	};
};
