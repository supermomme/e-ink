#include "buff.h"
#include "epd.h"  // e-Paper driver
#include <WiFi.h>

// TCP Sockets
const IPAddress serverIP(192,168,137,1); // TCP Server IP
uint16_t serverPort = 4000;             // Port

 // Wifi 
const char* ssid = "DESKTOP-T77D0VL"; // Wifi ssid
const char* pass = "tomate123";   // Wifi password

WiFiClient client; 

void setup() 
{
  // Serial port initialization
  Serial.begin(115200);
  delay(10);

  // init and connect wifi
  WiFi.begin(ssid, pass);
  Serial.println("Connecting Wifi");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected");
  Serial.println();

  // EPD init
  EPD_initSPI();
  EPD_Init_5in83_V2();


  Serial.println("Connecting tcp socket");
  while (!client.connected())
  {
    client.connect(serverIP, serverPort);
    delay(1000);
    Serial.print(".");
  }
  Serial.println("TCP socket connected");
  client.print("GET_IMG");
  int bitsReceived = 0;
  while (bitsReceived < 38880) {
    if(client.available() > 0) {
      byte b = client.read();
      EPD_SendData(b);
      bitsReceived++;
    }
  }
  EPD_showC();
  client.stop();
  Serial.println("NOW SLEEP AGAIN!");
  // TODO: deep sleep
}



void loop() 
{
}
