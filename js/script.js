var num_colors = 4

function randomInt(max) {
	return Math.floor(Math.random() * max);
};

function prepareUsers(num) {
	$('#aligner').prepend('<div id="gamers" class="color-main"><form class="form-horizontal" id="start-gamer-form"></form></div>');
	$('#btn-add-gamer').attr('data-next-id', num);
	for (var i=0; i<num; i++) {
		$('#start-gamer-form').append(startUserHtml(i));
	}
}

function startUserHtml(id) {
	return '<div class="form-group"><label class="col-xs-4 control-label">Игрок ' + (id+1) + '</label><div class="col-xs-7">' +
			  '<input type="text" id="gamer' + id +'" class="form-control" placeholder="Введите имя игрока"></div></div>'
}

function setFant(fant) {
	$('#main').removeClass().addClass('color-'+randomInt(num_colors))
	$('#fant-name').text(fant.name);
	$('#fant-text').text(fant.text);
};



var game = {
	fants: data.fants,
	currentFant: 0,
	nextFant: function(){
		setFant(this.getRandomNextFant());
	},
	getRandomNextFant: function(){
		var id;
		do {
			id = randomInt(this.fants.length);
		} while(id==this.currentFant);
		this.currentFant = id;
		return this.fants[id];
	}
}

$(document).ready(function() {
	prepareUsers(6);
	$('#btn-add-gamer')
		.on('click', function() {
			var id = parseInt($(this).attr('data-next-id'));
			$('#start-gamer-form').append( startUserHtml(id));
			$('html, body').animate({
				scrollTop: $("#gamer"+id).offset().top
			}, 1000);
			$(this).attr('data-next-id', id+1);
		});
	$('#btn-start-game')
		.on('click', function() {
			$('#aligner').removeClass().addClass('aligner-tasks')
				.height($('#main').height()-$('#btn-wrapper').height());
			$('#start-gamer-form').parent().remove();
			$('#task').show();
			$('#btn-start-game, #btn-add-gamer').remove();
			$('#btn-win, #btn-fail').removeClass('hidden');
			game.nextFant();
		})
	$('#btn-win')
		.on('click', function() {game.nextFant()})
		.on('touchstart mousedown', function() {$(this).removeClass().addClass('color-win-pressed')})
		.on('touchend mouseup', function() {$(this).removeClass().addClass('color-win')});
	$('#btn-fail')
		.on('touchstart mousedown', function() {$(this).removeClass().addClass('color-fail-pressed')})
		.on('touchend mouseup', function() {$(this).removeClass().addClass('color-fail')});
});
