var fs = require( 'fs' );
var path = require( 'path' );
var sqlite3 = require( 'sqlite3' ).verbose();
var db_fname = path.join( process.env.HOME, 'www', 'dbs', 'wecete.db' );
var db = new sqlite3.Database( db_fname );

console.log( "Don't run this anymore" );
process.exit();

if ( fs.existsSync( db_fname ) )
{
    console.log( 'Removing existing db' );
    fs.unlinkSync( db_fname );
}

db.serialize
(
   function()
   {
     console.log( 'Creating table privacy' );
     db.run
     (
          "CREATE TABLE privacy " +
	  "(" +
          "  id INTEGER PRIMARY KEY," +
          "  name TEXT" +
	  ");"
     );

     console.log( 'Creating table icons' );
     db.run
     (
          "CREATE TABLE icons " +
	  "(" +
	  "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
	  "  mime_type TEXT," +
	  "  width INTEGER NOT NULL," +
	  "  height INTEGER NOT NULL," +
	  "  name TEXT," +
	  "  data BLOB" +
	  ");"
     );

     console.log( 'Creating table users' );
     db.run
     (
      "CREATE TABLE users " +
      "(" +
      "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "  username TEXT UNIQUE," +
      "  realname TEXT," +
      "  email TEXT," +
      "  website TEXT," +
      "  avatar INTEGER," +
      "  FOREIGN KEY( avatar ) REFERENCES icons(id)" +
      ");"
     );

     console.log( 'Creating table 3rd party' );
     db.run
     (
      "CREATE TABLE externalUsers " +
      "(" +
      "  othername TEXT," +
      "  url TEXT," +
      "  user INTEGER NOT NULL," +
      "  FOREIGN KEY( user ) REFERENCES users(id)" +
      ");"
     );

     console.log( 'Creating table collections' );
     db.run
     (
      "CREATE TABLE collections " +
      "(" +
      "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "  created DATETIME, " +
      "  modified DATETIME, " +
      "  title TEXT," +
      "  description TEXT," +
      "  owner INTEGER NOT NULL," +
      "  privacy INTEGER NOT NULL," +
      "  FOREIGN KEY( owner ) REFERENCES users(id)," +
      "  FOREIGN KEY( privacy ) REFERENCES privacy(id)" +
      ");"
     );

     console.log( 'Creating table achievements' );
     db.run
     (
      "CREATE TABLE achievements " +
      "(" +
      "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "  title TEXT," +
      "  description TEXT," +
      "  need_icon INTEGER," +
      "  have_icon INTEGER," +
      "  collection INTEGER NOT NULL," +
      "  FOREIGN KEY( have_icon ) REFERENCES icons(id)," +
      "  FOREIGN KEY( need_icon ) REFERENCES icons(id)," +
      "  FOREIGN KEY( collection ) REFERENCES collections(id)" +
      ");"
     );

     console.log( 'Creating table haves' );
     db.run
     (
      "CREATE TABLE haves " +
      "(" +
      "  user INTEGER," +
      "  achievement INTEGER, " +
      "  earned DATETIME, " +
      "  FOREIGN KEY( user ) REFERENCES user(id)," +
      "  FOREIGN KEY( achievement ) REFERENCES achievement(id)" +
      ");"
     );

     console.log( 'Creating table user_follows' );
     db.run
     (
         "CREATE TABLE user_follows " +
         "(" +
         "  follower INTEGER, " +
         "  followee INTEGER, " +
         "  FOREIGN KEY( follower ) REFERENCES user(id)," +
         "  FOREIGN KEY( followee ) REFERENCES user(id) " +
         ");"
     );

     console.log( 'Creating table collection_follows' );
     db.run
     (
         "CREATE TABLE collection_follows " +
         "(" +
         "  user INTEGER, " +
         "  collection INTEGER, " +
         "  FOREIGN KEY( user ) REFERENCES users(id)," +
         "  FOREIGN KEY( collection ) REFERENCES collections(id) " +
         ");"
     );

     console.log( 'Inserting test achievement' );
     db.run( "INSERT INTO privacy VALUES ( 0, 'private' );" );
     db.run( "INSERT INTO privacy VALUES ( 1, 'public' );" );
     db.run( "INSERT INTO privacy VALUES ( 2, 'followers' );" );
     db.run( "INSERT INTO users VALUES ( NULL, 'monkeynova', 'Keith Peters', 'keith@monkeynova.com', 'http://www.monkeynova.com/', NULL );");
     db.run( "INSERT INTO users VALUES ( NULL, 'steam', 'Steam Connect', '', 'http://store.steampowered.com/', NULL );");
     db.run( "INSERT INTO users VALUES ( NULL, 'psn', 'Playstation Network Connect', '', 'http://us.playstation.com/', NULL );");
     db.run( "INSERT INTO users VALUES ( NULL, 'xbox', 'Xbox Live Connect', '', 'http://www.xbox.com/live/', NULL );");
     db.run( "INSERT INTO collections SELECT NULL, date('now'), date('now'), 'Test', 'Nothing to see here', users.id, privacy.id from users, privacy where users.username = 'monkeynova' AND privacy.name = 'public';" );
     db.run( "INSERT INTO achievements SELECT NULL, 'You''ve got Mail!', 'Receive an email asking if the user''s email is working', NULL, NULL, id from collections where title = 'Test';" );
     db.run( "INSERT INTO icons VALUES ( 0, 'image/png', 60, 60, 'need_check', @png )", fs.readFileSync( 'icons/need_check.png' ) );
     db.run( "INSERT INTO icons VALUES ( 1, 'image/png', 60, 60, 'have_check', @png )", fs.readFileSync( 'icons/have_check.png' ) );
     db.run( "INSERT INTO icons VALUES ( 2, 'image/png', 128, 128, 'default_avatar', @png )", fs.readFileSync( 'icons/default_avatar.png' ) );
  }
);

db.close();
