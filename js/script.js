function randomInt(max) {
	return Math.floor(Math.random() * max);
};

function setFant(fant) {
	$('.main > div').removeClass().addClass('color-'+randomInt(8))
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
	$('#btn-win')
		.on('click', function() {game.nextFant()})
		.on('touchstart mousedown', function() {$(this).removeClass().addClass('color-0')})
		.on('touchend mouseup', function() {$(this).removeClass().addClass('color-1')});
		
	game.nextFant();
});
