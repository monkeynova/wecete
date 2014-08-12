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
        addEventHandlers( toAdd );
	toggleEditAchievement( toAdd.find( '.achievement' ) );
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
    domAchievement.attr
    (
        'editing',
        function()
        {
            var curValue = $( this ).attr( 'editing' );
            if ( curValue === undefined || curValue == 0 )
            {
                console.log( curValue + " => 1" );
                return 1;
            }
            console.log( curValue + " => 0" );
            return 0;
        }
    );
    $('.view',domAchievement).toggle();
    $('.edit',domAchievement).toggle();
    if ( domAchievement.attr( 'editing' ) )
    {
        $('.edit .title',domAchievement).focus();
    }
}

function addEventHandlers( maybeParent )
{
    $('.achievement',maybeParent).on
    (
        'click',
        function ()
        {
            var isEditing = $( this ).attr( 'editing' );
            if ( isEditing === undefined || isEditing == 0 )
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
