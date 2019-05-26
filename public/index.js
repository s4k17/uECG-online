'use strict';
import * as canvas_plot from './canvas_plot.js';

var connected_to_server = false;
var server_send_new_data = false;
export var need_update_canvas = false;

export var canvas;
var server_ip = "192.168.1.131";
var server_port = 3000;

export var value_from_server = -1;
var new_data_time, time_data_update;

export var mouse_lable;
export var new_value_lable;
export var FPS_lable;
export var canvas_size_lable;
export var connect_button_lable;
export var frame_update_time_lable;

console.log('http://' + server_ip + ':'+ server_port);

/*Connect socet.io for serial port*/
const socket = io.connect('http://' + server_ip + ':'+ server_port);

socket.on('serial_port_news', function (data) {
  console.log("Get news from server: " + data);
});

socket.on('Serial port connected', function () {
  console.log("Serial port connected");
});

socket.on('update_data', function (_new_value){
  if(connected_to_server){
    value_from_server = _new_value;
    server_send_new_data = true;
    canvas_plot._update_plot_data();
    need_update_canvas = true;
  }
  //console.log(_new_value);
});

setInterval(function(){
  if(server_send_new_data == false){
    connect_button_lable.nodeValue = "Connect";
  }
  server_send_new_data = false;
},1000);


setInterval(function(){
  if(connected_to_server){
    new_value_lable.nodeValue = value_from_server;
  }
},200);



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

  var FPS_lable_Element = document.getElementById("FPS_lable");
  var new_value_lable_Element = document.getElementById("new_value_lable");
  var mouse_lable_Element = document.getElementById("mouse_lable");
  var canvas_size_lable_Element = document.getElementById("canvas_size_lable");
  var connect_button_Element = document.getElementById("connect_button_lable_id");
  //var frame_update_time_Element = document.getElementById("frame_update_time");

  new_value_lable = document.createTextNode("");
  FPS_lable = document.createTextNode("");
  mouse_lable = document.createTextNode("0, 0");
  canvas_size_lable = document.createTextNode("");
  connect_button_lable = document.createTextNode("Connect");
  //frame_update_time_lable = document.createTextNode("");

  FPS_lable_Element.appendChild(FPS_lable);
  new_value_lable_Element.appendChild(new_value_lable);
  mouse_lable_Element.appendChild(mouse_lable);
  canvas_size_lable_Element.appendChild(canvas_size_lable);
  connect_button_Element.appendChild(connect_button_lable);
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
      connect_button_lable.nodeValue = "Connect";
    }
    else{
      connected_to_server = true;
      connect_button_lable.nodeValue = "Disconnect?";
    }
  };

  canvas_plot.mode.line_type = "dot"; // continious or dot

  canvas_plot.RunApp();

  window.onresize = function(event) {update_canvas_size_lables()};
  window.onload = function(event) {update_canvas_size_lables()};
});
