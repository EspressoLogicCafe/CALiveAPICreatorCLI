
var Client = require('node-rest-client').Client;
var colors = require('colors');

var dotfile = require('../util/dotfile.js');

module.exports = {
	commandLogin: function (cmd) {
		console.log('Logging in...');
		var client = new Client();
		
		client.get(cmd.url + "/@license", function(data) {
			console.log("This server licensed to: " + data.company.red);

			client.post(cmd.url + "/@authentication",
				{
					data: {
						username: cmd.username,
						password: cmd.password
					},
					headers: {"Content-Type": "application/json"}
				},
				function(data, response) {
					//console.log(data);
					if (data.errorMessage) {
						console.log(("Login failed: " + data.errorMessage).red);
						return;
					}
					var fullData = {
						url: cmd.url,
						userName: cmd.username,
						alias: cmd.alias,
						loginInfo: data
					};
					dotfile.writeToDotFile(cmd.url, fullData);
					dotfile.setCurrentServer(cmd.url);
					console.log(('Login successful, API key will expire on: ' + data.expiration).green);
				}).on('error', function(err) {
					console.log(('ERROR: ' + err).red);
					throw "Error logging in: " + err;
				}
			);
		});
		
	},
	
	commandLogout: function(cmd) {
		console.log("Logging out...");
		if (cmd.url) {
			dotfile.deleteDotFile(cmd.url);
		}
		else if (cmd.alias) {
			dotfile.deleteDotFileForAlias(cmd.alias);
			console.log(('Logout successful for alias ' + cmd.alias).green);
		}
		else {
			dotfile.unsetCurrentServer();
			console.log('Logout successful'.green);
		}
	}
};
