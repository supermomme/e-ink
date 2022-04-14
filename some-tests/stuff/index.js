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
