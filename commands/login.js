
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
		if ( ! cmd.username) {
			console.log('You must specify a user name'.red);
			return;
		}
		if ( ! cmd.password) {
			console.log('You must specify a password'.red);
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
				try {
					
					data = JSON.parse(data);
				}
				catch(e) {
					console.log(data);
					if (data.length > 6 && data.substring(0, 6) === '<html>') {
						console.log('The server is alive, but the URL seems to be incorrect.'.red);
						return;
					}
					console.log(('Unable to parse server response - please make sure your URL is correct: ' + e).red);
					return;
				}
			}
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
					
			console.log(("This server licensed to: " + data.company + " license_type: "+ data.license_type).green);
			console.log(("License will expire: "+ data.license_expiration).green); 
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
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
					
					dotfile.writeToDotFile(url, fullData)
					.then(
						// Log completion of login process.
						function(val){	
							console.log(('Login successful, this API key will expire on: ' + fullData.loginInfo.expiration).green);
						}
						)
					.catch(
						// Login fails if that file cannot be written. 
						function(reason){
							console.log(('Login failed, Reason : ' + reason).green);
							throw "Error logging in";
						}
						);
					dotfile.setCurrentServer(url, fullData);
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
				console.log(('Unknown alias: ' + cmd.serverAlias).yellow);
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
			console.log(('No such alias: ' + serverAlias).yellow);
			return;
		}
		dotfile.setCurrentServer(login.url, login);
		console.log(('You are now using server ' + login.url + " as user " + login.userName).green);
	},
	
	commandStatus: function() {
		
		var numAliases = 0;
		var tbl = new Table({
			head: ['Alias', 'LAC Server', 'User']
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

		// Show the current server, if any
		var currentLogin = dotfile.getCurrentServer();
		if (currentLogin && dotfile.getApiKey(currentLogin.url, currentLogin.userName)) {
			console.log('You are currently logged in to CA Live API Creator server: ' + currentLogin.url.yellow + 
					' as user ' + currentLogin.userName.yellow);
		}
		else {
			console.log('You are not currently logged in to any CA Live API Creator server'.yellow);
		}
		
	}
};
