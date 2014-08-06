
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'WeCete' });
};

exports.achievement = function(req,res){
  res.render('achievement', { title : 'You\'ve got Mail!', description : 'Receive an email asking if the user\'s email is working' } );
};
