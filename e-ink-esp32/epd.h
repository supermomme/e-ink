


/* SPI pin definition --------------------------------------------------------*/

#define PIN_SPI_SCK  13
#define PIN_SPI_DIN  14
#define PIN_SPI_CS   15
#define PIN_SPI_BUSY 25//19
#define PIN_SPI_RST  26//21
#define PIN_SPI_DC   27//22

/* Pin level definition ------------------------------------------------------*/

#define GPIO_PIN_SET   1
#define GPIO_PIN_RESET 0


void EPD_initSPI()
{
    pinMode(PIN_SPI_BUSY,  INPUT);
    pinMode(PIN_SPI_RST , OUTPUT);
    pinMode(PIN_SPI_DC  , OUTPUT);
    
    pinMode(PIN_SPI_SCK, OUTPUT);
    pinMode(PIN_SPI_DIN, OUTPUT);
    pinMode(PIN_SPI_CS , OUTPUT);

    digitalWrite(PIN_SPI_CS , HIGH);
    digitalWrite(PIN_SPI_SCK, LOW);
}

/* The procedure of sending a byte to e-Paper by SPI -------------------------*/
void EpdSpiTransferCallback(byte data) 
{
    //SPI.beginTransaction(spi_settings);
    digitalWrite(PIN_SPI_CS, GPIO_PIN_RESET);

    for (int i = 0; i < 8; i++)
    {
        if ((data & 0x80) == 0) digitalWrite(PIN_SPI_DIN, GPIO_PIN_RESET); 
        else                    digitalWrite(PIN_SPI_DIN, GPIO_PIN_SET);

        data <<= 1;
        digitalWrite(PIN_SPI_SCK, GPIO_PIN_SET);
        digitalWrite(PIN_SPI_SCK, GPIO_PIN_RESET);
    }
    
    //SPI.transfer(data);
    digitalWrite(PIN_SPI_CS, GPIO_PIN_SET);
    //SPI.endTransaction();
}

/* Sending a byte as a command -----------------------------------------------*/
void EPD_SendCommand(byte command) 
{
    digitalWrite(PIN_SPI_DC, LOW);
    EpdSpiTransferCallback(command);
}

/* Sending a byte as a data --------------------------------------------------*/
void EPD_SendData(byte data) 
{
    digitalWrite(PIN_SPI_DC, HIGH);
    EpdSpiTransferCallback(data);
}

/* Waiting the e-Paper is ready for further instructions ---------------------*/
void EPD_WaitUntilIdle() 
{
    //0: busy, 1: idle
    while(digitalRead(PIN_SPI_BUSY) == 0) delay(100);    
}

/* Send a one-argument command -----------------------------------------------*/
void EPD_Send_1(byte c, byte v1)
{
    EPD_SendCommand(c);
    EPD_SendData(v1);
}

/* Send a two-arguments command ----------------------------------------------*/
void EPD_Send_2(byte c, byte v1, byte v2)
{
    EPD_SendCommand(c);
    EPD_SendData(v1);
    EPD_SendData(v2);
}

/* Send a three-arguments command --------------------------------------------*/
void EPD_Send_3(byte c, byte v1, byte v2, byte v3)
{
    EPD_SendCommand(c);
    EPD_SendData(v1);
    EPD_SendData(v2);
    EPD_SendData(v3);
}

/* Send a four-arguments command ---------------------------------------------*/
void EPD_Send_4(byte c, byte v1, byte v2, byte v3, byte v4)
{
    EPD_SendCommand(c);
    EPD_SendData(v1);
    EPD_SendData(v2);
    EPD_SendData(v3);
    EPD_SendData(v4);
}

/* This function is used to 'wake up" the e-Paper from the deep sleep mode ---*/
void EPD_Reset() 
{
    digitalWrite(PIN_SPI_RST, HIGH); 
    delay(200);    
    digitalWrite(PIN_SPI_RST, LOW);    
    delay(5);
    digitalWrite(PIN_SPI_RST, HIGH); 
    delay(200);    
}

/* e-Paper initialization functions ------------------------------------------*/ 

#define UWORD   uint16_t

int EPD_Init_5in83_V2() 
{
  EPD_Reset();

  EPD_Send_4(0x01, 0x07, 0x07, 0x3f, 0x3f);            // POWER_SETTING 

  EPD_SendCommand(0x04);                    // POWER_ON
  delay(100);
  EPD_WaitUntilIdle();

  EPD_Send_1(0x00, 0x1F);            // PANEL_SETTING
  EPD_Send_4(0x61, 0x02, 0x88, 0x01, 0xE0);// TCON_RESOLUTION
  EPD_Send_1(0X15, 0x00);                  
  EPD_Send_2(0X50, 0x10, 0x07);               
  EPD_Send_1(0X60, 0x22);               

  EPD_SendCommand(0x10);                   // DATA_START_TRANSMISSION_1  
  for(UWORD i=0; i<38880; i++) {
    EPD_SendData(0x00);
  }
  EPD_SendCommand(0x13);                   // DATA_START_TRANSMISSION_2
  delay(2);
  return 0;
}


bool EPD_invert;           // If true, then image data bits must be inverted
int  EPD_dispIndex;        // The index of the e-Paper's type
int  EPD_dispX, EPD_dispY; // Current pixel's coordinates (for 2.13 only)
void(*EPD_dispLoad)();     // Pointer on a image data writting function

/* Image data loading function for a-type e-Paper ----------------------------*/ 

void EPD_loadAFilp()
{
    // Come back to the image data end
    Buff__bufInd -= 8;

    // Get the index of the image data begin
    int pos = Buff__bufInd - Buff__getWord(Buff__bufInd);

    // Enumerate all of image data bytes
    while (pos < Buff__bufInd)
    {
        // Get current byte
        int value = Buff__getByte(pos);
		
        // Invert byte's bits in case of '2.7' e-Paper
        if (EPD_invert) value = ~value;

        // Write the byte into e-Paper's memory
        EPD_SendData(~(byte)value);

        // Increment the current byte index on 2 characters
        pos += 2;
    }
}


/* Show image and turn to deep sleep mode (7.5 and 7.5b e-Paper) -------------*/
void EPD_showC() 
{
    // Refresh
    EPD_SendCommand(0x12);// DISPLAY_REFRESH
    delay(100);
    EPD_WaitUntilIdle();

    // Sleep
    EPD_SendCommand(0x02);// POWER_OFF
    EPD_WaitUntilIdle();
    EPD_Send_1(0x07, 0xA5);// DEEP_SLEEP
}
