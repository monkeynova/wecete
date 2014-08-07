
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

exports.user = function(req,res) {
    db.all( "SELECT * from users where id = " + req.params.id + ";", function (err,users) {
	    var user = users[0];
	    db.all( "SELECT * from collections where user = '" + user.id + "';", function (err,collections) {
		    user.collections = collections;
		    res.render('user',user);
		});
    });
};

exports.collection = function(req,res){
    db.all( "SELECT * from collections WHERE id = " + req.params.id + ";", function (err,collections) {
	    var collection = collections[0];
	    db.all( "SELECT * from achievements where collection = '" + collection.id + "';", function (err,achievements) {
		    collection.achievements = achievements;
		    res.render('collection',collection);
		});
	});
};

exports.achievement = function(req,res){
    db.all( "SELECT * from achievements WHERE id = " + req.params.id + ";", function (err,achievements) {
	    res.render('achievement', { a : achievements[0] } );
	});
};
