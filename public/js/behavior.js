function newAchievement( collection_id )
{
    var spinner = $('#AchievementSpinner').clone();
    spinner.insertBefore( $('#AchievementInsert') );

    setTimeout( 100, function() { spinner.css( 'display', 'block' ) } );

    $.ajax
    ({
      url : '/achievement/add?collection=' + collection_id,
    })
    .always(function( response )
    {
	var toAdd = $('#AchievementTemplate').clone();
	toAdd.css( 'display', 'block' );
	toAdd.id = 'Achievement-' + response.newid;
	toAdd.find('a').attr('href','/achievement/' + response.newid);
	spinner.replaceWith( toAdd );
	startEditAchievement( response.newid );
    });
}

function startEditAchievement( domAchievement )
{
    $('.view',domAchievement).css( 'display', 'none' );
    $('.edit',domAchievement).css( 'display', 'block' );
}

function finishEditAchievement( achievement_id )
{

}
