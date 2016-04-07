ko.observable.fn.increment = function (value) {
    this(this() + (value || 1));
};

function randomInt(max, exclude) {
    var res;
    exclude = exclude || null;
    do res = Math.floor(Math.random() * max);
    while(res === exclude);
    return res;
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
    this.wins = ko.observable(0);;
    this.status = ko.observableArray([]);
};

function Status(text, rounds) {
    this.text = text;
    this.rounds = rounds;
    this.tick = function() {this.rounds--};
}

function gameModel(gamers) {
    var self = this;

    self.tasks = [];
    self.fails = [];
    self.gamers = gamers;
    self.step = ko.observable('start'); // start, wait, task, win, fail
    self.activeTask = ko.observable();
    self.activeFail = ko.observable();
    self.activeGamerId = ko.observable(0);
    self.activeGamer = ko.computed(function() {
        return self.gamers[self.activeGamerId()];
    }, self);


    self.colorId = ko.observable();
    self.colorClass = ko.computed(function() {
        return 'color-' + self.colorId();
    }, self);
    self.textClass = ko.computed(function() {
        return 'text-color-' + self.colorId();
    }, self);
    self.alignerClass = ko.computed(function() {
        id = this.colorId();
        if (self.step() == 'wait') id = 'back';
        if (self.step() == 'fail') id = 'fail';
        return 'color-' + id;
    }, self);

    self.greetingGamer = ko.computed(function() {
        return greet(self.activeGamer().name);
    }, self);

    self.setNextGamer = function() {
        self.activeGamerId(randomInt(self.gamers.length,  self.activeGamerId()));
    }

    self.goWait = function() {
        self.colorId(getRandomColorId());
        self.setNextGamer();
        self.step('wait');
    };

    self.goTask = function() {
        self.activeTask(self.tasks.pop());
        self.step('task');
    };

    self.goFail = function() {
        // FIXME TO WINS
        self.activeGamer().wins.increment();
        self.activeGamer().status.push(new Status('ЛОХ', 5));
        self.activeFail(self.fails.pop());
        self.step('fail');
    };

    self.init = function(tasks, fails) {
        self.tasks = shuffle(tasks);
        self.fails = shuffle(fails);

        self.goWait();
    };
}

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

var game;

$(document).ready(function() {
    prepareUsers(6);
    $('#gamer0').val('Сергей');
    $('#gamer1').val('Михаил');
    $('#gamer2').val('Василий');
    $('#btn-add-gamer').on('click', function() {
        var id = parseInt($(this).attr('data-next-id'));
        $('#start-gamer-form').append( startUserHtml(id));
        $('html, body').animate({
            scrollTop: $("#gamer"+id).offset().top
        }, 1000);
        $(this).attr('data-next-id', id+1);
    });
    $('#btn-start-game').on('click', function() {
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

        game = new gameModel(gamers);
        ko.applyBindings(game);
        game.init(data.fants, data.fails);
    });
    $('#players').on('click', function() {
        $('#scores').fadeIn();
    });
    $('#scores .close').on('click', function() {
        $('#scores').fadeOut();
    });
});
