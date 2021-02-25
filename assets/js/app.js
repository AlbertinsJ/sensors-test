$(function() {
	var App = {
		data: {
			sensors: {},
			metrics: {},
			sensorTypes: {},
		},

		init: function () {
			App.loadJson();
			App.events();
		},

		loadJson: function () {
			$.getJSON("/app/json/sensors.json", function(data){
		        App.data.sensors = data;
		    }).done(function(){
		    	$.getJSON("/app/json/metrics.json", function(data){
			        App.data.metrics = data;
			    }).done(function(){
			    	$.getJSON("/app/json/sensorTypes.json", function(data){
				        App.data.sensorTypes = data;
				        App.generateTable();
				    });
			    });
		    });
		},

		generateTable: function(){
			App.data.metrics.data.items.forEach(function( metric ){
				$('.head tr').append( '<th class="metric" data-metric="'+metric.id+'">' +
						'<div class="metric">'+metric.name+'</div>' +
						'<div class="units"></div>' +
					'<span class="sorter"></span></th>' );
				$('.body tr').append( '<td class="metric" data-metric="'+metric.id+'"></td>' );
				$('.filters').append( '<label class="filters-checkbox">'+
					'<input type="checkbox" name="'+metric.id+'" checked />'+metric.name+'</label>' );
				metric.units.forEach(function( unit ){
					var selected = unit.selected ? 'checked' : '';
					$('.body tr td:last').append('<div data-unit="'+unit.id+'" class="metric-unit '+selected+'"></div>');
					$('.head tr th:last .units').append('<label data-unit="'+unit.id+'" class="metric-unit__label">'+
						'<input type="radio" name="'+metric.id+'" val="'+unit.id+'" '+selected+' />'+unit.name+'</label>');
				});
			});
			var clone = $('.body tr').clone();
			$('.body tr').remove();
			Object.entries(App.data.sensors).forEach(function( [id, sensor] ){
				var row = clone.clone();
				var type = '';
				if ( App.data.sensorTypes[sensor.type] && App.data.sensorTypes[sensor.type][sensor.variant] ){
					type = App.data.sensorTypes[sensor.type][sensor.variant].name;
				}
				$('.body').append( row );
				$('.name', row).html( sensor.name + ' (' + type + ')' );
				Object.entries(sensor.metrics).forEach(function([sensorId, metrics]){
					$('[data-unit="'+sensorId+'"]', row).text(metrics.v);
				});
			});
			App.sorter();
		},
		
		events: function(){
			$('body').on('click', '.sorter', function(){
				$('.sorter').not(this).removeClass().addClass('sorter');
				if( $(this).hasClass('sorter--asc') ){
					$(this).removeClass('sorter--asc').addClass('sorter--desc');
				} else {
					$(this).removeClass('sorter--desc').addClass('sorter--asc');
				}
				App.sorter();
			});
			$('body').on('change', '.metric-unit__label input', function(){
				var shouldChange = $('.body [data-unit="'+$(this).closest('.units').find('input:checked').attr('val')+'"]');
				shouldChange.addClass('checked').prevAll().removeClass('checked');
				shouldChange.nextAll().removeClass('checked');
			});

			$('body').on('change', '.filters-checkbox input', function(){
				$('.metric[data-metric="'+$(this).attr('name')+'"]').toggleClass('hidden', ! $(this).is(':checked'));
				if( ! $('th:not(.hidden) .sorter--desc, th:not(.hidden) .sorter--asc').length ){
					$('.head .name .sorter').addClass('sorter--asc');
					App.sorter();
				}
			});

			$('#filter').on('change keyup', App.filter);
		},

		sorter: function(){
			var rows = $('.body tr').get();
			var column = $('.sorter--desc, .sorter--asc').closest('th').attr('data-metric');
			rows.sort(function(a, b) {
				if( ! column ){
					var A = $(a).find('.name').eq(0).text().toUpperCase();
					var B = $(b).find('.name').eq(0).text().toUpperCase();
				} else {
					var A = $(a).find('.metric[data-metric="'+column+'"] .checked').eq(0).text().toUpperCase();
					var B = $(b).find('.metric[data-metric="'+column+'"] .checked').eq(0).text().toUpperCase();
				}
				if (A < B) {
					return $('.sorter--asc').length ? -1 : 1;
				}
				if (A > B) {
					return $('.sorter--asc').length ? 1 : -1;
				}
				return 0;
			});

			$.each(rows, function(index, row) {
				$('.body').append(row);
			});
		},

		filter: function(){
	        var searched = $('#filter').val().trim().toLowerCase().split(' ');
	        var search = new RegExp( '^(?=.*(' + searched.join('))(?=.*?(') + ')).*' );
	        $('.body .name').each(function(){
	            var txt = $(this).text().toLowerCase();
	            $(this).closest('tr').toggleClass( 'hidden', txt.match( search ) === null );
	        });
	    },
	};

	App.init();
});