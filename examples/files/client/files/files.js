// Code generated by Remoto; DO NOT EDIT.

// Remoto JavaScript Client
//
// uses the Fetch API: to support older browsers, use the polyfil https://github.github.io/fetch/

'use strict';

// ImagesClientOptions are the options for the ImagesClient.

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ImagesClientOptions = exports.ImagesClientOptions = function () {
	function ImagesClientOptions() {
		var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, ImagesClientOptions);

		this._data = data;
		this._data.endpoint = this._data.endpoint || "http://localhost:8080";
	}

	_createClass(ImagesClientOptions, [{
		key: 'endpoint',
		get: function get() {
			return this._data.endpoint;
		},
		set: function set(endpoint) {
			this._data.endpoint = endpoint;
		}
	}]);

	return ImagesClientOptions;
}();

// Images provides image services.


var ImagesClient = exports.ImagesClient = function () {
	function ImagesClient(options) {
		_classCallCheck(this, ImagesClient);

		this.options = options;
	}

	_createClass(ImagesClient, [{
		key: 'Flip',
		value: function Flip() {
			var flipRequest = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

			return this.FlipMulti([flipRequest]).then(function (responses) {
				return responses[0];
			});
		}

		// FlipMulti is the batch version of Flip.

	}, {
		key: 'FlipMulti',
		value: function FlipMulti(flipRequests) {
			var data = new FormData();
			flipRequests.forEach(function (request) {
				if (request && !request instanceof FlipRequest) {
					throw 'ImagesClient.Flip: requests must be instances of FlipRequest';
				}
				var allfiles = request.allFiles();
				allfiles.forEach(function (fieldname) {
					data.set(fieldname, allfiles[fieldname]);
				});
			});
			data.set('json', JSON.stringify(flipRequests));
			return fetch(this.options.endpoint() + '/remoto/Images.Flip', {
				method: 'post', body: data,
				headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' }
			}).then(function (responseData) {
				// success
				var responses = [];
				responseData.json().forEach(function (response) {
					responses.push(new remototypes.FileResponse(response));
				});
				return responses;
			}, function (error) {
				// error
				throw 'ImagesClient.Flip: ' + error.message;
			});
		}
	}]);

	return ImagesClient;
}();

// FlipRequest is the request for Images.Flip.


var FlipRequest = exports.FlipRequest = function () {
	function FlipRequest() {
		var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		_classCallCheck(this, FlipRequest);

		this._data = data;
		this._files = {};
		this._filesCount = 0;
	}

	// addFile adds a file to the request and returns its unique name.
	// This method is not usually called directly, instead callers should use the setters
	// on the objects.


	_createClass(FlipRequest, [{
		key: 'addFile',
		value: function addFile(filename, file) {
			var fieldname = 'files[' + this._filesCount++ + ']';
			this._files[fieldname] = file;
			return fieldname;
		}

		// allFiles gets an object of files in this request, keyed with
		// the fieldname.

	}, {
		key: 'toJSON',


		// toJSON gets a JSON string describing this object.
		value: function toJSON() {
			return JSON.stringify(this._data);
		}
	}, {
		key: 'setImage',
		value: function setImage(request, filename, image) {
			this._data.image = request.addFile(filename, image);
		}
	}, {
		key: 'allFiles',
		get: function get() {
			return this._files;
		}
		// filesCount gets the number of files in this request.

	}, {
		key: 'filesCount',
		get: function get() {
			return this._filesCount;
		}
	}, {
		key: 'image',
		get: function get() {
			return this._data.image;
		}
	}]);

	return FlipRequest;
}();
