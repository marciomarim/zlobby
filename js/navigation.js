const shell = require('electron').shell;

$('.lmenu').on('click', '.tab', function(e) {
	
	var tab = $(this).data('target');	
	var id = '#' + $(this).data('target');
	
	$('.tab').removeClass('active');
	$('.rcontainer').removeClass('active');
	
	if (tab == 'chatlist'){
		$('#chats').addClass('active');	
	}
	
	if ( tab == 'battleroom' && !$('body').hasClass('inbattleroom') ){
		return false;
	}
	
	$('.container.active').removeClass('active');
	$(id).addClass('active');
	$(this).addClass('active');
	
});




$('body').on('click', 'a', (event) => {
	
	event.preventDefault();
	let link = event.target.href;
	shell.openExternal(link);
	
});



$('body').on('click', '.account .btn', function(e) {
	var target = '#' + $(this).data('target');
	$('.account .pane.active, .account .btn').removeClass('active');
	$(target).addClass('active');
	$(this).addClass('active');
		
});