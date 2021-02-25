$(function() {
	var App = {
		data: {
			sensors: {},
			metrics: {},
			sensorTypes: {},
		},

		init: function () {
			App.loadJson();
			App.clickEvents();
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
		},
		
		clickEvents: function(){
			$('body').on('click', '.sorter', function(){
				$('.sorter').not(this).removeClass().addClass('sorter');
				if( $(this).hasClass('sorter--desc') ){
					$(this).removeClass('sorter--desc');
				} else if( $(this).hasClass('sorter--asc') ){
					$(this).removeClass('sorter--asc').addClass('sorter--desc');
				} else {
					$(this).addClass('sorter--asc');
				}
			});
			$('body').on('change', '.metric-unit__label input', function(){
				var shouldChange = $('.body [data-unit="'+$(this).closest('.units').find('input:checked').attr('val')+'"]');
				shouldChange.addClass('checked').prevAll().removeClass('checked');
				shouldChange.nextAll().removeClass('checked');
			});
		}
	};

	App.init();
});