function newAchievement( collection_id )
{
    $.ajax
    ({
      url : '/achievement/add?collection=' + collection_id,
    })
    .always(function( response )
    {
	console.log( response );
	console.log( "should add achievement # " + response.newid + " to DOM" );	

	var toAdd = $('#AchievementTemplate').clone();
	toAdd.css( 'display', 'block' );
	toAdd.find('a').attr('href','/achievement/' + response.newid);
	toAdd.insertBefore( $('#AchievementInsert') );
    });
}
