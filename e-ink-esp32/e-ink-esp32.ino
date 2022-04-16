#include "buff.h"
#include "epd.h"  // e-Paper driver
#include <WiFi.h>

// TCP Sockets
const IPAddress serverIP(10,0,1,18); // TCP Server IP
uint16_t serverPort = 4000;             // Port

 // Wifi 
const char* ssid = "xx"; // Wifi ssid
const char* pass = "xx";   // Wifi password

#define uS_TO_S_FACTOR 1000000  /* Conversion factor for micro seconds to seconds */
#define TIME_TO_SLEEP  60        /* Time ESP32 will go to sleep (in seconds) */

RTC_DATA_ATTR int bootCount = 0;

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
  
  // Check Update Available
  client.print("UPDATE_AVAILABLE");
  while (client.available() == 0) {}
  byte b = client.read();
  Serial.println(b, HEX);
  if (b == 0x00) {
    Serial.println("No Update");
    client.stop();
    delay(100);
    goDeepSleep();
    return;
  }

  // Get Img
  client.print("GET_IMG");
  int bitsReceived = 0;
  while (bitsReceived < 38880) {
    if(client.available() > 0) {
      byte b = client.read();
      EPD_SendData(b);
      bitsReceived++;
    }
  }
  client.stop();

  // apply
  EPD_showC();

  // deep sleep
  goDeepSleep();
}

void goDeepSleep() {
  Serial.println("Go Deep Sleep");
  esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
  esp_deep_sleep_start();
}



void loop() 
{
}
