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
			client.subscribe("maarij/iotProject/humidity");
			client.subscribe("maarij/iotProject/light");
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
	
			} else if (message.destinationName === "maarij/iotProject/humidity") {
				// display the humidity value in the web page
				document.getElementById("humidity_data").innerHTML = parseInt(message.payloadString).toString() + " %";
				
				if (parseFloat(message.payloadString) > 50) {
				  document.getElementById("humidityLED").style.backgroundColor = "#b3ff80";
				} else {
				  document.getElementById("humidityLED").style.backgroundColor = "#bbb";
				}
				
			} else if (message.destinationName === "maarij/iotProject/light") {
				// display the light value in the web page
				document.getElementById("light_data").innerHTML = parseInt(message.payloadString).toString() + " %";
				
				if (parseFloat(message.payloadString) < 50) {
				  document.getElementById("lightLED").style.backgroundColor = "#ffff80";
				} else {
				  document.getElementById("lightLED").style.backgroundColor = "#bbb";
				}
			}
		}