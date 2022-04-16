const { createCanvas, loadImage } = require('canvas')
const canvas = createCanvas(648, 480)
const ctx = canvas.getContext('2d')
const Net = require('net');
const moment = require('moment');
const fs = require('fs')

const port = 4000;

const draw = async () => {
  // Reset and Clear
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  // Background
  ctx.fillStyle = "white";
  ctx.fillRect( 0, 0, canvas.width, canvas.height );
  // Default fillstyle
  ctx.fillStyle = "black";

  ctx.save()
  // Horizontal -> Vertical
  ctx.translate(canvas.width/2,canvas.height/2)
  ctx.rotate(90 * Math.PI / 180)
  ctx.translate(-canvas.height/2,-canvas.width/2)
  
  // Bild von Barne
  const img = await loadImage('https://codeanker.s3.eu-central-1.amazonaws.com/eink.bmp')
  ctx.drawImage(img, 0, 0);

  // last Updated
  ctx.font = '20px Impact'
  const dateString = moment().format('DD.MM.YYYY HH:mm')
  ctx.fillText(dateString, 0, 20)
  // ctx.fillText(dateString, canvas.width-ctx.measureText(dateString).width, 20)

  // save img for debug
  const out = fs.createWriteStream(__dirname + '/latest.png')
  const stream = canvas.createPNGStream()
  stream.pipe(out)
  // out.on('finish', () =>  console.log('The PNG file was created.'))

  return canvas.toDataURL()
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

var oldImgUrl = null
server.on('connection', function(socket) {
  console.log('NEW CONNECTION');
  socket.on('data', async function(chunk) {
    console.log(`> ${chunk.toString()}`);
    if (chunk.toString() === 'GET_IMG') {
      console.log('< IMAGE_DATA')
      socket.write(getBWBuffer())
    }

    if (chunk.toString() === 'UPDATE_AVAILABLE') {
      const newImgUrl = await draw()
      if (newImgUrl === oldImgUrl) {
        console.log('< false')
        socket.write(Buffer.from([0x00]))
      } else {
        console.log('< true')
        socket.write(Buffer.from([0xFF]))
        oldImgUrl = newImgUrl
      }
    }
  });

  socket.on('end', function() {
    console.log('END CONNECTION');
  });

  socket.on('error', function(err) {
    console.log(`Error: ${err}`);
  });
});
