var Client = require('node-rest-client').Client;
var _ = require('underscore');
var colors = require('colors');
var querystring = require("querystring");
var Table = require('easy-table');
var CLITable = require('cli-table');

var dotfile = require('../util/dotfile.js');
var printObject = require('../util/printObject.js');
var login = require('../util/login.js');
var get = require('../commands/get.js');

module.exports = {
	commandDescribe: function (resName, cmd) {
		var client = new Client();

		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			return;
		}
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;

		if ( ! resName) {
			console.log('Error: a resource or table name must be specified'.red);
			return;
		}
		
		var termWidth = 80;
		if (process.stdout.getWindowSize) // Does not exist if output is redirected
			termWidth = process.stdout.getWindowSize()[0];

		var startTime = new Date();
		client.get(url + "/@" + resName, {
			headers: {
				Authorization: "Espresso " + apiKey + ":1"
			}
		}, function(data) {
			var endTime = new Date();
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			
			if (resName === 'tables') {
				module.exports.describeTables(data, "Table");
			}
			if (resName === 'views') {
				module.exports.describeTables(data, "View");
			}
			else if (resName.match(/tables\/.+/)) {
				module.exports.describeTable(data, "Table");
			}
			else if (resName.match(/views\/.+/)) {
				module.exports.describeTable(data, "View");
			}
			else if (resName === 'license' || resName === 'serverinfo') {
				module.exports.asTable(data);
			}
		});
	},
	
	printHeader: function(str) {
		var termWidth = 100;
		if (process.stdout.getWindowSize) // Does not exist if output is redirected
			termWidth = process.stdout.getWindowSize()[0];
		
		while (str.length < termWidth )
			str += " ";
		console.log(str.bgWhite.blue);
	},
	
	describeTables: function(data, type) {
		
		module.exports.printHeader("All " + type + "s ");
		var table = new Table();
		_.each(data, function(tbl) {
			table.cell("DB", tbl.prefix);
			table.cell(type, tbl.entity);
			table.newRow();
		});
		console.log(table.toString());
		module.exports.printHeader("# " + type + "s: " + data.length);
	},
	
	describeTable: function(data, type) {

		module.exports.printHeader("Description of " + type + " " + data.name.magenta);
		
		var allCols = _.indexBy(data.columns, "name");
		
		var pkCols = {};
		if (data.primaryKeyColumns) {
			_.each(data.primaryKeyColumns, function(pkColName) {
				pkCols[pkColName] = allCols[pkColName];
			});
		}

		var table = new Table();
		_.each(data.columns, function(col) {
			table.cell("Name", col.name);
			table.cell("Type", col.type);
			table.cell("Size", col.size ? col.size : "", Table.padLeft);
			table.cell("PK", pkCols[col.name] ? "*" : "");
			table.newRow();
		});
		console.log(table.toString());
		module.exports.printHeader("# columns " + data.columns.length);
	},
	
	// When we just want to show name/value pairs
	asTable: function(data) {
		var table = new CLITable();
		_.each(data, function(v, n) {
			var row = {};
			row[n] = v;
			table.push(row);
		});
		console.log(table.toString());
	}
};

