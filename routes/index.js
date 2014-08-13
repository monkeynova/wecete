
/*
 * GET home page.
 */

var sqlite3 = require('sqlite3').verbose();
var Promise = require('promise');
var path = require('path');
var db_file = path.join( process.env.HOME, 'wecete.db' );
var db = new sqlite3.Database( db_file );
var site = require('./site').site();

db.denodeAll = Promise.denodeify( db.all );

function currentUser(req)
{
    return 1; // monkeynova
}

function canRead(req,viewable,userID)
{
    return true;
}

function canWrite(req,editable,userID)
{
    if ( ! userID )
    {
	userID = currentUser( req );
    }

    if ( editable.owner == userID )
    {
        return true;
    }

    return false;
}

exports.index = function(req, res)
{
    res.render('index', { site : site });
};

exports.icon = function(req,res)
{
    db.all
    (
        "SELECT * FROM icons WHERE id=$id;", { $id : req.params.id },
        function (err,icons)
        {
	    var icon = icons[0] || {};
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
        "SELECT * FROM users WHERE id=$id;", { $id : user_id },
        function (err,users)
        {
            var user = users[0] || {};
	    user.owner = user.id;
	    user.editable = canWrite( req, user );
	    db.all
            (
                "SELECT * FROM collections WHERE owner=$id;", { $id : user.id },
                 function (err,collections)
                 {
		     user.collections = [];
                     collections.forEach
                     (
                         function(c)
                         {
                             if ( canRead( req, c ) )
                             {
                                 user.collections.push( c );
                             }
                         }
                     );

                     res.render('user', { site : site, user : user } );
		 }
            );
        }
    );
};

exports.collection = function(req,res)
{
    var user = currentUser( req );

    db.denodeAll( "SELECT * from collections WHERE id=$id;", { $id : req.params.id } )
    .then
    (
	function (collections)
        {
	    var collection = collections[0] || {};
            collection.editable = canWrite( req, collection );
	    Promise.all			
	    ([
		db.denodeAll( "SELECT * from achievements where collection = $collectionID;", { $collectionID : collection.id } ),
		db.denodeAll( "SELECT * FROM users WHERE id=$id;", { $id : collection.owner } )
	    ])
	    .then
	    (
		function (data)
		{
		    var achievements = data[0] || [];
		    var owners = data[1] || {};

                    achievements.forEach( function(a) { a.owner = collection.owner; a.editable = canWrite( req, a ) } );
		    collection.achievements = achievements;

		    collection.owner = owners[0];

		    res.render('collection', { site : site, collection : collection } );
		},
		function (err) { res.render( 'error', { site : site, error : err } ); }
	    );
	},
	function (err) { res.render( 'error', { site : site, error : err } ); }
    );
};

exports.achievement = function(req,res)
{
    db.all
    (
        "SELECT * from achievements WHERE id=$id;", { $id : req.params.id },
        function (err,achievements)
        {
	    res.render('achievement', { site : site, achievement : achievements[0] || {} } );
	}
    );
};

exports.newAchievement = function(req,res)
{
    var collectionID = req.query.collection;
    db.serialize
    (
	function()
        {
	    db.run( "UPDATE collections SET modified=date('now') WHERE id = $collectionID;", { $collectionID : collectionID } );
	    db.run
	    (
		"INSERT INTO achievements ( collection ) VALUES ( $collectionID );", { $collectionID : collectionID },
		function (err)
		{
		    db.all
		    (
			"SELECT last_insert_rowid() AS id FROM achievements;",
			function (err,newAchievements)
			{
			    var newAchievement = newAchievements[0] || {};
			    res.send( { newid : newAchievement.id, err : err } );
			}
		    );
		}
	    );
	}
    );
}

exports.editAchievement = function(req,res)
{
    var achievementID = req.query.achievement;
    var newTitle = req.query.title;
    var newDescription = req.query.description;

    // XXX assert( canWrite() );

    db.run
    (
	"UPDATE achievements SET title=$title, description=$description WHERE id=$id",
        {
   	        $id : achievementID,
   	        $title : newTitle,
		$description : newDescription
	},
	function (err)
        {
	    res.send( { updated : 1, err : err } );
	}
    );
}

exports.newCollection = function(req,res)
{
    res.send( 404, 'Not Found');
}

exports.editCollection = function(req,res)
{
    res.send( 404, 'Not Found');
}
