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
	var achievementDom = toAdd.find( '.achievement' );
	achievementDom.attr( 'achievementID', response.newid );
	spinner.replaceWith( toAdd );
        addEventHandlers( toAdd );
	startEditAchievement( achievementDom );
    });
}

function toggleAchievement( domAchievement )
{
    var newHave = 1;
    if ( domAchievement.attr( 'have' ) )
    {
	newHave = 0;
    }

    domAchievement.attr( 'have', newHave );

    var id = domAchievement.attr( 'achievementId' );

    $.ajax
    ({
	url : '/achievement/have',
	data : 
	{
    	   achievement : id,
	   have : newHave
	}
    })
    .then
    (
	function ()
	{
	    $('.have',domAchievement).toggle();
	    $('.need',domAchievement).toggle();
	}
    );
}

function startEditAchievement( domAchievement )
{
    domAchievement.attr( 'editing', 1 );
    $('.view',domAchievement).hide();
    $('.edit',domAchievement).show();
    $('.edit .title',domAchievement).val( $('.view .title:first',domAchievement).text() );
    $('.edit .description',domAchievement).val( $('.view .description:first',domAchievement).text() );
    $('.edit .title',domAchievement).focus();
}

function abortEditAchievement( domAchievement )
{
    domAchievement.attr( 'editing', 0 );
    $('.view',domAchievement).show();
    $('.edit',domAchievement).hide();
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

function deleteAchievement( domAchievement )
{
    var id = domAchievement.attr( 'achievementId' );

    $.ajax
    ({
        url : '/achievement/delete',
	data :
	{
	    achievement : id,
	}
    })
    .always(function()
    {
	domAchievement.parents( 'li' ).remove();
    });
}

function addEventHandlers( maybeParent )
{
    $('.achievement',maybeParent).map( function() { if ( $(this).attr( 'have' ) ) { $('.have',$(this)).show(); $('.need',$(this)).hide(); } } );
    $('.toggleAchievement',maybeParent).on
    (
        'click',
        function ()
        {
	    toggleAchievement( $( this ).parents( '.achievement' ) );
            return false;
        }
    );
    $('.editAchievement',maybeParent).on
    (
        'click',
        function ()
        {
            startEditAchievement( $( this ).parents( '.achievement' ) );
            return false;
        }
    );
    $('.deleteAchievement',maybeParent).on
    (
        'click',
        function ()
        {
            deleteAchievement( $( this ).parents( '.achievement' ) );
            return false;
        }
    );
    $('.saveAchievement',maybeParent).on
    (
        'click',
        function ()
        {
            finishEditAchievement( $( this ).parents( '.achievement' ) );
            return false;
        }
    );
    $('.cancelEditAchievement',maybeParent).on
    (
        'click',
        function ()
        {
            abortEditAchievement( $( this ).parents( '.achievement' ) );
            return false;
        }
    );
    $('.edit .title, .edit .description',maybeParent).on
    (
	'keyup',
	function (e)
	{
	    if ( e.which == 27 )
	    {
		abortEditAchievement( $( this ).parents( '.achievement' ) );
	    }
	}
    );
}
