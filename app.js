require('dotenv').config();
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
    .once('open', () => console.log('Connected'))
    .on('error', (error) => {
        console.log('Error' + error);
    });

const productRoute = require('./server/api/product/product.route');
const userRoute = require('./server/api/user/user.route');
const orderRoute = require('./server/api/order/order.route');
const statisticRoute = require('./server/api/statistic/statistic.route');
const authRoute = require('./server/api/auth/auth.route');

const loginMiddleware = require('./server/middleware/checklogin.middleware');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/upload', express.static('public'));

app.use('/auth', authRoute);
app.use('/product', productRoute);
app.use('/user', userRoute);
app.use('/order', loginMiddleware, orderRoute);
app.use('/statistic', statisticRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(port, function() {
    console.log('App is listening on port ' + port);
});

module.exports = app;