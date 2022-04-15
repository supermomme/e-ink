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
server.on('connection', function(socket) {
    console.log('NEW CONNECTION');
    socket.on('data', function(chunk) {
      console.log(`> ${chunk.toString()}`);
      if (chunk.toString() === 'GET_IMG') {
        socket.write('Hey')
        
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