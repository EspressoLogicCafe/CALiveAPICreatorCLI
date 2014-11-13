
var osenv = require('osenv');
var fs = require('fs');
var querystring = require("querystring");
var _ = require('underscore');

module.exports = {
	
	// Get the name of the dot directory.
	getDotDirectory: function(createIfNotExists) {
		var dotDirName = osenv.home() + "/.espresso";
		if ( ! fs.existsSync(dotDirName)) {
			fs.mkdirSync(dotDirName, 0700);
		}
		if ( ! fs.lstatSync(dotDirName).isDirectory()) {
			throw "File " + dotDirName + " is not a directory!";
		}
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
		var dotFileName = dotDirName + "/" + querystring.escape(name);
		var dotFile = fs.openSync(dotFileName, 'w', 0600);
		fs.writeSync(dotFile, JSON.stringify(data, null, 2));
	},
	
	deleteDotFile: function(name) {
		var dotDirName = this.getDotDirectory(true);
		var dotFileName = dotDirName + "/" + querystring.escape(name);
		fs.unlinkSync(dotFileName);
	},
	
	deleteDotFileForAlias: function(alias) {
		var dotFile = this.getDotFileForAlias(alias);
		if ( ! dotFile) {
			console.log(('Unknown alias: ' + alias).red);
			return;
		}
		fs.unlinkSync(dotFile);
	},
	
	getDotFileForAlias: function(alias) {
		var dotDirName = this.getDotDirectory(true);
		if ( ! dotDirName) {
			return null;
		}
		var allFiles = fs.readdirSync(dotDirName);
		var dotFile = _.find(allFiles, function(f) {
			//console.log('File: ' + f);
			if (f === 'currentServer.txt') {
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
	
	// Get the API key for the given URL, if available and current
	getApiKey: function(url) {
		var dotDirName = this.getDotDirectory();
		var dotFileName = dotDirName + "/" + querystring.escape(url);
		if ( ! fs.existsSync(dotDirName)) {
			return null;
		}
		var keyObject = JSON.parse(fs.readFileSync(dotFileName));
		var expiration = Date.parse(keyObject.loginInfo.expiration);
		if (expiration > new Date()) {
			return keyObject.loginInfo.apikey;
		}
		console.log('The API key for this server has expired - you need to log in again'.yellow);
		this.deleteDotFile(url);
		return null;
	},
	
	// Write the given URL to ~/.espresso/currentServer.txt
	setCurrentServer: function(url) {
		var dotDirName = this.getDotDirectory();
		var dotFileName = dotDirName + "/currentServer.txt";
		var dotFile = fs.openSync(dotFileName, 'w', 0600);
		fs.writeSync(dotFile, url);
	},
	
	// If there is a ~/.espresso/currentServer.txt, return its content, otherwise null
	getCurrentServer: function() {
		var dotDirName = this.getDotDirectory();
		var dotFileName = dotDirName + "/currentServer.txt";
		if ( ! fs.existsSync(dotDirName)) {
			return null;
		}
		return fs.readFileSync(dotFileName);
	},
	
	unsetCurrentServer: function() {
		var dotDirName = this.getDotDirectory();
		var dotFileName = dotDirName + "/currentServer.txt";
		fs.unlinkSync(dotFileName);
	}
};
