
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
	    return db.denodeAll( "SELECT * FROM collections WHERE owner=$id;", { $id : user.id } );
	},
	site.htmlErrorSender( res )
    )
    .then
    (
	function (collections)
        {
	    user.collections = collections.filter( function(c) { return site.canRead( req, c ); } );
	    res.render('user', { site : siteData, user : user } );
	},
	site.htmlErrorSender( res )
    );
};
