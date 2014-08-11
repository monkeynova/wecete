function newAchievement( collection_id )
{
    $.ajax
    ({
      url : '/achievement/add?collection=' + collection_id,
    })
    .always(function( response )
    {
	console.log( "should add achievement to DOM" );	
	console.log( response );
    });
}
