require('dotenv').config();
var createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const port = 4000;

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

mongoose.connection
    .once("open", () => console.log("Connected"))
    .on("error", error => { console.log("Error" + error) })

const registerRoute = require('./routes/register');
const loginRoute = require('./routes/login');
const productRoute = require('./routes/product');
const verifyRoute = require('./routes/verify');
const userRoute = require('./routes/user');
const infoRoute = require('./routes/info');
const cartRoute = require('./routes/cart');
const purchaseRoute = require('./routes/purchase');

const adminMiddleware = require('./middleware/checkadmin.middleware');
const loginMiddleware = require('./middleware/checkLogin.middleware');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/register', registerRoute);
app.use('/login', loginRoute);
app.use('/product', productRoute);
app.use('/verify', verifyRoute);
app.use('/user', adminMiddleware, userRoute);
app.use('/info', loginMiddleware, infoRoute);
app.use('/cart', loginMiddleware, cartRoute);
app.use('/purchase', loginMiddleware, purchaseRoute);

// catch 404 and forward to error handler

app.listen(port, function(req, res, next) {
    console.log("App is listening on port " + port);
})