function randomInt(max) {
    return Math.floor(Math.random() * max);
};

function getRandomColorId() {
    return randomInt(4);
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
    return a;
}

function greet(name) {
    return data.greetings[randomInt(data.greetings.length)].replace('%USERNAME%', name);
}

//---------------------------------------------------

function Gamer(name) {
    this.name = name;
    this.wins = ko.observable(0);
    this.statuses = ko.observableArray([]);
};


function gameModel() {
    var self = this;

    self.tasks = [];
    self.step = ko.observable('start'); // start, wait, task, win, fail
    self.gamers = ko.observableArray();
    self.activeTask = ko.observable();
    self.activeGamer = ko.observable();

    self.colorId = ko.observable();
    self.colorClass = ko.computed(function() {
        return 'color-' + this.colorId();
    }, self);
    self.textClass = ko.computed(function() {
        return 'text-color-' + this.colorId();
    }, self);
    self.alignerClass = ko.computed(function() {
        return 'color-' + (self.step() == 'wait' ? 'back' : this.colorId());
    }, self);

    self.iAmGamer = ko.computed(function() {
        if (self.activeGamer()) return 'Я - ' + self.activeGamer().name;
    });

    self.greetingGamer = ko.computed(function() {
        if (self.activeGamer())
            return greet(self.activeGamer().name);
    });


    self.init = function (gamers, tasks) {
        self.gamers = ko.observableArray(gamers);
        self.tasks = shuffle(tasks);

        self.colorId(getRandomColorId());
        self.activeGamer(self.gamers()[0]);
        self.step('wait');
    }
}

var game = new gameModel();
ko.applyBindings(game);

//--------------------------------------------------

function prepareUsers(num) {
    $('#aligner').prepend('<div id="gamers" class="color-main"><form class="form-horizontal" id="start-gamer-form"></form></div>');
    $('#btn-add-gamer').attr('data-next-id', num);
    for (var i=0; i<num; i++) {
        $('#start-gamer-form').append(startUserHtml(i));
    }
}

function startUserHtml(id) {
    return '<div class="form-group"><label class="col-xs-4 control-label">Игрок ' + (id+1) + '</label><div class="col-xs-7">' +
              '<input type="text" id="gamer' + id +'" class="form-control gamers" placeholder="Введите имя игрока"></div></div>'
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
            var gamers = [];
            $('.gamers').each(function(){
                if (this.value) {
                    gamers.push(new Gamer(this.value));
                }
            });
            if (gamers.length <= 2) {
                $('#gamer'+game.gamers.length).parent()
                    .after('<div id="info" class="col-xs-10 text-inf" style="display: none"><p>Нужно больше игроков!</p></div>');
                $('#info').slideDown(300).delay(1500).slideUp(500, function() {$('#info').remove();});
                return;
            }
            $('#aligner').removeClass().addClass('aligner-tasks')
                .height($('#main').height()-$('#btn-wrapper').height());
            $('#start-gamer-form').parent().remove();

            game.init(gamers, data.fants);
        })
});
