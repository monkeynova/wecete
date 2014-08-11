function newAchievement( collection_id )
{
    var spinner = $('#AchievementSpinner').clone();
    spinner.css( 'display', 'block' );
    spinner.insertBefore( $('#AchievementInsert') );

    $.ajax
    ({
      url : '/achievement/add?collection=' + collection_id,
    })
    .always(function( response )
    {
	var toAdd = $('#AchievementTemplate').clone();
	toAdd.css( 'display', 'block' );
	toAdd.find('a').attr('href','/achievement/' + response.newid);
	spinner.replaceWith( toAdd );
    });
}
