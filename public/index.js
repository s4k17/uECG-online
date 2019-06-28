'use strict';
import * as canvas_plot from './canvas_plot.js';

var connected_to_server = false;
var server_send_new_data = false;
export var need_update_canvas = false;

export var canvas;
var server_ip = "176.104.21.173";
var server_port = 80;
//var server_ip = "192.168.1.131";
//var server_port = 3000;

export var value_from_server = -1;
export var data_buff_from_server = [];
export var data_buff_from_server_num = 0;
export var data_buff_from_server_overflow = false;
var data_buff_for_plot = [];
const data_buff_from_server_max = 2000;
var new_data_time, time_data_update;

export let del_elements = 10;

export var mouse_lable;
export var new_value_lable;
export var FPS_lable;
export var canvas_size_lable;
export var connect_button_lable;
export var serial_port_button_lable
export var frame_update_time_lable;
export var data_buffer_lable;
let serverAdress = 'http://' + server_ip + ':'+ server_port;
console.log(serverAdress);

const socket = io({
  autoConnect: false
});

let SocketID = socket.id;

socket.on('serial_port_news', function (data) {
  console.log("Get news from server: " + data);
});

socket.on('serial_port_news', function (data) {
  console.log("Get news from server: " + data);
});

socket.on('Serial port connected', function () {
  console.log("Serial port connected");
});

socket.on('connect', function () {
  SocketID = socket.id;
  console.log("Connected  SocketID: [" + SocketID + "]");
});

socket.on('update_data', function (new_data_buf){
  if( connected_to_server ){
    server_send_new_data = true;

    if( data_buff_from_server.length < data_buff_from_server_max){
      data_buff_from_server.push( Object.values(new_data_buf) );
      data_buff_from_server = [].concat.apply([], data_buff_from_server);
      data_buff_from_server_overflow = false;
    }else{
      data_buff_from_server_overflow = true;
    }
    need_update_canvas = true;
  }

});

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
      scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
      scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

  return {
    x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
  }
}

function update_canvas_size_lables(){
  canvas_size_lable.nodeValue =
    canvas.width + ", " + canvas.height +
    ", client [" + canvas.clientWidth + ", "+ canvas.clientHeight + "]";
}



var drag_flag = 0;
var start_pos = {x: 0, y: 0};

document.addEventListener("DOMContentLoaded", function(event) {
  console.log('Event: DOMContentLoaded callback');
  canvas = document.getElementById("my_plot");
  //socket.open();

  var FPS_lable_Element = document.getElementById("FPS_lable");
  var new_value_lable_Element = document.getElementById("new_value_lable");
  var mouse_lable_Element = document.getElementById("mouse_lable");
  var canvas_size_lable_Element = document.getElementById("canvas_size_lable");
  var connect_button_Element = document.getElementById("connect_button_lable_id");
  var serial_port_button_Element = document.getElementById("serial_port_button_id");
  var data_buffer_Element = document.getElementById("data_buffer_lable");
  //var frame_update_time_Element = document.getElementById("frame_update_time");

  new_value_lable = document.createTextNode("");
  FPS_lable = document.createTextNode("");
  mouse_lable = document.createTextNode("0, 0");
  canvas_size_lable = document.createTextNode("");
  connect_button_lable = document.createTextNode("Disonnect?");
  serial_port_button_lable = document.createTextNode("");
  data_buffer_lable = document.createTextNode("");
  //frame_update_time_lable = document.createTextNode("");

  FPS_lable_Element.appendChild(FPS_lable);
  new_value_lable_Element.appendChild(new_value_lable);
  mouse_lable_Element.appendChild(mouse_lable);
  canvas_size_lable_Element.appendChild(canvas_size_lable);
  connect_button_Element.appendChild(connect_button_lable);
  serial_port_button_Element.appendChild(serial_port_button_lable);
  data_buffer_Element.appendChild(data_buffer_lable);
  //frame_update_time_Element.appendChild(frame_update_time_lable);

  canvas.onmousedown = function(event){
    drag_flag = 1;
    canvas.style.cursor = "move";
    var mouse_pos = getMousePos(canvas, event);

    canvas.onmousemove = function(event) {
      if(drag_flag === 1){

      }
    };

    canvas.onmouseup = function(event){
      //start_pos = {x: 0, y: 0};
      drag_flag = 0;
      canvas.style.cursor = "default";
    };
  }

  canvas.onmousemove = function(event){
    var mouse_pos = getMousePos(canvas, event);
    mouse_lable.nodeValue = mouse_pos.x.toFixed(0) + ", " + mouse_pos.y.toFixed(0);
    //translation[0] = mouse_pos.x/200 + 9;
    //translation[1] = mouse_pos.y/200 - 300;
    //console.log("move " + mouse_pos.x + ", "+ mouse_pos.y);
  };

  connect_button_Element.onmousedown = function(event){
    if(connected_to_server){
      connected_to_server = false;
      socket.emit('need_disconnect_byID', SocketID);
      socket.close();
      console.log("Disconnect SocketID: [" + SocketID + "]");
      connect_button_lable.nodeValue = "Connect";
      //canvas_plot.canvasFPS = 1;
    }
    else{
      connected_to_server = true;
      connect_button_lable.nodeValue = "Disconnect?";
      socket.open();
      SocketID = socket.id;
      console.log("Connected  SocketID: [" + SocketID + "]");
      //canvas_plot.canvasFPS = 30;
    }
  };

  serial_port_button_Element.onmousedown = function(event){
    del_elements = prompt("Filter elements");
  }
  setInterval(function(){
    data_buffer_lable.nodeValue = data_buff_from_server.length;
  },500);

  setInterval(function(){
    if(socket.disconnected && connected_to_server){
      connected_to_server = false;
      server_send_new_data = false;
      socket.close();
      console.log("Connection lost, SocketID: [" + SocketID + "]");
      connect_button_lable.nodeValue = "Connect";
      //canvas_plot.canvasFPS = 10;
    }
  },700);

  canvas_plot.mode.line_type = "continious"; // continious or dot
  canvas_plot.RunApp();

  window.onresize = function(event) {update_canvas_size_lables()};
  window.onload = function(event) {update_canvas_size_lables()};
});

//IMPORTANT Works only on  http://localhost or https://...
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    console.log('CLIENT: service worker registration in progress.');
    navigator.serviceWorker.register('service-worker.js', { scope: '/' }).then(function() {
      console.log('CLIENT: service worker registration complete.');
    }, function() {
      console.log('CLIENT: service worker registration failure.');
    });
  }else{
    console.log('CLIENT: service worker is not supported.');
  }
}

registerServiceWorker();
