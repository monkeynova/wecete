
/*
 * GET home page.
 */

var sqlite3 = require('sqlite3').verbose();
var path = require('path');
var db_file = path.join( process.env.HOME, 'wecete.db' );
var db = new sqlite3.Database( db_file );

exports.index = function(req, res){
  res.render('index', { title: 'WeCete' });
};

exports.collection = function(req,res){
    db.each( "SELECT * from collections WHERE id = 1;", function (err,collection) {
	    db.all( "SELECT * from achievements where collection = '" + collection.id + "';", function (err,achievements) {
		    collection.achievements = achievements;
		    res.render('collection',collection);
		}
		);
	});
};

exports.achievement = function(req,res){
    db.each( "SELECT * from achievements WHERE id = 1;", function (err,achievement) {
	    res.render('achievement', { a : achievement } );
	});
};
