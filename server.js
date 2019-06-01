//https://github.com/priyanshrastogi/temperature-plot
//https://github.com/IgorKonovalov/Arduino_to_Node/blob/master/arduino/SIK_circuit02_potentiometer.ino

//$ sudo npm run start
//$ sudo nodemon server.js

//Server init:


var start = Date.now();
var address;
var time;
var socketID;
var clientIP;

const minimist = require('minimist');
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

setInterval(function(){
  io.sockets.emit('update_data', lastValue);
},1);

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
  address = socket.handshake.address;
  time = socket.handshake.time;
  socketID = socket.id;
  clientIP = socket.request.connection.remoteAddress;
  console.log("->>-  SocketID: [" + socketID + "] " + clientIP);
  console.log( Object.keys(io.engine.clients) );

  socket.on('disconnect', function (socket) {
    console.log("-> >- SocketID: [" + socketID + "] " + clientIP);
  });

  serial_port.on('error', function(err) {
    console.log('Error: ', err.message)
  });

  serial_port.on('readable', function () {
      parser.on('data', new_value => {
        lastValue = new_value;
        //io.sockets.emit('update_data', new_value);
      });
  });
});



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

var localhost_name;
var localhost_port;

function ServerInit(){
  let args = minimist(process.argv.slice(2), {
    alias: {
        h: 'help',
        v: 'version',
        p: 'port'
    },
    default:{
        localhost_name: "192.168.1.131",
        port: "3000"
    },
    unknown: (arg) => {
      console.error('Unknown option: ', arg)
      return false
    }
  });

  localhost_name = args['localhost_name'];
  localhost_port = args['port'];

  if( args['v'] ){
    let app_info = require('./package.json');
    console.log("\n  App name: " + app_info['name'] + " - " + app_info['description'] + "\n");
    console.log("  Version: " + app_info['version'] + "\n");
    process.exit();
  }
  if( args['h'] ){
    let app_info = require('./package.json');
    console.log("\nHelp for uECG-online\n");
    console.log("\t-h --help\tPrint this help\n");
    console.log("\t-v --version\tPrint current version of uECG-online\n");
    console.log("\t-p --port\tNetwork port number (default 3000)");
    console.log(`
      Runing app:
      $sudo npm start      \t\t\t(run from node.js script)
      $sudo node server.js [only here you can use the commands]
      $sudo node server.js --port 3000 \t\t(start server on port 3000)
      $sudo node server.js -p 3000 \t\t(start server on port 3000)

  You can open the browser on (localhost_name:port) after the server starts.
  Pay attention! Use $sudo to have access to the serial port.
  If the base station is connected to USB, the App will try to find and open it serial port.

    `);
    process.exit();
  }
}

ServerInit();

Server.listen(localhost_port, () => {
  console.log(`Server started on ${localhost_name}:${localhost_port}`);
  // check_serial_ports();
});
