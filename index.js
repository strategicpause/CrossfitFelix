'use strict';
var Alexa = require('alexa-sdk');
var AWS = require('aws-sdk');
var dynamo = new AWS.DynamoDB();

// Config
var APP_ID = 'amzn1.ask.skill.1959573a-c819-4e46-9e4b-b0fb16d726cbs';
var TABLE_NAME = 'CrossfitFelix';
// Key Prefixes
var WORKOUT_PREFIX = "workout";
var ANNOUNCEMENT_PREFIX = "announcement";
var SEPARATOR = ":";
// Constants
var TODAY = 'Today';
var TOMORROW = 'Tomorrow';
var TIME = 'Time';
var TIME_KEY = '%t';
var PST_OFFSET = -8;

var DATE_MAP = {
	Today: () => {
		var date = new Date();
		date.setHours(date.getHours() + PST_OFFSET);
		return formatDate(date);
	},
	Tomorrow: () => {
		var date = new Date();
		date.setDate(date.getDate() + 1);
		date.setHours(date.getHours() + PST_OFFSET);	
		return formatDate(date);
	}
};

exports.handler = (event, context, callback) => {
    var alexa = Alexa.handler(event, context);
    
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
	'GetWorkoutForTodayIntent': function() {
		console.log('Calling GetWorkoutForTodayIntent.');
		getWorkout(this, TODAY);
	},
	'GetWorkoutForTomorrowIntent': function() {
		console.log('Calling GetWorkoutForTomorrowIntent.');
		getWorkout(this, TOMORROW);
	},
	'GetAnnouncementsIntent': function() {
		console.log('Calling GetAnnouncementsIntent.');
		getAnnouncements(this);
	},
	'AMAZON.HelpIntent': function () {
		var speechOutput = this.t("HELP_MESSAGE");
		var reprompt = this.t("HELP_MESSAGE");
		this.emit(':ask', speechOutput, reprompt);
	},
	'AMAZON.CancelIntent': function () {
		this.emit(':tell', this.t("STOP_MESSAGE"));
	},
	'AMAZON.StopIntent': function () {
		this.emit(':tell', this.t("STOP_MESSAGE"));
	},
	'Unhandled': function () {
        this.emit(':ask', '', '');
    }
};

var getPayload = function(hashKey, onSuccess, onError) {
	console.log('Fetching data for key: ' + hashKey);
	var config = {
		'TableName': TABLE_NAME,
		'Key': {
			'Date': { 'S': hashKey }
		}
	};
	dynamo.getItem(config, function(err, data) {
		if (err) {
			console.error('Error: ' + err);
			onError(err);
		} else {
			console.log(data);
			var payload = data.Item['payload']['S'];
			onSuccess(payload);
		}
	});
};

var getWorkout = function(scope, time) {
	var hashKey =  getHashKey(WORKOUT_PREFIX, time);
	var onError = function(err) {
		scope.emit(':tell', 'The workout has not yet been posted. Check back later.');
	};

	getPayload(hashKey, emitPayload(scope, { Time: time }), onError);
};

var getAnnouncements = function(scope) {
	var hashKey =  getHashKey(ANNOUNCEMENT_PREFIX, TODAY);

	var onError = function(err) {
		scope.emit(':tell', 'There are no announcements today. Check back later.');
	};

	getPayload(hashKey, emitPayload(scope), onError);
};

var getHashKey = function(prefix, time) {
	var date = getDate(time);
	
	return prefix + SEPARATOR + date;
};

var formatDate = function(date) {
	return (date.getMonth() + 1) + "-" + 
			date.getDate() + "-" + 
			date.getFullYear();
};

var emitPayload = function(scope, options) {
	return function(payload) {
		if (TIME in (options || {})) {
			payload = payload.replace(TIME_KEY, options[TIME]);
		}
		scope.emit(':tell', payload);
	};
};

var getDate = function(time) {
	if (!(time in DATE_MAP)) {
		console.error("Invalid Time: " + time);
		time = TODAY;
	}
	var dateFunction = DATE_MAP[time];
	return dateFunction();
};
