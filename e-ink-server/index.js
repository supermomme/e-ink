const { createCanvas, loadImage } = require('canvas')
const canvas = createCanvas(648, 480)
const ctx = canvas.getContext('2d')
const Net = require('net');
const port = 4000;

const draw = () => {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  // Background
  ctx.fillStyle = "white";
  ctx.fillRect( 0, 0, canvas.width, canvas.height );
  // Default fillstyle
  ctx.fillStyle = "black";
  
  // Stuff
  ctx.font = '100px Impact'
  ctx.rotate(0.1)
  const date = new Date()
  ctx.fillText(`${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`, 25, 100)
  ctx.rotate(-0.1)

  ctx.font = '100px Impact'
  ctx.rotate(-0.2)
  ctx.fillText('Moin', 300, 500)
  ctx.rotate(0.2)
}

const getBWBuffer = () => {
  var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var pix = imgd.data;

  var booleanArray = [] // bits (black and white)
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
  return Buffer.from(bytes)
}


const server = new Net.Server();
server.listen({ port, host: '0.0.0.0' }, function() {
  console.log(`Server listening for connection requests on socket 0.0.0.0:${port}`);
});

server.on('connection', function(socket) {
  console.log('NEW CONNECTION');
  socket.on('data', function(chunk) {
    console.log(`> ${chunk.toString()}`);
    if (chunk.toString() === 'GET_IMG') {
      console.log('< IMAGE_DATA')
      draw()
      socket.write(getBWBuffer())
    }
  });

  socket.on('end', function() {
    console.log('END CONNECTION');
  });

  socket.on('error', function(err) {
    console.log(`Error: ${err}`);
  });
});
