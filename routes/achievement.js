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

