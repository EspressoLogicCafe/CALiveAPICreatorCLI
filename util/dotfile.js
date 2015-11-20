
var osenv = require('osenv');
var fs = require('fs');
var querystring = require("querystring");
var _ = require('underscore');

module.exports = {
	
	// Get the name of the dot directory.
	getDotDirectory: function(createIfNotExists) {
		var dotDirName = osenv.home() + "/.liveapicreator";
		if ( ! fs.existsSync(dotDirName)) {
			if (createIfNotExists) {
				fs.mkdirSync(dotDirName, 0700);
				return dotDirName;
			}
			else {
				return null;
			}
		}
		return dotDirName;
	},
	
	// Write the given data to the dot file with the given URL
	writeToDotFile: function(name, data) {
		var dotDirName = this.getDotDirectory(true);
		var dotFileName = dotDirName + "/" + querystring.escape(name) + "--" + data.userName;
		var dotFile = fs.openSync(dotFileName, 'w', 0600);
		fs.writeSync(dotFile, JSON.stringify(data, null, 2));
	},
	
	deleteDotFile: function(url, userName) {
		var dotDirName = this.getDotDirectory(true);
		if ( ! dotDirName) {
			return null;
		}
		var allFiles = fs.readdirSync(dotDirName);
		_.each(allFiles, function(f) {
			if (f === 'currentServer.txt' || f === 'admin') {
				return;
			}
			var fileContent = JSON.parse(fs.readFileSync(dotDirName + "/" + f));
			if (fileContent.url === url && fileContent.userName === userName) {
				console.log('Deleting login file: ' + f);
				fs.unlinkSync(dotDirName + "/" + f);
			}
		});
	},
	
	// Delete the dot file for the given alias.
	// Return true if successful, false otherwise
	deleteDotFileForAlias: function(alias) {
		var dotFile = this.getDotFileForAlias(alias);
		if ( ! dotFile) {
			return false;
		}
		fs.unlinkSync(dotFile);
		return true;
	},
	
	getDotFileForAlias: function(alias) {
		var dotDirName = this.getDotDirectory(false);
		if ( ! dotDirName) {
			return null;
		}
		var allFiles = fs.readdirSync(dotDirName);
		var dotFile = _.find(allFiles, function(f) {
			if (f === 'currentServer.txt' || f === 'admin') {
				return false;
			}
			var fileContent = JSON.parse(fs.readFileSync(dotDirName + "/" + f));
			return fileContent.alias === alias;
		});
		if ( ! dotFile) {
			return null;
		}
		return dotDirName + "/" + dotFile;
	},
	
	getLoginForAlias: function(alias) {
		var dotFileName = this.getDotFileForAlias(alias);
		if ( ! fs.existsSync(dotFileName)) {
			return null;
		}
		var keyObject = JSON.parse(fs.readFileSync(dotFileName));
		var expiration = Date.parse(keyObject.loginInfo.expiration);
		if (expiration > new Date()) {
			return keyObject;
		}
		console.log('The API key for this server has expired - you need to log in again'.yellow);
		this.deleteDotFileForAlias(alias);
		return null;
	},
	
	// Get the API key for the given URL, if available and current
	getApiKey: function(url, userName) {
		//console.log('Getting API key for user: ' + userName);
		var dotDirName = this.getDotDirectory();
		var dotFileName = dotDirName + "/" + querystring.escape(url) + "--" + userName;
		if ( ! fs.existsSync(dotFileName)) {
			return null;
		}
		var keyObject = JSON.parse(fs.readFileSync(dotFileName));
		var expiration = Date.parse(keyObject.loginInfo.expiration);
		if (expiration > new Date()) {
			return keyObject.loginInfo.apikey;
		}
		console.log('The API key for this server has expired - you need to log in again'.yellow);
		this.deleteDotFile(url, userName);
		return null;
	},
	
	// Write the given URL to ~/.liveapicreator/currentServer.txt
	setCurrentServer: function(url, login) {
		var dotDirName = this.getDotDirectory();
		var dotFileName = dotDirName + "/currentServer.txt";
		var dotFile = fs.openSync(dotFileName, 'w', 0600);
		var record = {
			url: url,
			userName: login.userName
		};
		fs.writeSync(dotFile, JSON.stringify(record));
	},
	
	// If there is a ~/.liveapicreator/currentServer.txt, return its content, otherwise null
	getCurrentServer: function() {
		var dotDirName = this.getDotDirectory();
		var dotFileName = dotDirName + "/currentServer.txt";
		if ( ! fs.existsSync(dotDirName)) {
			return null;
		}
		var objStr = fs.readFileSync(dotFileName);
		return JSON.parse(objStr);
	},
	
	unsetCurrentServer: function() {
		var dotDirName = this.getDotDirectory();
		var dotFileName = dotDirName + "/currentServer.txt";
		fs.unlinkSync(dotFileName);
	}
};
