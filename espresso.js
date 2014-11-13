#!/usr/bin/env node

/**
 * A command-line interface for Espresso Logic
 */

var program = require('commander');
var path = require('path');
var pkg = require( path.join(__dirname, 'package.json') );
var Client = require('node-rest-client').Client;

var login = require('./commands/login.js');
var get = require('./commands/get.js');
var post = require('./commands/post.js');
var del = require('./commands/delete.js');
var dotfile = require('./util/dotfile.js');


program
	.version(pkg.version);

program
	.command('login')
	.description('Login to an Espresso Logic server')
	.option('-u, --url <url>', 'The URL for the Espresso Logic server')
	.option('-U, --username <username>', 'The Espresso user name under which to log in')
	.option('-p, --password <password>', 'The Espresso password')
	.option('-a, --alias [alias]', 'The alias for this server')
	.action(login.commandLogin);

program
	.command('logout')
	.description('Logout from the current server, or a specific server')
	.option('-u, --url [url]', 'The URL from which to logout')
	.option('-a, --alias [alias]', 'The alias from which to logout')
	.action(login.commandLogout);

program
	.command('get')
	.description('Retrieve some data')
	.option('-r, --resource <resource>', 'The name of the table or resource')
	.option('-k, --pk <pk>', 'The name of the table or resource')
	.option('-f, --filter <filter>', 'Optional: a filter, e.g. "balance<1000"')
	.option('-s, --sort <sort>', 'Optional: a sorting order, e.g. "balance,name desc"')
	.option('-z, --pagesize <pagesize>', 'Optional: up to how many rows to return per level')
	.option('-m, --format <format>', 'Optional: format of output, either text (default), json or compactjson')
	.action(get.commandGet);

program
	.command('post')
	.description('Insert some data')
	.option('-r, --resource <resource>', 'The name of the table or resource')
	.option('-j, --json <json>', 'JSON for the data being inserted')
	.option('-f, --jsonfile <jsonfile>', 'The name of a file containing JSON to be inserted, or stdin to read from stdin')
	.option('-m, --format <format>', 'Optional: format of output, either text (default), json or compactjson')
	.action(function(cmd) { post.commandPost(cmd, 'post'); });

program
	.command('put')
	.description('Update some data')
	.option('-r, --resource <resource>', 'The name of the table or resource')
	.option('-j, --json <json>', 'JSON string for the data being updated')
	.option('-f, --jsonfile <jsonfile>', 'The name of a file containing JSON to be updated, or stdin to read from stdin')
	.option('-m, --format <format>', 'Optional: format of output, either text (default), json or compactjson')
	.action(function(cmd) { post.commandPost(cmd, 'put'); });

program
	.command('delete')
	.description('Delete some data')
	.option('-r, --resource <resource>', 'The name of the resource from which to delete')
	.option('-k, --pk <pk>', 'The primary key of the object to delete')
	.option('--checksum <checksum>', 'The checksum for the object to delete, or "override"')
	.option('-f, --jsonfile <jsonfile>', 'The name of a file containing JSON to be deleted, or stdin to read from stdin')
	.option('-m, --format <format>', 'Optional: format of output, either text (default), json or compactjson')
	.action(del.commandDelete);

program.parse(process.argv);
exports.program = program;

//console.log("URL: " + program.url);

