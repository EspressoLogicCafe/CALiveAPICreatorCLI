var Client = require('node-rest-client').Client;
var _ = require('underscore');
var colors = require('colors');
var querystring = require("querystring");

var dotfile = require('../util/dotfile.js');
var printObject = require('../util/printObject.js');
var login = require('../util/login.js');

module.exports = {
	commandGet: function (resName, cmd) {
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;

		if ( ! resName) {
			console.log('Error: a resource or table name must be specified'.red);
			return;
		}
		
		var params = "";
		if (cmd.filter) {
			params = "?filter=" + querystring.escape(cmd.filter);
		}
		
		if (cmd.sort) {
			params += params.length ? "&" : "?";
			params += "order=" + querystring.escape(cmd.sort);
		}
		
		if (cmd.pagesize) {
			params += params.length ? "&" : "?";
			params += "pagesize=" + cmd.pagesize;
		}
		
		if (cmd.format) {
			if (cmd.format !== "text" && cmd.format !== "json" && cmd.format !== "compactjson") {
				console.log('Invalid value for option '.red + 'format'.blue.bgWhite + 
						' - valid values are '.red + 'text'.underline + ', ' + 'json'.underline + 
						' and '.red + 'compactjson'.underline);
				return;
			}
		}
		
		var objUrl = resName;
		if (cmd.pk) {
			objUrl += "/" + cmd.pk;
		}
		
		var startTime = new Date();
		client.get(url + "/" + objUrl + params, {
			headers: {
				Authorization: "Espresso " + apiKey + ":1"
			}
		}, function(data) {
			//console.log('get result: ' + JSON.stringify(data, null, 2));
			var endTime = new Date();
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			var termWidth = 80;
			if (process.stdout.getWindowSize) // Does not exist if output is redirected
				termWidth = process.stdout.getWindowSize()[0];

			if (!cmd.format || cmd.format === "text") {
				var header = "GET for " + resName + ": ";
				while (header.length < termWidth )
					header += " ";
				console.log(header.bgWhite.blue);
			}
						
			if (cmd.format == "json") {
				console.log(JSON.stringify(data, null, 2));
			}
			else if (cmd.format == "compactjson") {
				console.log(JSON.stringify(data));
			}
			else {
				if (Array.isArray(data)) {
					_.each(data, function(obj) {
						printObject.printObject(obj, null, 0, null, cmd.truncate);
					});
				}
				else {
					printObject.printObject(data, cmd.resource, 0, null, cmd.truncate);
				}
			}
			
			if (!cmd.format || cmd.format === "text") {
				var trailer = "Request took: " + (endTime - startTime) + "ms";
				trailer += " - # top-level objects: ";
				if (Array.isArray(data)) {
					if (data.length == 0) {
						console.log('No rows returned'.yellow);
					}
					var nextBatchPresent = false;
					if (data.length > 0) {
						nextBatchPresent = data[data.length - 1]["@metadata"] && 
							data[data.length - 1]["@metadata"].next_batch;
					}
					trailer += data.length - (nextBatchPresent ? 1 : 0);
				}
				else
					trailer += "1";
				while (trailer.length < termWidth)
					trailer += " ";
				console.log(trailer.bgWhite.blue);
				console.log(' '.reset);
			}
		});
	}
};
