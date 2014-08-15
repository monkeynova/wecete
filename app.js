
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env'))
{
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/user', routes.user );
app.get('/user/:id', routes.user );

app.get('/collection/add', routes.collection.create );
app.get('/collection/edit', routes.collection.edit );
app.get('/collection/delete', routes.collection.delete );
app.get('/collection/:id', routes.collection.view );

app.get('/achievement/add', routes.achievement.create );
app.get('/achievement/edit', routes.achievement.edit );
app.get('/achievement/have', routes.achievement.setHave );
app.get('/achievement/delete', routes.achievement.delete );
app.get('/achievement/:id', routes.achievement.view );

app.get('/icon/:id', routes.icon );

http.createServer(app).listen
(
    app.get('port'),
    function()
    {
        console.log('Express server listening on port ' + app.get('port'));
    }
);
