// BEGIN DATA MODEL
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb+srv://web4200:htcENZ61WYGs6Sok@cluster0.cxlp3.mongodb.net/bookListWithUsers?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	firstName: {
		type: String
	},
	lastName: {
		type: String
	},
	encryptedPassword: {
		type: String,
		required: true
	}
});

userSchema.methods.setEncryptedPassword = function(plainPassword, callback) {
	bcrypt.hash(plainPassword, 12).then((hash) => {
		this.encryptedPassword = hash;
		callback();
	});
};

userSchema.methods.verifyPassword = function (plainPassword, callback) {
	bcrypt.compare(plainPassword, this.encryptedPassword).then(result => {
		callback(result);
	});
};

const User = mongoose.model('User', userSchema);


const Book = mongoose.model('Book', { 
	name: {
		type: String,
		required: [true, "You must specify a book name."]
	},
	author: {
		type: String,
		required: [true, "You must specify an author name."]
	},
	datePublished: {
		type: String,
		required: [true, "You must specify a publish date."],
		minLength: [10, "Date must be specified as Month/Day/Year."],
		maxLength: [10, "Date must be specified as Month/Day/Year."]

	},
	type: {
		type: String,
		required: [true, "You must provide a book type that's either Physical, Kindle, or Audible."],
		enum: ["Physical", "Kindle", "Audible"]
	},
	blurb: String,
	userID: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "userID",
		required: true
	}
});


module.exports = {
	Book: Book,
	User, User
};