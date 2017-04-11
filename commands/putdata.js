var Client = require('node-rest-client').Client;
var fs = require('fs');
var _ = require('underscore');

var dotfile = require('../util/dotfile.js');
var printObject = require('../util/printObject.js');

module.exports = {
	commandPost: function (resource, cmd, verb) {
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
		if ( ! resource) {
			console.log('Error: a resource or entity name must be specified'.red);
			return;
		}
		if (  !cmd.file) {
			console.log('Error: a file object must be specified with the -f/--file option'.red);
			return;
		}
		
		if (cmd.file) {
			if (cmd.file === 'stdin') {
				cmd.file = '/dev/stdin';
			}
			else {
				if ( ! fs.existsSync(cmd.file)) {
					console.log('Unable to open file: '.red + cmd.file.magenta);
					return;
				}
			}
			var fileContent = fs.readFileSync(cmd.file);
			var data = fileContent.toString('base64');//hex
			var code  = "b64:" + data;//"0x"+data; //
		}
		
		if(!cmd.attrname) {
			console.log('Missing Attribute Name --attrname : '.red );
			return;
		}
		var startTime = new Date();
		var fullResource = resource;
		if (cmd.pk) {
			fullResource += "/" + cmd.pk;
		} else {
			console.log('Missing Primary Key --pk : '.red );
			return;
		}
		client.get(url + "/" + fullResource , {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type": "application/json"
			}
		}, function(data) {
		
			var endTime = new Date();
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if(data.length < 1) {
				console.log(("Error: Primary Key [" + cmd.pk + "] did not return any row data" ).red);
				return;
			}
			var putJson = {};
			putJson["@metadata"] = data[0]["@metadata"];
			putJson[cmd.attrname] = code;
			//console.log('get result: ' + JSON.stringify(putJson, null, 2));
			client[verb](url + "/" + fullResource, {
				data: putJson,
				headers: {
					Authorization: "CALiveAPICreator " + apiKey + ":1",
					"Content-Type": "application/json"
				}
			}, function(putData) {
				//console.log(putData);
			
				var endTime = new Date();
				if (data.errorMessage) {
					console.log(("Error: " + putData.errorMessage).red);
					return;
				}
				var termWidth = 80;
				if (process.stdout.getWindowSize) { // May be null if output is redirected
					termWidth = process.stdout.getWindowSize()[0];
				}

				if (!cmd.format || cmd.format === "text") {
					var header = verb.toUpperCase() + " for " + resource + ": ";
					while (header.length < termWidth )
						header += " ";
					console.log(header.bgWhite.blue);
				}				
				//console.log(JSON.stringify(putData, null, 2));
			
				if (!cmd.format || cmd.format === "text") {
					var trailer = "Request took: " + (endTime - startTime) + "ms";
					trailer += " - # objects touched: ";
					if (putData.txsummary && putData.txsummary.length == 0) {
						console.log('No data returned'.yellow);
						return;
					}
					trailer += putData.txsummary.length;
					while (trailer.length < termWidth)
						trailer += " ";
					console.log(trailer.bgWhite.blue);
					console.log(' '.reset);
				}
			});
		});
	}
};
