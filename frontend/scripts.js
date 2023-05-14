		var chart; // global variuable for chart
		var dataTopics = new Array();
		
		// Create a client instance
		var client = new Paho.MQTT.Client("91.121.93.94", Number(8080), "clientId");
		
		// set callback handlers for the MQTT client
		client.onConnectionLost = onConnectionLost;
		client.onMessageArrived = onMessageArrived;

		// connect the client
		client.connect({
			onSuccess: onConnect,
			onFailure: onFailure
		});

		// called when the client connects
		function onConnect() {
			console.log("Connected to MQTT broker");
			// subscribe to the temperature, humidity, and light topics
			client.subscribe("maarij/iotProject/temp");
			chart.addSeries({id: 0, name: "Temperature", data: [], color: "red"}); //add the series

			client.subscribe("maarij/iotProject/humidity");
			chart.addSeries({id: 1, name: "Humidity", data: [], color: "green"});

			client.subscribe("maarij/iotProject/light");
			chart.addSeries({id: 2, name: "Light", data: [], color: "orange"});
		
			Highcharts.setOptions({
				global: {
					useUTC: false
				}
			});
		}

		// called when the client fails to connect
		function onFailure(errorMessage) {
			console.log("Failed to connect to MQTT broker: " + errorMessage.errorMessage);
		}

		// called when the client loses its connection
		function onConnectionLost(responseObject) {
			if (responseObject.errorCode !== 0) {
				console.log("Connection lost: " + responseObject.errorMessage);
			}
		}

		// called when a message arrives
		function onMessageArrived(message) {
			console.log("Message received: " + message.payloadString);
			if (message.destinationName === "maarij/iotProject/temp") {
				// display the temperature value in the web page
				document.getElementById("temp_data").innerHTML = message.payloadString + " °C";
				
				if (parseFloat(message.payloadString) > 30) {
				  document.getElementById("tempLED").style.backgroundColor = "#ff8c8c";
				} else {
				  document.getElementById("tempLED").style.backgroundColor = "#bbb";
				}

				var myEpoch = new Date().getTime(); //get current epoch time
				var plotMqtt = [myEpoch, parseFloat(message.payloadString)]; //create the array
				plot(plotMqtt, 0);
	
			} else if (message.destinationName === "maarij/iotProject/humidity") {
				// display the humidity value in the web page
				document.getElementById("humidity_data").innerHTML = parseInt(message.payloadString).toString() + " %";
				
				if (parseFloat(message.payloadString) > 50) {
				  document.getElementById("humidityLED").style.backgroundColor = "#b3ff80";
				} else {
				  document.getElementById("humidityLED").style.backgroundColor = "#bbb";
				}

				var myEpoch = new Date().getTime(); //get current epoch time
				var plotMqtt = [myEpoch, parseFloat(message.payloadString)]; //create the array
				plot(plotMqtt, 1);
				
			} else if (message.destinationName === "maarij/iotProject/light") {
				// display the light value in the web page
				document.getElementById("light_data").innerHTML = parseInt(message.payloadString).toString() + " %";
				
				if (parseFloat(message.payloadString) < 50) {
				  document.getElementById("lightLED").style.backgroundColor = "#ffff80";
				} else {
				  document.getElementById("lightLED").style.backgroundColor = "#bbb";
				}

				var myEpoch = new Date().getTime(); //get current epoch time
				var plotMqtt = [myEpoch, parseFloat(message.payloadString)]; //create the array
				plot(plotMqtt, 2);
			}
		}

		//this adds the plots to the chart	
		function plot(point, chartno) {
			console.log(point);
			
				var series = chart.series[0],
					shift = series.data.length > 10000; // shift if the series is 
													 // longer than 10000
				// add the point
				chart.series[chartno].addPoint(point, true, shift);  
	
		};
	
	//settings for the chart
		$(document).ready(function() {
			chart = new Highcharts.Chart({
				chart: {
					renderTo: 'graphContainer',
					defaultSeriesType: 'spline',
					backgroundColor: '#f7f7f7',
					
				},
				title: {
					text: ''
				},
				xAxis: {
					type: 'datetime',
					tickPixelInterval: 150,
					maxZoom: 20 * 1000
				},
				yAxis: {
					minPadding: 0.2,
					maxPadding: 0.2,
					title: {
						text: 'Value',
						margin: 20
					}
				},
				credits: {
					enabled: false
				},
				series: []
			});        
		});


		function toggleDiv() {
			var graphDiv = document.getElementById("graph");
			var liveDiv = document.getElementById("live");
			var toggleButton = document.getElementById("toggleBtn");
	
			if (graphDiv.style.display == "none") {
				console.log("graph displayed")
				graphDiv.style.display = "block";
				liveDiv.style.display = "none";
				toggleButton.innerHTML = "Live View"
			} else {
				console.log("live displayed")
				graphDiv.style.display = "none";
				liveDiv.style.display = "block";
				toggleButton.innerHTML = "Graph View"
			}
		}