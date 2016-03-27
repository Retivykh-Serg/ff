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

function prepareRound(msg, btn) {
	var colorId = randomInt(num_colors);
	$('#task').hide();
	$('#prepare').show().removeClass().addClass('text-color-'+colorId)
		.children('p').html(msg);
	$('#btn-win, #btn-fail').hide();
	$('#btn-user').show().html(btn).addClass('color-'+colorId);
	$('#main').removeClass().addClass('color-back');
}

function startUserHtml(id) {
	return '<div class="form-group"><label class="col-xs-4 control-label">Игрок ' + (id+1) + '</label><div class="col-xs-7">' +
			  '<input type="text" id="gamer' + id +'" class="form-control gamers" placeholder="Введите имя игрока"></div></div>'
}

function setFant(fant) {
	$('#prepare').hide();
	$('#task').show();
	$('#main').removeClass().addClass('color-'+randomInt(num_colors))
	$('#fant-name').text(fant.name);
	$('#fant-text').text(fant.text);
	$('#btn-user').hide();
	$('#btn-win, #btn-fail').show();
};

function Gamer(name) {
	this.name = name;
	this.wins = 0;
	this.fails = 0;
};

var game = {
	fants: data.fants,
	gamers: [],
	currentFant: 0,
	currentUser: 0,
	prepareRound: function() {
		this.currentUser = randomInt(this.gamers.length);
		prepareRound(
			this.gamers[this.currentUser].name + ', тебе выпала честь выполнить следующее задание!', 
			 'Я - ' + this.gamers[this.currentUser].name + '!'
		);
	},
	round: function() {
		this.nextFant();
	},
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
	$('#gamer0').val('Сергей');
	$('#gamer1').val('Михаил');
	$('#gamer2').val('Василий');
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
			$('.gamers').each(function(){
				if (this.value) {
					game.gamers.push(new Gamer(this.value));
				}
			});
			if (game.gamers.length <= 2) {
				$('#gamer'+game.gamers.length).parent()
					.after('<div id="info" class="col-xs-10 text-inf" style="display: none"><p>Нужно больше игроков!</p></div>');
				$('#info').slideDown(300).delay(15000).slideUp(500, function() {$('#info').remove();});
				game.gamers = [];
				return;
			}
			$('#aligner').removeClass().addClass('aligner-tasks')
				.height($('#main').height()-$('#btn-wrapper').height());
			$('#start-gamer-form').parent().remove();
			$('#task').show();
			$('#btn-start-game, #btn-add-gamer').remove();
			$('#btn-win, #btn-fail').removeClass('hidden');
			game.prepareRound();
		})
	$('#btn-user')
		.on('click', function() {game.round()})
		.on('touchstart mousedown', function() {$(this).removeClass().addClass('color-'+randomInt(num_colors))});
	$('#btn-win')
		.on('click', function() {game.prepareRound()})
		.on('touchstart mousedown', function() {$(this).removeClass().addClass('color-win-pressed')})
		.on('touchend mouseup', function() {$(this).removeClass().addClass('color-win')});
	$('#btn-fail')
		.on('touchstart mousedown', function() {$(this).removeClass().addClass('color-fail-pressed')})
		.on('touchend mouseup', function() {$(this).removeClass().addClass('color-fail')});
});
