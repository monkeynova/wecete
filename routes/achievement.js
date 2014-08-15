var site = require('./site');
var Promise = require('promise');

var siteData = site.siteData();
var db = site.denodeDB();

exports.view = function(req,res)
{
    db.all
    (
        "SELECT * from achievements WHERE id=$id;", { $id : req.params.id },
        function (err,achievements)
        {
	    res.render('achievement', { site : siteData, achievement : achievements[0] || {} } );
	}
    );
};

exports.create = function(req,res)
{
    var collectionID = req.query.collection;

    Promise.all
    ([
	db.denodeRun( "UPDATE collections SET modified=date('now') WHERE id = $collectionID;", { $collectionID : collectionID } ),
	db.denodeRun( "INSERT INTO achievements ( collection ) VALUES ( $collectionID );", { $collectionID : collectionID } )
    ])
    .then( function () { return db.denodeAll( "SELECT last_insert_rowid() AS id FROM achievements;" ); }, site.jsonErrorSender( res ) )
    .then( function ( rows ) { var newidrow = rows[0] || {}; res.send( { newid : newidrow.id } ) }, site.jsonErrorSender( res ) );
}

exports.delete = function(req,res)
{
    var achievementID = req.query.achievement;

    db.denodeRun
    (
	"UPDATE collections SET modified=date('now') WHERE id IN (SELECT collection FROM achievements WHERE id=$achievement);",
        { $achievement : achievementID }
    )
    .then
    (
	function () { return db.denodeAll( "DELETE FROM achievements WHERE id=$achievement;", { $achievement : achievementID } ); }, 
	site.jsonErrorSender( res )
    )
    .then( function () { res.send( { removed : 1 } ); }, site.jsonErrorSender( res ) );
}

exports.edit = function(req,res)
{
    var achievementID = req.query.achievement;
    var newTitle = req.query.title;
    var newDescription = req.query.description;

    // XXX assert( site.canWrite() );

    db.denodeRun
    (
	"UPDATE achievements SET title=$title, description=$description WHERE id=$id",
        {
   	    $id : achievementID,
   	    $title : newTitle,
	    $description : newDescription
	}
    )
    .then( res.send( { updated : 1 } ), site.jsonErrorSender( res ) );
}

exports.setHave = function(req,res)
{
    var user = site.currentUser( req );
    var achievement = req.query.achievement;
    var have = req.query.have == true;

    var binds =
    {
        $user : user,
	$achievement : achievement
    };

    var command = have ? "INSERT INTO haves VALUES ( $user, $achievement, date('now') );"
                       : "DELETE FROM haves WHERE user = $user AND achievement = $achievement;";

    db.denodeRun( command, binds ).then( res.send( { updated : 1 } ), site.jsonErrorSender( res ) );
}

