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
        addEventHandlers( toAdd );
	spinner.replaceWith( toAdd );
	toggleEditAchievement( toAdd );
    });
}

function toggleAchievement( domAchievement )
{
    $('.have',domAchievement).toggle();
    $('.need',domAchievement).toggle();
}

function toggleEditAchievement( domAchievement )
{
    console.log( 'toggleEdit' );
    domAchievement.attr( 'editing', function() { return $( this ).attr( 'editing' ) == 0 ? 1 : 0; } );
    $('.view',domAchievement).toggle();
    $('.edit',domAchievement).toggle();
}

function addEventHandlers( maybeParent )
{
    $('.achievement',maybeParent).attr( 'editing', 0 );
    $('.achievement',maybeParent).on
    (
        'click',
        function ()
        {
            if ( $( this ).attr( 'editing' ) == 0 )
            {
                toggleAchievement( $( this ) );
            }
            return false;
        }
    );
    $('.eToggle',maybeParent).on
    (
        'click',
        function ()
        {
            var jqueryThis = $( this );
            toggleEditAchievement( jqueryThis.parents( '.achievement' ) );
            return false;
        }
    );
}
