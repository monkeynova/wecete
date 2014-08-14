
/*
 * GET home page.
 */

var site = require('./site');
var Promise = require('promise');

var siteData = site.siteData();
var db = site.denodeDB();

exports.achievement = require('./achievement');
exports.collection = require('./collection');

exports.index = function(req, res)
{
    res.render('index', { site : siteData });
};

exports.icon = function(req,res)
{
    db.denodeAll( "SELECT * FROM icons WHERE id=$id;", { $id : req.params.id } )
    .then
    (
        function (icons)
        {
	    var icon = icons[0] || {};
	    res.set( 'Content-type', icon.mime_type );
	    res.send( icon.data );
        },
	site.htmlErrorSender( res )
    );
};

exports.user = function(req,res)
{
    var user_id = req.params.id || site.currentUser( req );
    var user;

    db.denodeAll( "SELECT * FROM users WHERE id=$id;", { $id : user_id } ).then
    (
        function (users)
        {
            user = users[0] || {};
	    user.owner = user.id;
	    user.editable = site.canWrite( req, user );
	    return Promise.all
	    ([
		db.denodeAll( "SELECT * FROM collections WHERE owner=$user;", { $user : user.id } ),
		db.denodeAll
		(
		    "SELECT collection,count(id) as count FROM achievements" +
		    "  WHERE collection IN ( SELECT id FROM collections WHERE owner=$user) GROUP BY collection;",
		    { $user : user.id }
		),
		db.denodeAll
		(
		    "SELECT collection,count(achievement) as haves FROM haves" +
		    "  LEFT OUTER JOIN achievements on achievements.id = haves.achievement" +
		    "  WHERE achievements.collection IN ( SELECT id FROM collections WHERE owner=$user) GROUP BY collection;",
		    { $user : user.id }
		)
	    ]);
	},
	site.htmlErrorSender( res )
    )
    .then
    (
	function (results)
        {
	    var collections = results[0] || [];
	    var counts = results[1] || [];
	    var haves = results[2] || [];

	    var idToCounts = {};
	    collections.forEach( function(c) { idToCounts[c.id] = {} } );
	    counts.forEach( function(c) { if ( idToCounts[c.collection] ) { idToCounts[c.collection].count = c.count; } } );
	    haves.forEach( function(h) { if ( idToCounts[h.collection] ) { idToCounts[h.collection].haves = h.haves; } } );

	    user.collections = collections.filter( function(c) { return site.canRead( req, c ); } );
	    user.collections.forEach( function(c) { counts = idToCounts[c.id] || {}; c.haves = counts.haves; c.count = counts.count; } );

	    res.render('user', { site : siteData, user : user } );
	},
	site.htmlErrorSender( res )
    );
};
