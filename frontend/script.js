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
				document.getElementById("temperature").innerHTML = "Temperature: " + message.payloadString;
			} else if (message.destinationName === "maarij/iotProject/humidity") {
				// display the humidity value in the web page
				document.getElementById("humidity").innerHTML = "Humidity: " + message.payloadString;
			} else if (message.destinationName === "maarij/iotProject/light") {
				// display the light value in the web page
				document.getElementById("light").innerHTML = "Light: " + message.payloadString;
			}
		}