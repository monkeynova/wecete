
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

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
app.get('/user/:id', routes.user );
app.get('/collection/add', routes.newCollection );
app.get('/collection/:id', routes.collection );
app.get('/achievement/add', routes.newAchievement );
app.get('/achievement/:id', routes.achievement );
app.get('/icon/:id', routes.icon );

http.createServer(app).listen
(
    app.get('port'),
    function()
    {
        console.log('Express server listening on port ' + app.get('port'));
    }
);
