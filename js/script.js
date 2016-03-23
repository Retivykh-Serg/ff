Date.prototype.getMyDay = function () {
	var dayId = this.getDay(); 
	return dayId > 0 ? dayId - 1: 6;
};

var user = {
	name: '',
	
	setUser: function(name) {
		this.name = name;
		$('#user').text(name);
		$('header .hidden').removeClass('hidden');
		$('#userForm').hide();
	},
	
	init: function() {
		if (localStorage.userName) {
			this.setUser(localStorage.userName);
		}
		$('#btnName').on('click', function(){
			if (!($('#userName').val())) return;
			var name = $('#userName').val();
			localStorage.userName = name;
			user.setUser(name);
		});
		$('#user').on('click', function(){
			$('header span').addClass('hidden');
			$('#userForm').show();
			$('#userName').val(user.name);
		});
	}
};

var ex = {
	list: [],
	
	show: function(arExIds, dayId) {
		$('#listExContainer .dayOfWeek').text( $('.weekEx[data-id='+dayId+']').prev().text() );
		$('#listEx input[type=checkbox]').prop('checked', false);
		if (trainingWeek.exercises[dayId]) {
			trainingWeek.exercises[dayId].forEach(function(item, i, arIds) {
				$('#listEx input[type=checkbox][data-id='+item+']').prop('checked', 'checked');
			});
		}
		$('#listExContainer').show();
	},
	
	print: function(arIds) {
		if (!Array.isArray(arIds)) return false;
		var str = '';
		arIds.forEach(function(item, i, arIds) {
			str += (ex.list[item] + ', '); 
		});
		return str.substring(0, str.length - 2);
	},
	
	checkUnique: function(exName) {
		if (!this.list.length) return true;
		for (var i=0; i<this.list.length; i++)
			if (this.list[i].toUpperCase() === exName.toUpperCase()) return false;
		return true;
	},
	
	add: function(exName) {
		$('#newEx').removeClass('error');
		if (!exName || !this.checkUnique(exName)) {
			$('#newEx').addClass('error');
			return;
		}
		this.list.push(exName);
		localStorage.exerciseList =  JSON.stringify(this.list);
		$('#newEx').before('<label><input type="checkbox" checked data-id="' + (this.list.length-1)+ '"/>' + exName + '</label><br>');
		$('#newEx').val('');
	},
	
	save: function() {
		$('#listExContainer').hide();
		var arIds = [];
		$('#listEx input:checked').each(function(){
			arIds.push( $(this).attr('data-id'));
		});
		trainingWeek.setExercises(arIds);
	},
	
	init: function() {
		if (localStorage.exerciseList) {
			this.list = JSON.parse(localStorage.exerciseList);
		}
		
		var htmlItems = [];
		$.each(this.list, function(index, value) {
			htmlItems.push('<label><input type="checkbox" data-id="' + index + '">' + value + '</label><br>');
		});
		$('#newEx').before(htmlItems.join(''));
		$('#btnListSave').click(function() {
			ex.save();
		});
		$('#btnEx').click( function() {
			ex.add($('#newEx').val());
		});
	}
};

var trainingWeek = {
	exercises: [],
	
	checkExercises: function(){
		if (!localStorage.exercises) {
			return false;
		}
		this.exercises = JSON.parse(localStorage.exercises);
		return true;
	},
	
	setExercises: function(arIds) {
		var dayId = this.findDayId();
		if (!dayId) return;
		this.exercises[dayId] = arIds;
		localStorage.exercises =  JSON.stringify(this.exercises);
		$('.weekEx[data-id=' + dayId + ']').html(ex.print(arIds));
		historyEx.setDetailInfo( $calendar.datepicker('getDate'));
	},
	
	findDayId: function() {
		var $day = $('.weekEx.edited');
		return $day.length ? $day.removeClass('edited').attr('data-id') : false;
	},
	
	init: function() {		
		if (this.checkExercises()) {
			$.each(this.exercises, function(index, value) {
				$('.weekEx[data-id='+index+']').html(ex.print(value));
			});
		}
		$('.weekEx').on('click', function() {
			$(this).addClass('edited');
			ex.show($(this).attr('data-ex'), $(this).attr('data-id'));
		});
		$('#detailContainer').on('change', 'input[type=text]', function(e) {
			historyEx.setHistory($(e.target).attr('data-id'), $(e.target).val(), $calendar.datepicker('getDate'));
		});
	}
};

var historyEx = {
	setDetailInfo: function(date) { 
		var htmlArr = [];
		var dayId = date.getMyDay();
		$('#dateEx').text(date.toLocaleDateString());
		if (date > new Date()) {
			var exStr = ex.print(trainingWeek.exercises[dayId]);
			if (!exStr) exStr = 'не запланировано';
			htmlArr.push('Упражнения: ' + exStr);
		} else if (date.getTime() < localStorage.startDate) {
			htmlArr.push('Вы тогда еще не тренировались!');
		} else if (localStorage.getItem(date.getTime())) {
			htmlArr.push('<label class="leftCol"><b>Упражнение</b></label><label>Вес</label><br>');
			var histEx = JSON.parse(localStorage.getItem(date.getTime()));
			histEx.forEach(function(item) {
				htmlArr.push('<label class="leftCol">'+ex.list[item.ex]+
				'</label><input type="text" data-id="' + item.ex + '" value="' + item.weight + '"/><br>');
			});
		} else if (trainingWeek.exercises[dayId]) {
			htmlArr.push('<label class="leftCol"><b>Упражнение</b></label><label>Вес</label><br>');
			trainingWeek.exercises[dayId].forEach(function(index) {
				htmlArr.push('<label class="leftCol">'+ex.list[index]+'</label><input type="text" data-id="' + index + '"/><br>');
			});
		} else {
			htmlArr.push('Упражнения не проводились');
		}
		$('#detailContainer').html(htmlArr.join(''));
	},
	
	setHistory: function(ex, weight, date) {
		var histEx = [];
		if (localStorage.getItem(date.getTime())) {
			histEx = JSON.parse(localStorage.getItem(date.getTime()));
			histEx.forEach(function(item) {
				if(item.ex === ex) item.weight = weight;
			});
		} else {
			var dayExIds = trainingWeek.exercises[date.getMyDay()];
			dayExIds.forEach(function(item) {
				histEx.push( {ex: item, weight: item === ex ? weight : ''});
			});
		}
		localStorage.setItem(date.getTime(), JSON.stringify(histEx));
		historyEx.show();
	},
	
	show: function(numNotes) {
		if (!numNotes) numNotes = 21; 
		var arDates = [];
		var htmlStr = [];
		for (var key in localStorage) {
			if (parseInt(key)) arDates.push(key);
		}
		arDates.reverse();
		htmlStr.push('<table class="table"><th>Дата</th><th>Упражнения</th><th>Вес</th>');
		for (var i=0; i<arDates.length && i<numNotes; i++) {
			var d = (new Date()).setTime(arDates[i]);
			var wStr = [];
			htmlStr.push('<tr><td>' + (new Date(d)).toLocaleDateString() + '</td><td>');
			JSON.parse(localStorage.getItem(arDates[i])).forEach(function(item) {
				wStr.push('<p>' + item.weight + '</p>');
				htmlStr.push('<p>' + ex.list[item.ex] + '</p>');
			});
			htmlStr.push('</td><td>' + wStr.join('') + '</td></tr>');
		}
		htmlStr.push('</table>');
		$('#historyContainer').html(htmlStr.join(''));
	}
};

var $calendar = $('#datepicker');

$(document).ready( function() {
	if(typeof(Storage) === 'undefined') {
		alert('Sorry! No Web Storage support in your browser! Application will be closed.');
		return;
	} 
	
	if(!localStorage.startDate) {
		localStorage.startDate = (new Date()).getTime() - 86400*1000;
		$('#dayEx, #historyEx, #datepicker').hide();
		$('#listEx .warning').hide();
		$('#btnWeekSave').removeClass('hidden').click(function() {
			$('#btnWeekSave').hide();
			$('#dayEx, #historyEx, #datepicker').show();
			$('#exForm').css({'margin-left': '0px', 'margin-top': '7px'});
			$('#listEx .warning').show();
		});
		$('#exForm').css({'margin-left': '450px', 'margin-top': '100px'});
	}
	
	user.init();
	ex.init();
	$calendar.datepicker( {
		onSelect: function() {
			historyEx.setDetailInfo( $calendar.datepicker('getDate'));
		}
	});
	trainingWeek.init();
	historyEx.setDetailInfo( $calendar.datepicker('getDate'));
	historyEx.show();
});