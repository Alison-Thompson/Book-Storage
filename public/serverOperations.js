// Need to revamp this to work with server errors.
function Server() {
	this.url = "https://sleepy-plateau-47583.herokuapp.com";
	this.port = "";
	this.ContentType = "application/x-www-form-urlencoded";
};

Server.prototype.get = function(path, callback, errorCallback) { // needs path and callback.
	fetch(this.url+this.port+path, {
		credentials: "include"
	}).then(function (response) {
		if (response.status == 401) {
			if (typeof errorCallback !== 'undefined') {
				errorCallback(response);
			}
		} else {
			response.json().then(function (data) {
				if (response.status == 200) {
					callback(data);
				} else if (response.status == 404) {
					console.log("Invalid path in GET request.");
				}
			});
		}
	});
};

Server.prototype.post = function(path, body, callback) { // needs path and body.
	// Remember that body recived needs to already be json.
	fetch(this.url+this.port+path, {
		method: "POST",
		body: body,
		credentials: "include",
		headers: {
			"Content-Type": this.ContentType
		}
	}).then(function (response) {
		if(typeof callback !== 'undefined') {
				callback(response);
		}
		if (response.status == 400) {
			console.log("Invalid body in POST request.");
		} else if (response.status == 404) {
			console.log("Invalid path in POST request.");
		}
	});
};

Server.prototype.put = function(path, body, callback) { // needs path and body.
	// Remember that body recived needs to already be json.
	fetch(this.url+this.port+path, {
		method: "PUT",
		body: body,
		credentials: "include",
		headers: {
			"Content-Type": this.ContentType
		}
	}).then(function (response) {
		if(typeof callback !== 'undefined'){
				callback(response);
		}
		if (response.status == 400) {
			console.log("Invalid body in PUT request.");
		} else if (response.status == 404) {
			console.log("Invalid path in PUT request.");
		}
	});
};

Server.prototype.delete = function(path, callback) { // needs path.
	fetch(this.url+this.port+path, {
		method: "DELETE",
		credentials: "include"
	}).then(function (response) {
		if(typeof callback !== 'undefined'){
			callback(response);
		}
		if (response.status == 400) {
			console.log("Invalid body in DELETE request.");
		} else if (response.status == 404) {
			console.log("Invalid path in DELETE request.");
		}
	});
};