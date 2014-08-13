
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
db.denodeRun = Promise.denodeify( db.run );

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

function htmlErrorSender(res)
{
    return function (err)
    {
	res.render('error', { site : site, error : err } );
    }
}

function jsonErrorSender(res)
{
    return function (err)
    {
	res.send( { error : err } );
    }
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
    var userID = currentUser( req );

    db.denodeAll( "SELECT * FROM collections WHERE id=$id;", { $id : req.params.id } )
    .then
    (
	function (collections)
        {
	    var collection = collections[0] || {};
            collection.editable = canWrite( req, collection );
	    Promise.all			
	    ([
		db.denodeAll( "SELECT * FROM achievements WHERE collection = $collectionID;", { $collectionID : collection.id } ),
		db.denodeAll( "SELECT * FROM users WHERE id=$id;", { $id : collection.owner } ),
		db.denodeAll( "SELECT * FROM haves WHERE user=$user AND achievement IN ( SELECT id from achievements WHERE collection = $collectionID)", { $collectionID : collection.id, $user : userID } )
	    ])
	    .then
	    (
		function (data)
		{
		    var achievements = data[0] || [];
		    var owners = data[1] || [];
		    var haves = data[2] || [];

		    var havesById = {};
		    haves.forEach( function(h) { havesById[h.achievement] = h; } );

                    achievements.forEach( function(a) { a.owner = collection.owner; a.editable = canWrite( req, a ); a.have = havesById[a.id] } );
		    collection.achievements = achievements;

		    collection.owner = owners[0] || {};

		    res.render('collection', { site : site, collection : collection } );
		},
		htmlErrorSender( res )
	    );
	},
	htmlErrorSender( res )
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

    db.denodeRun
    (
	"UPDATE achievements SET title=$title, description=$description WHERE id=$id",
        {
   	        $id : achievementID,
   	        $title : newTitle,
		$description : newDescription
	}
    )
    .then( res.send( { updated : 1 } ), jsonErrorSender( res ) );
}

exports.haveAchievement = function(req,res)
{
    var user = currentUser( req );
    var achievement = req.query.achievement;
    var have = req.query.have == true;

    var binds =
    {
        $user : user,
	$achievement : achievement
    };

    var command = have ? "INSERT INTO haves VALUES ( $user, $achievement, date('now') );"
                       : "DELETE FROM haves WHERE user = $user AND achievement = $achievement;";

    console.log( command );
    
    db.denodeRun( command, binds ).then( res.send( { updated : 1 } ), jsonErrorSender( res ) );
}

exports.newCollection = function(req,res)
{
    res.send( 404, 'Not Found');
}

exports.editCollection = function(req,res)
{
    res.send( 404, 'Not Found');
}
