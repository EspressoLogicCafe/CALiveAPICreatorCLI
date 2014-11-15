// Print a JSON object as succinctly as possible, including subobjects

var _ = require('underscore');
var colors = require('colors');
var _ = require('underscore');

module.exports = {
	printObject: function(obj, prefix, indent, action, truncate) {
		var termWidth = process.stdout.getWindowSize()[0];
		truncate = truncate ? truncate : 20;

		var objSum = "";
		
		if (action) {
			switch(action) {
				case 'INSERT': objSum += "I ".cyan; break;
				case 'UPDATE': objSum += "U ".magenta; break;
				case 'DELETE': objSum += "D ".yellow; break;
			}
		}
		
		
//		for (var i = 0; i < indent; i++) {
//			objSum = " " + objSum;
//		}
		
		// If this is the next page object, treat as such
		if (obj['@metadata'] && obj['@metadata'].next_batch) {
			objSum += "more...";
			console.log(objSum.cyan);
			nextBatch = true;
			return;
		}
		
		var entNameLength = 0;
		var pkLength = 0;
		if (obj['@metadata']) {
			var entName = obj['@metadata'].href.match(/.*\/([^/]+)\/[^/]+$/);
			entNameLength = entName[1].length;
			var pk = obj['@metadata'].href.match(/.*\/(.+)$/);
			pkLength = pk[1].length;
			objSum += entName[1].green + "/" + pk[1].cyan;
		}
		var numPropsShown = 0;
		var objectProps = {};
		var lineLength = indent + entNameLength + pkLength + 3;
		if (prefix) {
			lineLength += prefix.length + 2;
		}
		for (var prop in obj) {
			if ("@metadata" === prop) { continue; }
			var val = obj[prop];
			//console.log('Property ' + prop + ' is of type ' + typeof val + " : " + val);
			if (val === null) {
				val = "[null]";
			}
			else if (Array.isArray(val)) {
				if (val.length > 0 && (typeof val[0]) === 'object') {
					objectProps[prop] = val;
					continue;
				}
				else {
					var varStr = "[";
					_.each(val, function(v) {
						if (varStr.length > 1) {
							varStr += ",";
						}
						varStr += v;
					});
					val = varStr + "]";
				}
			}
			else if ((typeof val) === 'object') {
				objectProps[prop] = val;
				continue;
			}
			else {
				val = "" + obj[prop];
				if (typeof val == 'string')
					val = val.replace(/\n/g, "");
			}
			lineLength += prop.length + 2;
			if (val.length > truncate)
				val = val.substring(0, truncate-3) + "...";
			lineLength += val.length;
			if (lineLength > termWidth) { continue; }
			objSum += " " + (prop + ":").yellow + val;
			numPropsShown++;
		}
		if (prefix) {
			objSum = prefix + ": " + objSum;
		}
		for (var i = 0; i < indent; i++) {
			objSum = " " + objSum;
		}
		console.log(objSum);
		
		for (var subObjName in objectProps) {
			var val = objectProps[subObjName];
			if (Array.isArray(val)) {
				_.each(val, function(obj) {
					module.exports.printObject(obj, subObjName, indent + 2, truncate);
				});
			}
			else {
				module.exports.printObject(objectProps[subObjName], subObjName, indent + 2, truncate);
			}
		}
	}
};

