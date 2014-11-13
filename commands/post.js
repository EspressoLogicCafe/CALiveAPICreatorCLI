var Client = require('node-rest-client').Client;
var fs = require('fs');
var _ = require('underscore');

var dotfile = require('../util/dotfile.js');
var printObject = require('../util/printObject.js');

module.exports = {
	commandPost: function (cmd, verb) {
		var client = new Client();
		var url = dotfile.getCurrentServer();
		var apiKey = dotfile.getApiKey(url);
		if ( ! cmd.resource) {
			console.log('Error: a resource or table name must be specified with the -r or --resource option'.red);
			return;
		}
		if ( ! cmd.json && !cmd.jsonfile) {
			console.log('Error: a JSON object must be specified in the -j/--json option, or with the -f/--jsonfile option'.red);
			return;
		}
		
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
			cmd.json = "" + fs.readFileSync(cmd.jsonfile);
		}
		
		try {
			JSON.parse(cmd.json);
		}
		catch(e) {
			console.log('Error: invalid JSON'.red + " : " + e);
			return;
		}

		var startTime = new Date();
		client[verb](url + "/" + cmd.resource, {
			data: cmd.json,
			headers: {
				Authorization: "Espresso " + apiKey + ":1"
			}
		}, function(data) {
			//console.log(data);
			
			var endTime = new Date();
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			var termWidth = 80;
			if (process.stdout.getWindowSize) {
				termWidth = process.stdout.getWindowSize()[0];
			}

			if (!cmd.format || cmd.format === "text") {
				var header = verb.toUpperCase() + " for " + cmd.resource + ": ";
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
				_.each(data.txsummary, function(obj) {
					printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
				});
			}
			
			if (!cmd.format || cmd.format === "text") {
				var trailer = "Request took: " + (endTime - startTime) + "ms";
				trailer += " - # objects touched: ";
				if (data.txsummary.length == 0) {
					console.log('No data returned'.yellow);
				}
				trailer += data.txsummary.length;
				while (trailer.length < termWidth)
					trailer += " ";
				console.log(trailer.bgWhite.blue);
				console.log(' '.reset);
			}
		});
	}
};
