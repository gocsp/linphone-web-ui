/*globals jQuery,linphone*/

linphone.ui.utils = {
	regex: {
		sip: {
			username: "([0-9a-zA-Z-_.!~*'()&=+$,;?/]+)",
			domain: "([0-9a-zA-Z.-]+)",
			complete: "([0-9a-zA-Z-_.!~*'()&=+$,;?/]+)@([0-9a-zA-Z.-]+)"
		}
	},
	formatToKey: function(text) {
		return text.toLowerCase().
				replace(/ /g, '_').
				replace(/\./g, '');
	},
	formatAddress: function(base, uri) {
		var core = linphone.ui.getCore(base);
		return core.interpretUrl(uri);
	},
	getTimeFormat: function(timestamp) {
		var date = new Date(parseInt(timestamp, 10) * 1000);
		var values = [
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
			date.getHours(),
			date.getMinutes(),
			date.getSeconds(),
			date.getMilliseconds(),
			date.getTimezoneOffset()
		];
		var getTimeZone = function(offset) {
			offset = - (offset/60);
			if(offset > 0) {
				offset = '+' + offset.toString();
			} else if(offset < 0) {
				offset = offset.toString();
			} else {
				offset = '';
			}
			return 'UTC' + offset;
		};
		function pad(number, length) {
			var str = '' + number;
			while (str.length < length) {
				str = '0' + str;
			}
			return str;
		}
		var format = jQuery.i18n.translate('global.stringFormat.time');
		format = format.replace(/yyyy/g, pad(values[0], 4));
		format = format.replace(/sss/g, pad(values[7], 3));
		format = format.replace(/MM/g, pad(values[1], 2));
		format = format.replace(/dd/g, pad(values[2], 2));
		format = format.replace(/HH/g, pad(values[3], 2));
		format = format.replace(/mm/g, pad(values[4], 2));
		format = format.replace(/ss/g, pad(values[5], 2));
		format = format.replace(/Z/g, getTimeZone(values[6]));
		return format;
	},
	getTime: function(base, timestamp) {
		var ret = jQuery.i18n.skeleton(jQuery.i18n.functionKey('linphone.ui.utils.getTimeFormat'), parseInt(timestamp, 10));
		return ret;
	},
	getDurationFormat: function(duration) {
		function pad(number, length) {
			var str = '' + number;
			while (str.length < length) {
				str = '0' + str;
			}
			return str;
		}
		var format = jQuery.i18n.translate('global.stringFormat.duration');
		var totalSeconds = parseInt(duration, 10);
		var seconds = totalSeconds%60;
		var totalMinutes = Math.floor(totalSeconds/60);
		var minutes = totalMinutes%60;
		var totalHours = Math.floor(totalMinutes/60);
		var hours = totalHours;
		
		// Hours
		if(hours !== 0) {
			format = format.replace(/\([^\(]*HH[^\)]*\)/g, function(string, offset) { return string.slice(1, -1); });
		} else {
			format = format.replace(/\([^\(]*HH[^\)]*\)/g, '');
		}
		format = format.replace(/HH/g, pad(hours, 2));
		
		// Minutes
		if(hours !==0 || minutes !== 0) {
			format = format.replace(/\([^\(]*mm[^\)]*\)/g, function(string, offset) { return string.slice(1, -1); });
		} else {
			format = format.replace(/\([^\(]*mm[^\)]*\)/g, '');
		}
		format = format.replace(/mm/g, pad(minutes, 2));
		
		// Seconds
		format = format.replace(/\([^\(]*ss[^\)]*\)/g, function(string, offset) { return string.slice(1, -1); });
		format = format.replace(/ss/g, pad(seconds, 2));
		return format;
	},
	getDuration: function(base, duration) {
		var ret = jQuery.i18n.skeleton(jQuery.i18n.functionKey('linphone.ui.utils.getDurationFormat'), parseInt(duration, 10));
		return ret;
	},
	getUsername: function(base, object) {
		var address;
		if (typeof object === 'string') {
			var core = linphone.ui.getCore(base);
			address = core.newAddress(object);
		} else {
			address = object;
		}
		if(!address) {
			return String(object);
		}
		var displayName = address.displayName;
		if(displayName) {
			return displayName;
		}
		var username = address.username;
		if(username) {
			return username;
		}
		return 'Unknown';
	},
	getAddress: function(base, object) {
		var address;
		if (typeof object === 'string') {
			var core = linphone.ui.getCore(base);
			address = core.newAddress(object);
		} else {
			address = object;
		}
		var proxy = linphone.ui.utils.getMainProxyConfig(base);
		if(proxy) {
			if(proxy.domain === address.domain) {
				return address.username;
			}
		}
		var uri = address.asStringUriOnly();
		if(uri) {
			return uri;
		}
		return 'Unknown';
	},
	getAvatar: function(base, object) {
		return 'tmp/marcel.jpg';
	},
	getMainProxyConfig: function(base) {
		var proxy = null;
		if(linphone.ui.core.isRunning(base)) {
			var core = linphone.ui.getCore(base);
			proxy = core.defaultProxy;
		}
		return proxy;
	},
	call: function(base, object, success, failure) {
		var address;
		if (typeof object === 'string') {
			address = linphone.ui.utils.formatAddress(base, object);
		} else {
			address = object;
		}
		
		if(address) {
			var core = linphone.ui.getCore(base);
			core.inviteAddress_async(address);
			linphone.ui.logger.log(base, "Call: " + address.asString());
			if(typeof success !== 'undefined') {
				success();
			}
		} else {
			if(typeof failure !== 'undefined') {
				failure();
			}
		}
	}
};