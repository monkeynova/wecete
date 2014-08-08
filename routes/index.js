
/*
 * GET home page.
 */

var sqlite3 = require('sqlite3').verbose();
var path = require('path');
var db_file = path.join( process.env.HOME, 'wecete.db' );
var db = new sqlite3.Database( db_file );

function currentUser(req)
{
    return 1; // monkeynova
}

function canEdit(req,userID,editable)
{
    if ( editable.owner == userID )
    {
        return true;
    }

    return false;
}

exports.index = function(req, res)
{
    res.render('index', { title: 'WeCete' });
};

exports.icon = function(req,res)
{
    db.all
    (
        "SELECT * from icons where id = " + req.params.id + ";",
        function (err,icons)
        {
	    var icon = icons[0];
	    res.set( 'Content-type', icon.mime_type );
	    res.send( icon.data );
        }
    );
};

exports.user = function(req,res)
{
    var user_id = req.params.id || currentUser( req );
    db.all
    (
        "SELECT * from users where id = " + user_id + ";",
        function (err,users)
        {
            var user = users[0];
	    db.all
            (
                "SELECT * from collections where owner = '" + user.id + "';",
                 function (err,collections)
                 {
		     user.collections = collections || [];
                     res.render('user', { user : user } );
		 }
            );
        }
    );
};

exports.collection = function(req,res)
{
    db.all
    (
        "SELECT * from collections WHERE id = " + req.params.id + ";",
        function (err,collections)
        {
	    var collection = collections[0];
            collection.editable = canEdit( req, currentUser( req ), collection );
	    db.all
            (
                "SELECT * from achievements where collection = '" + collection.id + "';",
                function (err,achievements)
                {
                    achievements.forEach( function(a) { a.editable = canEdit( req, currentUser( req ), a ) } );
		    collection.achievements = achievements;

                    db.all
                    (
                        "SELECT * from users where id = '" + collection.owner + "';",
                        function (err,owners)
                        {
                            collection.owner = owners[0];
                            res.render('collection', { collection : collection } );
                        }
                    );
		}
            );
	}
    );
};

exports.achievement = function(req,res)
{
    db.all
    (
        "SELECT * from achievements WHERE id = " + req.params.id + ";",
        function (err,achievements)
        {
	    res.render('achievement', { achievement : achievements[0] } );
	}
    );
};

exports.newAchievement = function(req,res)
{
    res.send( 404, 'Not Found');
}

exports.newCollection = function(req,res)
{
    res.send( 404, 'Not Found');
}
