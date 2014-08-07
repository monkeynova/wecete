var fs = require( 'fs' );
var path = require( 'path' );
var sqlite3 = require( 'sqlite3' ).verbose();
var db_fname = path.join( process.env.HOME, 'wecete.db' );
var db = new sqlite3.Database( db_fname );

if ( fs.existsSync( db_fname ) )
{
    fs.unlinkSync( db_fname );
}

db.serialize
(
   function() 
   {
     console.log( 'Creating table icons' );
     db.run
     (
          "CREATE TABLE icons " + 
	  "(" +
	  "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
	  "  mime_type TEXT," +
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

     console.log( 'Creating table collections' );
     db.run
     (
      "CREATE TABLE collections " +
      "(" +
      "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
      "  title TEXT," +
      "  description TEXT," +
      "  user INTEGER NOT NULL," +
      "  FOREIGN KEY( user ) REFERENCES users(id)" +
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
      "  icon INTEGER," +
      "  collection INTEGER NOT NULL," +
      "  FOREIGN KEY( icon ) REFERENCES icons(id)," +
      "  FOREIGN KEY( collection ) REFERENCES collections(id)" +
      ");"
     );

     console.log( 'Inserting test achievement' );
     db.run( "INSERT INTO users VALUES ( NULL, 'monkeynova', 'Keith Peters', 'keith@monkeynova.com', 'http://www.monkeynova.com/', NULL );");
     db.run( "INSERT INTO collections SELECT NULL, 'Test', 'Nothing to see here', id from users where username = 'monkeynova';" );
     db.run( "INSERT INTO achievements SELECT NULL, 'You''ve got Mail!', 'Receive an email asking if the user''s email is working', NULL, id from collections where title = 'Test';" );
  }
);

db.close();
