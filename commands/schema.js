var Client = require('node-rest-client').Client;
var colors = require('colors');
var _ = require('underscore');
var Table = require('easy-table');
var fs = require('fs');
var dotfile = require('../util/dotfile.js');
var printObject = require('../util/printObject.js');
var login = require('../util/login.js');

module.exports = {
	doSchema: function(action, cmd) {
		if (action === 'list') {
			module.exports.list(cmd);
		}
		else if (action === 'export') {
			module.exports.export(cmd);
		}
		else if (action === 'swagger') {
			module.exports.swagger(cmd);
		}
		else {
			console.log('You must specify an action: list, swagger, or export');
			//program.help();
		}
	},
	
	list: function (cmd) {
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;

		client.get(url + "/@tables?sysorder=(entity:asc_uc,entity:desc)&pagesize=1000", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type": "application/json"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('Tables');
			var table = new Table();
			_.each(data, function(p) {
				table.cell("Prefix", p.prefix);
				table.cell("Name", p.name);
				table.cell("Entity", p.entity);
				table.newRow();
			});
			table.sort(['Name', 'name']);
			if (data.length === 0) {
				console.log('There are no tables defined for this project'.yellow);
			}
			else {
				console.log(table.toString());
			}
			printObject.printHeader("# tables: " + data.length);
		});
	},
	export: function(cmd) {
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		
		
		var filter = "";
		if (cmd.prefix) {
			filter = "/"+cmd.prefix;
		} else {
			console.log('Missing parameter: please specify datasource --prefix (e.g. demo, main) '.red);
			return;
		}
		
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		
		client.get(url + "/@schema"+ filter, {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type": "application/json"
			}
		}, function(data) {
			//console.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no such datassource prefix").red);
				return;
			}
			
			if (toStdout) {
				console.log(JSON.stringify(data, null, 2));
			} else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Tables has been exported to file: ' + cmd.file).green);
			}
		});
	},
	swagger: function(cmd) {
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		
		client.get(url + "/@docs", {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type": "application/json"
			}
		}, function(data) {
			//console.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no swagger doc found").red);
				return;
			}
			
			if (toStdout) {
				console.log(JSON.stringify(data, null, 2));
			}
			else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Swagger 2.0 Doc has been exported to file: ' + cmd.file).green);
			}
		});
	}
};
