
var Client = require('node-rest-client').Client;
var colors = require('colors');
var fs = require('fs');
var _ = require('underscore');
var Table = require('cli-table');

var dotfile = require('../util/dotfile.js');

module.exports = {
	commandLogin: function (url, cmd) {
		console.log('Logging in...');
		var client = new Client();
		
		if ( ! url) {
			console.log('You must specify the URL to the API Server'.red);
			return;
		}
		
		// Check that the URL looks well-formed
		if (! url.match(/http:\/\/localhost:8080\/.*/) && ! url.match(/^https?:\/\/[\w-\.]+\/rest\/[\w-]+\/[\w-]+\/[\w-]+\/?$/)) {
			console.log('The URL you specified seems incomplete. It should be in the form:'.red);
			console.log('   http[s]://<server>[:<port>]/rest/<account>/<project>/<api-version>'.yellow);
			return;
		}
		
		// Remove trailing slash if present
		if (url.match(/.*\/$/)) {
			url = url.substring(0, url.length - 1);
		}
		
		client.get(url + "/@license", function(data) {
			if (typeof data === "string") {
				data = JSON.parse(data);
			}
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			console.log("This server licensed to: " + data.company);

			client.post(url + "/@authentication",
				{
					data: {
						username: cmd.username,
						password: cmd.password
					},
					headers: {"Content-Type": "application/json"}
				},
				function(data, response) {
					if (data.errorMessage) {
						console.log(("Login failed: " + data.errorMessage).red);
						return;
					}
					var fullData = {
						url: url,
						userName: cmd.username,
						alias: cmd.serverAlias,
						loginInfo: data
					};
					
					dotfile.writeToDotFile(url, fullData);
					dotfile.setCurrentServer(url, fullData);
					var aliasMsg = "";
					if (cmd.serverAlias) {
						aliasMsg = " - alias for this connection is: " + cmd.serverAlias.green;
					}
					console.log(('Login successful, API key will expire on: ' + data.expiration).green + aliasMsg);
				}).on('error', function(err) {
					console.log(('ERROR: ' + err).red);
					throw "Error logging in: " + err;
				}
			);
		});
		
	},
	
	commandLogout: function(url, cmd) {
		if (url) {
			dotfile.deleteDotFile(url);
		}
		else if (cmd.serverAlias) {
			if (dotfile.deleteDotFileForAlias(cmd.serverAlias)) {
				console.log(('Logout successful for alias ' + cmd.serverAlias).green);
			}
			else {
				console.log(('Unknown alias: ' + cmd.serverAlias).red);
			}
		}
		else {
			dotfile.unsetCurrentServer();
			console.log('Logout successful'.green);
		}
	},
	
	commandUseAlias: function(serverAlias, cmd) {
		if ( ! serverAlias) {
			console.log('You must specify a server alias'.red);
			return;
		}
		var login = dotfile.getLoginForAlias(serverAlias);
		if ( ! login) {
			console.log(('No such alias: ' + serverAlias).red);
			return;
		}
		dotfile.setCurrentServer(login.url, login);
		console.log(('You are now using server ' + login.url + " as user " + login.userName).green);
	},
	
	commandStatus: function() {
		
		// Show the current server, if any
		var login = dotfile.getCurrentServer();
		if (login && dotfile.getApiKey(login.url, login.userName)) {
			console.log('You are currently logged in to server: ' + login.url.yellow + 
					' as user ' + login.userName.yellow);
		}
		else {
			console.log('You are not currently logged in to any server'.yellow);
		}
		
		var numAliases = 0;
		var tbl = new Table({
			head: ['Alias', 'Server', 'User']
		});
		var dotDirName = dotfile.getDotDirectory(false);
		if (dotDirName) {
			var allFiles = fs.readdirSync(dotDirName);
			
			_.each(allFiles, function(f) {
				if (f === 'currentServer.txt' || f === 'admin' || f === '.DS_Store') {
					return;
				}
				var fileContent = JSON.parse(fs.readFileSync(dotDirName + "/" + f));
				var expiration = Date.parse(fileContent.loginInfo.expiration);
				if (expiration > new Date()) {
					if (fileContent.alias) {
						tbl.push([fileContent.alias, fileContent.url, fileContent.userName]);
						numAliases++;
					}
				}
				else {
					dotfile.deleteDotFile(fileContent.url, fileContent.userName);
				}
			});
		}
		
		if (numAliases === 0) {
			console.log('No aliases currently defined'.yellow);
		}
		else {
			console.log("Defined aliases:");
			console.log(tbl.toString());
		}
	}
};
