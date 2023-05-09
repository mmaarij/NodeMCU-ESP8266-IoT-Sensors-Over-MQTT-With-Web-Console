#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>           
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <string.h>

// Update these with values suitable for your network.

const char * ssid = "Melodrama";
const char * password = "ellaisthebest";
const char * mqtt_server = "91.121.93.94"; // ip address of test.mosquitto.org

WiFiClient espClient;
PubSubClient client(espClient);

#define DHTPIN D3
DHT dht(DHTPIN, DHT11);
#define LDR_DATA A0
#define LEDHum D5
#define LEDTem D6
#define LEDLig D7
LiquidCrystal_I2C lcd(0x27,16,2);
int currentSensor; // to see which sensor to process -> 0 = humidity, 1 = temp, 2 = light, 3 = water level


void setup_wifi() 
{

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  writeToLCD(String("WiFi Connected"), WiFi.localIP().toString());
  delay(5000);
}


void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      writeToLCD(String("MQTT Connection"), String("Successful"));
      // Once connected, publish an announcement...
      client.publish("maarij/iotProject/temp", "device on");
      client.publish("maarij/iotProject/humidity", "device on");
      client.publish("maarij/iotProject/light", "device on");
      delay(5000);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      writeToLCD(String("MQTT Connection"), String("Fail-Retry in 5"));
      delay(5000);
    }
  }
}

void setup() 
{
  Serial.begin(115200);

  lcd.begin(); 
  lcd.clear();     
  lcd.backlight();

  setup_wifi();
  client.setServer(mqtt_server, 1883);

  dht.begin();

  pinMode(LDR_DATA, INPUT);

  pinMode(LEDHum, OUTPUT);
  digitalWrite(LEDHum, LOW);
  pinMode(LEDTem, OUTPUT);
  digitalWrite(LEDTem, LOW);
  pinMode(LEDLig, OUTPUT);
  digitalWrite(LEDLig, LOW);

  currentSensor = 0;
}

void loop() 
{

  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  if (currentSensor == 0)
  {
    float humidity = dht.readHumidity();

    if (humidity >= 50)
      digitalWrite(LEDHum, HIGH);
    else
      digitalWrite(LEDHum, LOW);

    writeToLCD(String("Humidity"), String(humidity)+String(" Percent"));
    client.publish("maarij/iotProject/humidity", String(humidity).c_str());

    currentSensor++;
  }
  else if (currentSensor == 1)
  {
    float temperature = dht.readTemperature();

    if (temperature >= 30)
      digitalWrite(LEDTem, HIGH);
    else
      digitalWrite(LEDTem, LOW);

    writeToLCD(String("Temperature"), String(temperature)+String(" Celsius"));
    client.publish("maarij/iotProject/temp", String(temperature).c_str());

    currentSensor++;
  }
  else if (currentSensor == 2)
  {
    float ldrPercentage = readLDR();

    if (ldrPercentage <= 50)
      digitalWrite(LEDLig, HIGH);
    else
      digitalWrite(LEDLig, LOW);

    writeToLCD(String("Light Intensity"), String(ldrPercentage)+String(" Percent"));
    client.publish("maarij/iotProject/light", String(ldrPercentage).c_str());
    
    currentSensor = 0;
  }

  delay(2000);

}


float readLDR()
{
  int rawValue = analogRead(LDR_DATA);
  Serial.println(rawValue);
  float percentage = map(rawValue, 200, 1024, 0, 100);
  return percentage;
}

void writeToLCD(String line1, String line2)
{
  lcd.clear();
  lcd.setCursor(0,0);  
  lcd.print(line1); 
  lcd.setCursor(0,1);  
  lcd.print(line2);
}
