isDigit = function (c) {
	return c >= '0' && c <= '9';
};

getSession = function() {
	return fetch("https://sleepy-plateau-47583.herokuapp.com/session", {
		credentials: "include"
	});
};

authenticateUser = function(email, password) {
	let data = "email=" + encodeURIComponent(email);
	data += "&plainPassword=" + encodeURIComponent(password);
	return fetch("https://sleepy-plateau-47583.herokuapp.com/session", {
		credentials: "include",
		body: data,
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	});
};


var App = new Vue({
	el: '#app',
	data: {
		deleteButtonStyle: "deleteButton",
		newBook: false,
		edited: false,
		server: new Server(),

		searchInput: "",

		bookNameInput: "",
		authorInput: "",
		datePublishedInput: "",
		bookTypeInput: "",
		blurbInput: "",

		currentBookName: "",
		currentAuthor: "",
		currentDatePublished: "",
		currentBookType: "",
		currentBlurb: "",
		currentID: "",

		userID: "",
		loginEmail: "",
		loginPassword: "",

		// 0 = search mode, 1 = view mode, 2 = edit mode, 3 = login mode, 4 = signup mode.
		mode: 3,

		physicalBooks: [],
		kindleBooks: [],
		audibleBooks: [], 
		searchResults: []
	},
	methods: {

		ErrorCheck: function () { // returns true if no errors.
			var flag = true;
			var errorLog = [];
			if (bookNameInput.value == "") {
				flag = false;
				errorLog.push("You must enter a book name.");
			}
			if (authorInput.value == "") {
				flag = false;
				errorLog.push("You must enter an author.");
			}
			if (datePublishedInput.value != "") {
				var flag2 = false;
				if (datePublishedInput.value.length != 10) {
					flag2 = true;
				} else {
					if (datePublishedInput.value.charAt(2) != '/' || datePublishedInput.value.charAt(5) != '/') {
						flag2 = true;
					}
					if (!isDigit(datePublishedInput.value.charAt(0)) || !isDigit(datePublishedInput.value.charAt(1)) ||
						!isDigit(datePublishedInput.value.charAt(3)) || !isDigit(datePublishedInput.value.charAt(4)) ||
						!isDigit(datePublishedInput.value.charAt(6)) || !isDigit(datePublishedInput.value.charAt(7)) ||
						!isDigit(datePublishedInput.value.charAt(8)) || !isDigit(datePublishedInput.value.charAt(9))) {
						flag2 = true;
						
					}
				}
				if (flag2) {
					flag = false;
					errorLog.push("Date must be specified as MM/DD/YYYY.");
				}
			}
			if (datePublishedInput.value == "") {
				flag = false;
				errorLog.push("Date Published is required.")
			}

			if (bookTypeInput.value == "") {
				flag = false;
				errorLog.push("Book type is required.");
			} else if (bookTypeInput.value != "Physical" && bookTypeInput.value != "Kindle" && bookTypeInput.value != "Audible") {
				flag = false;
				errorLog.push("Book type must be either \"Physical\", \"Kindle\", or \"Audible\".");
			}

			if (errorLog.length != 0) {
				var errorString = "";
				for (var i = 0; i < errorLog.length; i++) {
					errorString += errorLog[i] + "\n";
				}
				alert(errorString);
			}
			return flag;
		},

		DoneEditing: function () {
			if (this.ErrorCheck()) {
				this.mode = 1;
				this.currentBookName = this.bookNameInput;
				this.currentAuthor = this.authorInput;
				this.currentDatePublished = this.datePublishedInput;
				this.currentBookType = this.bookTypeInput;
				this.currentBlurb = this.blurbInput;
				this.deleteButtonStyle = "deleteButton";
			}
		},

		StartEditing: function () {
			if (!this.newBook) {
				this.edited = true;
			}

			this.bookNameInput = this.currentBookName;
			this.authorInput = this.currentAuthor;
			this.datePublishedInput = this.currentDatePublished;
			this.bookTypeInput = this.currentBookType
			this.blurbInput = this.currentBlurb;
			this.mode = 2;
			this.deleteButtonStyle = "deleteButtonShifted";
		},

		BackToBooks: function () {
			this.mode = 0;

			if (this.newBook) {
				this.SaveBook();
			} else if (this.edited) {
				this.UpdateBook();
			}

			// Clear everything when going back to search mode.
			this.currentBookName = "";
			this.currentAuthor = "";
			this.currentDatePublished = "";
			this.currentBookType = "";
			this.currentBlurb = "";
			this.currentID = "";

			this.bookNameInput = "";
			this.authorInput = "";
			this.datePublishedInput = "";
			this.bookTypeInput = "";
			this.blurbInput = "";

			this.newBook = false;
			this.edited = false;
		},

		AddNewPhysical: function () {
			this.mode = 2;
			this.deleteButtonStyle = "deleteButtonShifted";
			this.newBook = true;
			this.currentBookType = "Physical";
			this.bookTypeInput = "Physical";
		},

		AddNewKindle: function () {
			this.mode = 2;
			this.deleteButtonStyle = "deleteButtonShifted";
			this.newBook = true;
			this.currentBookType = "Kindle";
			this.bookTypeInput = "Kindle";
		},

		AddNewAudible: function () {
			this.mode = 2;
			this.deleteButtonStyle = "deleteButtonShifted";
			this.newBook = true;
			this.currentBookType = "Audible";
			this.bookTypeInput = "Audible";
		},

		SearchChanged: function () {
			this.searchResults = [];

			if (this.searchInput != "") {
				for (var i = 0; i < this.physicalBooks.length; i++) {
					if (this.physicalBooks[i].name.toLowerCase().includes(this.searchInput.toLowerCase())) {
						this.searchResults.push(this.physicalBooks[i]);
					}
				}
				for (var i = 0; i < this.kindleBooks.length; i++) {
					if (this.kindleBooks[i].name.toLowerCase().includes(this.searchInput.toLowerCase())) {
						this.searchResults.push(this.kindleBooks[i]);
					}
				}
				for (var i = 0; i < this.audibleBooks.length; i++) {
					if (this.audibleBooks[i].name.toLowerCase().includes(this.searchInput.toLowerCase())) {
						this.searchResults.push(this.audibleBooks[i]);
					}
				}
			}
		},

		DeleteBookButton: function () {
			this.mode = 0;
			if (this.currentID != "") {
				this.DeleteBook();
			}

			this.currentBookName = "";
			this.currentAuthor = "";
			this.currentDatePublished = "";
			this.currentBookType = "";
			this.currentBlurb = "";
			this.currentID = "";

			this.bookNameInput = "";
			this.authorInput = "";
			this.datePublishedInput = "";
			this.bookTypeInput = "";
			this.blurbInput = "";
			this.deleteButtonStyle = "deleteButton";
		},

		ViewItem: function (book) {
			this.mode = 1;

			this.currentBookName = book.name;
			this.currentAuthor = book.author;
			this.currentDatePublished = book.datePublished;
			this.currentBookType = book.type;
			this.currentBlurb = book.blurb;
			this.currentID = book._id;

		},

		SwitchAuthenticationModes: function () {
			this.loginEmail = "";
			this.loginPassword = "";
			if (this.mode == 3) {
				this.mode = 4;
			} else {
				this.mode = 3;
			}
		},

		AttemptAuthentication: function () {
			if (this.loginEmail == "" && this.loginPassword == "") {
				alert("You must provide an email and a password.");
			} else if (this.loginEmail == "") {
				alert("You must provide an email.");
			} else if (this.loginPassword == "") {
				alert("You must provide a password.");
			} else {
				if (this.mode == 3) {
					// Attempt to login the user.
					authenticateUser(this.loginEmail, this.loginPassword).then(response => {
						if (response.status == 401) {
							alert("Invalid Username or password.");
						} else if (response.status == 201) {
							this.CheckedLoggedIn();
						}
					});
				} else {
					// Create a new user.
					userData = "email=" + encodeURIComponent(this.loginEmail) +
					"&plainPassword=" + encodeURIComponent(this.loginPassword);

					this.server.post("/user", userData, (res) => {
						if (res.status == 422) {
							alert("This email address is already in use.")
						} else {
							authenticateUser(this.loginEmail, this.loginPassword).then(response => {
								this.CheckedLoggedIn();
							});
						}
					});
				}
			}
		},

		DeleteBook: function () {
			// use the current stuff to find which book to delete. Save an ID.
			// console.log("Delete Book");
			this.server.delete("/books/"+this.currentID, (res) => {
				this.LoadBooks();
			});
		},

		SaveBook: function () {
			// console.log("Save Book");
			bookData = "name=" + encodeURIComponent(this.currentBookName) + 
			"&author=" + encodeURIComponent(this.currentAuthor) + 
			"&datePublished=" + encodeURIComponent(this.currentDatePublished) +
			"&type=" + encodeURIComponent(this.currentBookType) + 
			"&blurb=" + encodeURIComponent(this.currentBlurb) + 
			"&userID=" + encodeURIComponent(this.userID);			

			this.server.post("/books", bookData, (res) => {
				this.LoadBooks();
			});
		},

		UpdateBook: function () {
			// console.log("Update Book");

			
			bookData = "name=" + encodeURIComponent(this.currentBookName) + 
			"&author=" + encodeURIComponent(this.currentAuthor) + 
			"&datePublished=" + encodeURIComponent(this.currentDatePublished) +
			"&type=" + encodeURIComponent(this.currentBookType) + 
			"&blurb=" + encodeURIComponent(this.currentBlurb);
			

			this.server.put("/books/"+this.currentID, bookData, (res) => {
				this.LoadBooks();
			});
		},

		LoadBooks: function () {
			this.physicalBooks = [];
			this.kindleBooks = [];
			this.audibleBooks = [];

			// console.log("Loading Books");
			this.server.get("/books", (data) => {
				for(var i = 0; i < data.length; i++) {
					if (data[i].type == "Physical") {
						this.physicalBooks.push(data[i]);
					} else if (data[i].type == "Kindle") {
						this.kindleBooks.push(data[i]);
					} else if (data[i].type == "Audible") {
						this.audibleBooks.push(data[i]);
					} else {
						console.log("Invalid book type " + data[i].type + " found.");
					}
				}
			});
		},

		CheckedLoggedIn: function () {
			getSession().then(response => {
				if (response.status == 401) {
					// not logged in
					console.log("user is not logged in");
					this.mode = 3;
				} else if (response.status == 200) {
					// logged in
					console.log("user is logged in");
					this.mode = 0;
					this.LoadBooks();
				}
			});
		}

	},
	created: function () {
		// Called when the Vue app is loaded and ready.

		this.CheckedLoggedIn();
	}
});