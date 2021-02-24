$(function() {
	var App = {
		data: {
			sensors: {},
			metrics: {},
			sensorTypes: {},
		},

		init: function () {
			App.loadJson();
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
				$('.head tr').append( '<th class="metric" data-metric="'+metric.id+'"><div>'+metric.name+'</div></th>' );
				$('.body tr').append( '<td class="metric" data-metric="'+metric.id+'"></td>' );
				metric.units.forEach(function( unit ){
					var selected = unit.selected ? 'active' : '';
					$('.body tr td:last').append('<div data-unit="'+unit.id+'" class="metric-unit '+selected+'"></div>');
					$('.head tr th:last').append('<div data-unit="'+unit.id+'" class="metric-unit '+selected+'">'+unit.name+'</div>');
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
		}
	};

	App.init();
});