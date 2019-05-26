//https://github.com/priyanshrastogi/temperature-plot
//https://github.com/IgorKonovalov/Arduino_to_Node/blob/master/arduino/SIK_circuit02_potentiometer.ino

//$ sudo npm run start
//$ sudo nodemon server.js

//Server init:
const local_hostname = '192.168.1.131';
const localhost_port = '3000';

var start = Date.now();
var address;
var time;
var socketID;
var clientIP;

const http = require('http');
const express = require('express');
const app = express();
app.use(express.static(__dirname + '/public'));

const Server = http.createServer(app);
const io = require('socket.io').listen(Server);

//Server init.

//Serial port init:
const SerialPorts = require('serialport');
const sp_readline = SerialPorts.parsers.Readline;
const parser = new sp_readline();
const Serial_baudRate = 115200;

var serial_port;
var Serial_path;
var SerialPort_opened = false;
var SerialPort_connected = false;
var SerialPort_Receive_data = false;

let lastValue;

function SerialPort_connection(){
  if(Serial_path != null){
    serial_port = new SerialPorts(Serial_path, { baudRate: Serial_baudRate });
    serial_port.pipe(parser);
    console.log( "Serial port: " + Serial_path + ' physically opened!' );
  }
}

function SerialPort_close(){
  console.log('port closed');
  serial_port.close(function (err) {
    console.log('port closed', err);
  });
}
//Serial port init.

// list serial ports:
function check_serial_ports(){
  SerialPorts.list(function (err, ports) {
    //console.log("Check");
    if(serial_port == null){
      ports.forEach(function(port) {
        //console.log("Check");
        //console.log(port);
        if( port.comName.match(/ACM?/g) ){
          Serial_path = port.comName;
          console.log( "Serial port: " + Serial_path + ' physically connected.' );
          SerialPort_connection();
        }
      });
    }
  });
}
// list serial ports.
/*
setInterval(function(){
  //io.sockets.emit('update_data', lastValue);
},1);
*/
function serial_port_read_data(){
  serial_port.on('open', () => {
    io.on('connection', socket => {
      io.sockets.emit('Serial port connected');
    });
  });
}


/*
serial_port.on('data', () => {
  let lastValue;
    parser.on('data', new_value => {
      console.log('new_value = ' + new_value);
      if (lastValue !== new_value) {

      }
      lastValue = new_value;
    });
});
*/
check_serial_ports();

var temp = true;
io.sockets.on('connection', function (socket) {
  io.on('connection', function (socket) {
    address = socket.handshake.address;
    time = socket.handshake.time;
    socketID = socket.id;
    clientIP = socket.request.connection.remoteAddress;

    console.log("socketID: [" + socketID + "], socketID:" + clientIP);
    console.log('Time: '+ time + ', New connection from ' + address);
  });
  /*
  serial_port.on('error', function(err) {
    console.log('Error: ', err.message)
  });
*/
  serial_port.on('readable', function () {
      parser.on('data', new_value => {
        lastValue = new_value;
        io.sockets.emit('update_data', new_value);
      });
  });
  //serial_port.read(console.log())
/*
  serial_port.on('data', function(data){
    console.log('Data:',data);
    //lastValue = ~~data.slice(0, -2);// make com port lag
    //socket.to(socketID).emit('update_data', lastValue);
  });
*/

  /*
  parser.on('data', new_value => {

  });
  */
  /*
  serial_port.on('close', () => {
    console.log("Serial port: " + Serial_path + ' closed!');
    Serial_path = null;
    io.sockets.emit('serial_port_news', 'Serial port closed');
  });
  */
  socket.on('disconnected', function () {
  	console.log('user disconnected');
  });
});

Server.listen(localhost_port, () => {
  console.log(`Server started on ${local_hostname}:${localhost_port}`);
  // check_serial_ports();
})

/*
app.get('/', function (req, res) {
  res.sendFile('public/index.html', { root : __dirname});
})

app.get('/serial_port', function (req, res) {
  res.json({
    Serial_path: "qwerty/asdfg",
    Serial_port: "ttyACM0",
    Serial_baudRate: "115200"
  });
})
*/
