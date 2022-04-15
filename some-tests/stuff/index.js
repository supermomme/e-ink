const { createCanvas, loadImage } = require('canvas')
const canvas = createCanvas(648, 480)
const ctx = canvas.getContext('2d')
const fs = require('fs')

ctx.clearRect(0, 0, canvas.width, canvas.height)
ctx.fillStyle = "rgba(255,255,255,1)";
ctx.fillRect( 0, 0, canvas.width, canvas.height );
ctx.fillStyle = "rgba(0,0,0,1)";
ctx.fillRect( 0, 0, 50, 50 );

// Write "Awesome!"
ctx.font = '100px Impact'
ctx.rotate(0.1)
ctx.fillText('Codeanker ! :D', 50, 100)
ctx.rotate(-0.1)

// Draw line under text
// var text = ctx.measureText('Awesome!')
ctx.strokeStyle = 'rgba(0,0,0,1)'
ctx.beginPath()
ctx.lineTo(50, 50)
ctx.lineTo(300, 300)
ctx.stroke()

ctx.font = '100px Impact'
ctx.rotate(-0.2)
ctx.fillText('Yay', 300, 500)
ctx.rotate(0.2)


console.log(canvas.toDataURL())

var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
var pix = imgd.data;

// Loop over each pixel and invert the color.

const booleanArray = []


for (var i = 0, n = pix.length; i < n; i += 4) {
  const r = pix[i  ] * (pix[i+3]/255)
  const g = pix[i+1] * (pix[i+3]/255)
  const b = pix[i+2] * (pix[i+3]/255)
  const greyScale = (r + g + b)/3
  const white = greyScale > 127
  booleanArray.push(white)
}


let bytes = []
for (let i = 0; i < booleanArray.length; i+=8) {
  let byte = 0;
  byte = (byte << 1) + (booleanArray[i  ] ? 0 : 1)
  byte = (byte << 1) + (booleanArray[i+1] ? 0 : 1)
  byte = (byte << 1) + (booleanArray[i+2] ? 0 : 1)
  byte = (byte << 1) + (booleanArray[i+3] ? 0 : 1)
  byte = (byte << 1) + (booleanArray[i+4] ? 0 : 1)
  byte = (byte << 1) + (booleanArray[i+5] ? 0 : 1)
  byte = (byte << 1) + (booleanArray[i+6] ? 0 : 1)
  byte = (byte << 1) + (booleanArray[i+7] ? 0 : 1)
  bytes.push(byte)
}

let hexStrings = []
for (let i = 0; i < booleanArray.length; i+=8) {
  let firstByte = 0;
  firstByte = (firstByte << 1) + (booleanArray[i  ] ? 0 : 1)
  firstByte = (firstByte << 1) + (booleanArray[i+1] ? 0 : 1)
  firstByte = (firstByte << 1) + (booleanArray[i+2] ? 0 : 1)
  firstByte = (firstByte << 1) + (booleanArray[i+3] ? 0 : 1)

  let secondByte = 0;
  secondByte = (secondByte << 1) + (booleanArray[i+4] ? 0 : 1)
  secondByte = (secondByte << 1) + (booleanArray[i+5] ? 0 : 1)
  secondByte = (secondByte << 1) + (booleanArray[i+6] ? 0 : 1)
  secondByte = (secondByte << 1) + (booleanArray[i+7] ? 0 : 1)

  hexStrings.push(`0x${Number(firstByte).toString(16).toUpperCase()}${Number(secondByte).toString(16).toUpperCase()}`)
}

console.log(hexStrings.length)
const output = hexStrings.join(',') + '\n'

fs.writeFileSync('output.txt', output)



// Include Nodejs' net module.
const Net = require('net');
// The port on which the server is listening.
const port = 4000;

// Use net.createServer() in your code. This is just for illustration purpose.
// Create a new TCP server.
const server = new Net.Server();
// The server listens to a socket for a client to make a connection request.
// Think of a socket as an end point.
server.listen({ port, host: '0.0.0.0' }, function() {
    console.log(`Server listening for connection requests on socket localhost:${port}`);
});

// When a client requests a connection with the server, the server creates a new
// socket dedicated to that client.

// const bytes = [
//   0x00, 0xFF, 0xAA
// ]

server.on('connection', function(socket) {
    console.log('NEW CONNECTION');
    socket.on('data', function(chunk) {
      console.log(`> ${chunk.toString()}`);
      if (chunk.toString() === 'GET_IMG') {
        socket.write(Buffer.from(bytes))
        // socket.write(0xFF)
        // socket.write(0xAA)
        
      }
    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    socket.on('end', function() {
      console.log('END CONNECTION');
    });

    // Don't forget to catch error, for your own sake.
    socket.on('error', function(err) {
        console.log(`Error: ${err}`);
    });
});