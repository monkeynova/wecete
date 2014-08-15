var site = require('./site');
var Promise = require('promise');

var siteData = site.siteData();
var db = site.denodeDB();

exports.view = function(req,res)
{
    var userID = site.currentUser( req );
    var collection;

    db.denodeAll( "SELECT * FROM collections WHERE id=$id;", { $id : req.params.id } )
    .then
    (
	function (collections)
        {
	    collection = collections[0] || {};
            collection.editable = site.canWrite( req, collection );
	    return Promise.all			
	    ([
		db.denodeAll( "SELECT * FROM achievements WHERE collection = $collectionID;", { $collectionID : collection.id } ),
		db.denodeAll( "SELECT * FROM users WHERE id=$id;", { $id : collection.owner } ),
		db.denodeAll( "SELECT * FROM haves WHERE user=$user AND achievement IN ( SELECT id from achievements WHERE collection = $collectionID)", { $collectionID : collection.id, $user : userID } )
	    ]);
	},
	site.htmlErrorSender( res )
    )
    .then
    (
	function (data)
        {
	    var achievements = data[0] || [];
	    var owners = data[1] || [];
	    var haves = data[2] || [];
	    
	    var havesById = {};
	    haves.forEach( function(h) { havesById[h.achievement] = h; } );
	    
	    achievements.forEach( function(a) { a.owner = collection.owner; a.editable = site.canWrite( req, a ); a.have = havesById[a.id] } );
	    collection.achievements = achievements;
	    
	    collection.owner = owners[0] || {};
	    
	    res.render('collection', { site : siteData, collection : collection } );
	},
	site.htmlErrorSender( res )
    );
};

exports.create = function(req,res)
{
    var userID = site.currentUser( req );

    db.denodeRun( "INSERT INTO collections ( created, modified, owner, privacy ) VALUES ( date('now'), date('now'), $userID, 1 );", { $userID : userID } )
    .then( function () { return db.denodeAll( "SELECT last_insert_rowid() AS id FROM achievements;" ); }, site.jsonErrorSender( res ) )
    .then( function ( rows ) { var newidrow = rows[0] || {}; res.send( { newid : newidrow.id } ) }, site.jsonErrorSender( res ) );
}

exports.delete = function(req,res)
{
    var collectionID = req.query.collection;

    db.denodeAll( "DELETE FROM collections WHERE id=collection;", { collection : collectionID } )
    .then( function () { res.send( { removed : 1 } ); }, site.jsonErrorSender( res ) );
}

exports.edit = function(req,res)
{
    var collectionID = req.query.collection;
    var newTitle = req.query.title;
    var newDescription = req.query.description || '';

    // XXX assert( site.canWrite() );

    db.denodeRun
    (
	"UPDATE collections SET title=$title, description=$description, modified=date('now') WHERE id=$id",
        {
   	    $id : collectionID,
   	    $title : newTitle,
	    $description : newDescription
	}
    )
    .then( res.send( { updated : 1, description_md : siteData.markdown.toHTML( newDescription )  } ), site.jsonErrorSender( res ) );
}

exports.setFollow = function(req,res)
{
    res.send( 404, 'Not found' );
}
