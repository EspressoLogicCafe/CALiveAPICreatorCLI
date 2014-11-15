var Client = require('node-rest-client').Client;
var fs = require('fs');
var _ = require('underscore');
var colors = require('colors');
var querystring = require("querystring");

var dotfile = require('../util/dotfile.js');
var printObject = require('../util/printObject.js');

module.exports = {
	commandDelete: function (resource, cmd) {
		var client = new Client();
		var url = null;
		var apiKey = null;
		if (cmd.serverAlias) {
			var login = dotfile.getLoginForAlias(cmd.serverAlias);
			if ( ! login) {
				console.log(('Unknown alias: ' + cmd.serverAlias).red);
				return;
			}
			url = login.url;
			apiKey = login.loginInfo.apikey;
		}
		else {
			var login = dotfile.getCurrentServer();
			url = login.url;
			apiKey = dotfile.getApiKey(login.url, login.userName);
		}
		
		if ( ! (resource && cmd.pk && cmd.checksum) && !cmd.jsonfile) {
			console.log('Error: a resource or table name must be specified, or a JSON file must be specified'.red);
			return;
		}
		
		function delObject(url, checksum) {
			client['delete'](url + "?checksum=" + checksum, {
				headers: {
					Authorization: "Espresso " + apiKey + ":1"
				}
			}, function(data) {
				//console.log(data);
				numDeletedObjects++;

				if (data.errorMessage) {
					console.log(("Error: " + data.errorMessage).red);
					return;
				}
				if (cmd.format == "json") {
					console.log(JSON.stringify(data, null, 2));
				}
				else if (cmd.format == "compactjson") {
					console.log(JSON.stringify(data));
				}
				else {
					_.each(data.txsummary, function(obj) {
						printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
						numAffectedObjects++;
					});
				}
			}, function(e) {
				console.log(('Error while deleting: ' + e).red);
				numDeletedObjects++;
			});
		}

		// Print the banner
		var termWidth = 80;
		if (process.stdout.getWindowSize) {
			termWidth = process.stdout.getWindowSize()[0];
		}

		if (!cmd.format || cmd.format === "text") {
			var header = "DELETE for " + resource + ": ";
			while (header.length < termWidth )
				header += " ";
			console.log(header.bgWhite.blue);
		}
		
		var startTime = new Date();
		var numObjectsToDelete = 0;
		var numDeletedObjects = 0;
		var numAffectedObjects = 0;
		
		// If we need to delete a whole file
		if (cmd.jsonfile) {
			if (cmd.jsonfile === 'stdin') {
				cmd.jsonfile = '/dev/stdin';
			}
			else {
				if ( ! fs.existsSync(cmd.jsonfile)) {
					console.log('Unable to open JSON file: '.red + cmd.jsonfile.magenta);
					return;
				}
			}
			var json = fs.readFileSync(cmd.jsonfile);
			var objs = null;
			try {
				objs = JSON.parse(json);
			}
			catch(e) {
				console.log('Invalid JSON in file: '.red + cmd.jsonfile.magenta);
				return;
			}
			if (Array.isArray(objs)) {
				_.each(objs, function(obj) {
					if (obj['@metadata'] && obj['@metadata'].href) {
						numObjectsToDelete++;
					}
				});
				_.each(objs, function(obj) {
					if (obj['@metadata'] && obj['@metadata'].href) {
						delObject(obj['@metadata'].href, obj['@metadata'].checksum);
					}
				});
			}
			else {
				if (objs['@metadata'] && objs['@metadata'].href) {
					numObjectsToDelete++;
					delObject(objs['@metadata'].href, objs['@metadata'].checksum);
				}
			}
		}
		else {
			numObjectsToDelete = 1;
			delObject(url + "/" + resource + "/" + cmd.pk, cmd.checksum);
		}
		
		function printTrailer() {
			if (numDeletedObjects < numObjectsToDelete) {
				setTimeout(printTrailer, 50);
				return;
			}
			var endTime = new Date();
			if (!cmd.format || cmd.format === "text") {
				var trailer = "Request took: " + (endTime - startTime) + "ms";
				trailer += " - # objects deleted: " + numDeletedObjects;
				trailer += " - # objects touched: ";
				if (numAffectedObjects == 0) {
					console.log('No objects touched'.yellow);
				}
				trailer += numAffectedObjects;
				while (trailer.length < termWidth)
					trailer += " ";
				console.log(trailer.bgWhite.blue);
				console.log(' '.reset);
			}	
		}
		printTrailer();
	}
};
