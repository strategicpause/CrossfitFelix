'use strict';

var AWS = require('aws-sdk');
var data = require('./data');

// Key Prefixes
var WORKOUT_PREFIX = "workout";
var ANNOUNCEMENT_PREFIX = "announcement";
// Constants
var TODAY = 'Today';
var TOMORROW = 'Tomorrow';

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

var getWorkout = function(options) {
	getPayload(Object.assign(options, {type: WORKOUT_PREFIX}));
}

var getAnnouncements = function(options) {
	getPayload(Object.assign(options, {type: ANNOUNCEMENT_PREFIX}));
}

var getPayload = function(options) {
	var date = getDate(options.time);
	console.log('Fetching ' + options.type + ' for ' + date);
	if (data[options.type] && 
		data[options.type][date]) {
		var payload = data[options.type][date];
		console.log('Found payload for ' + options.type + '.' + date);
		options.onSuccess(payload);
	} else {
		console.error('No entry for ' + options.type + '.' + date);
		options.onError();
	}
};

var formatDate = function(date) {
	return (date.getMonth() + 1) + "-" + 
			date.getDate() + "-" + 
			date.getFullYear();
};

var getDate = function(time) {
	if (!(time in DATE_MAP)) {
		console.error("Invalid Time: " + time);
		time = TODAY;
	}
	var dateFunction = DATE_MAP[time];
	return dateFunction();
};

module.exports = {
	getWorkout: getWorkout,
	getAnnouncements: getAnnouncements,
	TODAY: TODAY,
	TOMORROW: TOMORROW
};