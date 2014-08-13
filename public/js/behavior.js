function newAchievement( collection_id )
{
    var spinner = $('#AchievementSpinner').clone();
    spinner.insertBefore( $('#AchievementInsert') );

    setTimeout( 100, function() { spinner.css( 'display', 'block' ) } );

    $.ajax
    ({
        url : '/achievement/add',
        data : { collection : collection_id }
    })
    .always(function( response )
    {
	var toAdd = $('#AchievementTemplate').clone();
	toAdd.css( 'display', 'block' );
	toAdd.id = 'Achievement-' + response.newid;
	toAdd.find('a').attr('href','/achievement/' + response.newid);
	spinner.replaceWith( toAdd );
        addEventHandlers( toAdd );
	startEditAchievement( toAdd.find( '.achievement' ) );
    });
}

function toggleAchievement( domAchievement )
{
    $('.have',domAchievement).toggle();
    $('.need',domAchievement).toggle();
}

function startEditAchievement( domAchievement )
{
    console.log( 'start edit' );
    domAchievement.attr( 'editing', 1 );
    $('.view',domAchievement).hide();
    $('.edit',domAchievement).show();
    $('.edit .title',domAchievement).focus();
}

function finishEditAchievement( domAchievement )
{
    var id = domAchievement.attr( 'achievementId' );
    var newTitle = $('input.title',domAchievement).val();
    var newDescription = $('input.description',domAchievement).val();

    $.ajax
    ({
        url : '/achievement/edit',
	data :
	{
	    achievement : id,
	    title : newTitle,
	    description : newDescription
	}
    })
    .always(function()
    {
	domAchievement.attr( 'editing', 0 );

	$('.view',domAchievement).show();
	$('.view .title',domAchievement).text( newTitle );
	$('.view .description',domAchievement).text( newDescription );

	$('.edit',domAchievement).hide();
	$('.edit .title',domAchievement).val( newTitle );
	$('.edit .description',domAchievement).val( newDescription );
    });
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
    $('.editAchievement',maybeParent).on
    (
        'click',
        function ()
        {
            var jqueryThis = $( this );
            startEditAchievement( jqueryThis.parents( '.achievement' ) );
            return false;
        }
    );
    $('.saveAchievement',maybeParent).on
    (
        'click',
        function ()
        {
            var jqueryThis = $( this );
            finishEditAchievement( jqueryThis.parents( '.achievement' ) );
            return false;
        }
    );
}
