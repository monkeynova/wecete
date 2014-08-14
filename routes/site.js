var markdown = require( 'markdown' ).markdown;
var sqlite3 = require('sqlite3').verbose();
var Promise = require('promise');
var path = require('path');
var db_file = path.join( process.env.HOME, 'www', 'dbs', 'wecete.db' );
var db = new sqlite3.Database( db_file );

db.denodeAll = Promise.denodeify( db.all );
db.denodeRun = Promise.denodeify( db.run );

var siteData =
{
    title : 'WeCete',
    markdown : markdown,
    defaultAvatar : 2,
    defaultHave : 1,
    defaultNeed : 0
};


exports.siteData = function() { return siteData; };
exports.denodeDB = function() { return db; };


exports.currentUser = function (req)
{
    return 1; // monkeynova
}

exports.canRead = function (req,viewable,userID)
{
    return true;
}

exports.canWrite = function (req,editable,userID)
{
    if ( ! userID )
    {
	userID = exports.currentUser( req );
    }

    if ( editable.owner == userID )
    {
        return true;
    }

    return false;
}

exports.htmlErrorSender = function (res)
{
    return function (err)
    {
	res.render('error', { site : siteData, error : err } );
    }
}

exports.jsonErrorSender = function (res)
{
    return function (err)
    {
	res.send( { error : err } );
    }
}
