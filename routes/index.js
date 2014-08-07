
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
    db.each( "SELECT * from collections WHERE id = 1", function (err,row) {
	    row.achievements = [ { title : 'Foo' } ];
	    res.render('collection', row );
	});
};

exports.achievement = function(req,res){
    db.each( "SELECT * from achievements WHERE id = 1", function (err,row) {
	    res.render('achievement', { a : row } );
	});
};
