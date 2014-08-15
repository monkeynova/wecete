function addEventHandlers( maybeParent )
{
    addAchievementHandlers( maybeParent );
    addCollectionHandlers( maybeParent );
}

/// Achievement functions

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

function addAchievementHandlers( maybeParent )
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
    $('.achievement .edit .title, .achievement .edit .description',maybeParent).on
    (
	'keypress',
	function (e)
	{
	    switch ( e.which )
	    {
	    case 10:
	    case 13:
		finishEditAchievement( $( this ).parents( '.achievement' ) );
		break;
	    }
	}
    );
    $('.achievement .edit .title, .achievement .edit .description',maybeParent).on
    (
	'keyup',
	function (e)
	{
	    switch ( e.which )
	    {
	    case 27:
		abortEditAchievement( $( this ).parents( '.achievement' ) );
		break;
	    }
	}
    );
}

/// Collection functions

function newCollection()
{
    var spinner = $('#CollectionSpinner').clone();
    spinner.insertBefore( $('#CollectionInsert') );

    setTimeout( 100, function() { spinner.css( 'display', 'block' ) } );

    $.ajax
    ({
        url : '/collection/add',
    })
    .always(function( response )
    {
	var toAdd = $('#CollectionTemplate').clone();
	toAdd.css( 'display', 'block' );
	toAdd.find('a').attr('href','/collection/' + response.newid);
	spinner.replaceWith( toAdd );
        addEventHandlers( toAdd );
    });
}


function startEditCollection( domAchievement )
{
    $('.view',domAchievement).hide();
    $('.edit',domAchievement).show();
    $('.edit .title',domAchievement).val( $('.view .title:first',domAchievement).text() );
    $('.edit .description',domAchievement).val( $('.view .description:first',domAchievement).text() );
    $('.edit .title',domAchievement).focus();
    $('.edit .title',domAchievement).select();
}

function abortEditCollection( domAchievement )
{
    $('.view',domAchievement).show();
    $('.edit',domAchievement).hide();
}

function finishEditCollection( domAchievement )
{
    var id = domAchievement.attr( 'collectionID' );
    var newTitle = $('input.title',domAchievement).val();
    var newDescription = $('textarea.description',domAchievement).val();

    $.ajax
    ({
        url : '/collection/edit',
	data :
	{
	    collection : id,
	    title : newTitle,
	    description : newDescription
	}
    })
    .always(function(response)
    {
	$('.view',domAchievement).show();
	$('.view .title',domAchievement).text( newTitle );
	$('.view .description',domAchievement).text( newDescription );
	if ( response.description_md )
	{
	    $('.view .mdDescription',domAchievement).html( response.description_md );
	}

	$('.edit',domAchievement).hide();
	$('.edit .title',domAchievement).val( newTitle );
	$('.edit .description',domAchievement).val( newDescription );
    });
}

function addCollectionHandlers( maybeParent )
{
    $('.collection',maybeParent).map( function() { if ( $(this).attr( 'following' ) ) { $('.follow',$(this)).show(); $('.nofollow',$(this)).hide(); } } );
    $('.editCollection',maybeParent).on
    (
        'click',
        function ()
        {
            startEditCollection( $( this ).parents( '.collection' ) );
            return false;
        }
    );
    $('.deleteCollection',maybeParent).on
    (
        'click',
        function ()
        {
            deleteCollection( $( this ).parents( '.collection' ) );
            return false;
        }
    );
    $('.saveCollection',maybeParent).on
    (
        'click',
        function ()
        {
            finishEditCollection( $( this ).parents( '.collection' ) );
            return false;
        }
    );
    $('.cancelEditCollection',maybeParent).on
    (
        'click',
        function ()
        {
            abortEditCollection( $( this ).parents( '.collection' ) );
            return false;
        }
    );
    $('.collection .edit .title, .collection .edit .description',maybeParent).on
    (
	'keyup',
	function (e)
	{
	    if ( e.which == 27 )
	    {
		abortEditCollection( $( this ).parents( '.collection' ) );
	    }
	}
    );
}
