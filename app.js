//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");
// mongoose encrypt will encrpyt one we use function save() and decrypt it once we use function find()
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));
// ######################################################################################
mongoose.connect('mongodb://localhost:27017/userDB', err => {
    if (err) throw err;
    else console.log('connected to mongoDB!!!')
});

// ######################################################################################
//create a schema model for our database

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Why does email have no name?"]
    },
    // use built-in function to validate data input
    password: String
});
// ######################################################################################
// encrypting key
const secret = "Thisisourlittlesecret";
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });
// plugin would add more function to the current package
const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save(function (err) {
        if (err) { console.log(err) }
        else { res.render("secrets"); }
    });
});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ email: username }, function (err, result) {
        if (!err) {
            if (result) {
                if (result.password === password) {
                    res.render("secrets");
                }
            }
        } else {
            console.log(err);
        }
    })
});

// ######################################################################################
app.listen(3000, function () {
    console.log("Server started on port 3000");
});