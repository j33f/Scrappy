var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var io = require('socket.io');

var routes = require('./routes/index');
var examine = require('./routes/examine');
var scrap = require('./routes/scrap');
var data = require('./routes/data');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/examine', examine);
app.use('/scrap', scrap.router);
app.use('/data', data);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 1337);

var debug = require('debug')('scrappy');
var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});

var sio = io.listen(server);

sio.sockets.on('connection', function(socket) {
    socket.on('scrap', function(json) {
        scrap.scrap(socket, json);
    });
});

module.exports = app;
