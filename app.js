require('dotenv').config();
var createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const port = 4000;

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

mongoose.connection
    .once("open", () => console.log("Connected"))
    .on("error", error => { console.log("Error" + error) })

let registerRoute = require('./routes/register');
let loginRoute = require('./routes/login');
let productRoute = require('./routes/product');
let verifyRoute = require('./routes/verify');
let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/register', registerRoute);
app.use('/login', loginRoute);
app.use('/product', productRoute);
app.use('/verify', verifyRoute);

// catch 404 and forward to error handler

app.listen(port, function(req, res, next) {
    console.log("App is listening on port " + port);
})