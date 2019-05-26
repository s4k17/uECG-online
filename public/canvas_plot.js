import {vertexShaderSource} from "./matrix_position.vert.js";
import {fragmentShaderSource} from "./color_frag_shader.frag.js";
import * as client from "./index.js";
import {m3} from "./matrix.js";

//GLOBAL gl context variables:
var gl; // gl context

var canvasFPS = 20;
var FPS_filtered = 0;
var render_time_filtered = 0;
var need_update_frame = false;

var timeSpent = 0;

var shaderProgram;
var positionLocation_attr;
var point_size_attr;
var matrixLocation_attr;
var colorUniformLocation_attr;

let positionBuffer;

//variables:
//export var translation = [15.0, -100.0];
export var translation = [0.00, 0.00];
export var mode = {
  line_type: "continious", //'continious' || 'dot'
  line_width: 1.0,
  point_size: 2.0
};
var angleInRadians = 0;
var scale = [1.0, 1.0];
//variables.

var frame_counter = 1;

// DATA:
const vertices_n = 500;
var gl_vertices_plot_points_f32;

function _GL_init() {
  gl = client.canvas.getContext("webgl");
  //var plot_grid = new Plot_grid(client.canvas, 1, 20, "horisontal");
  if (!gl){
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
}

var t0, t1, delta_t;

function _renderLoop(){
  setInterval( function (){
    if(client.need_update_canvas){
      t0 = performance.now();
      render();
      t1 = performance.now();
      delta_t = t1 - t0;
      render_time_filtered += delta_t*0.01;
      render_time_filtered *= 0.99;
      FPS_filtered = 1000/render_time_filtered;
    }
    client.FPS_lable.nodeValue =
      FPS_filtered.toFixed(1) +
      ", Render time: " + render_time_filtered.toFixed(2) + " ms";
  }, 1000/canvasFPS);
}


export function RunApp(){
  _GL_init();
  _Shader_init();
  console.log("_Shader_init - OK");
  _vertex_buffer_init();
  console.log("_vertex_buffer_init - OK");
  if (gl) {
		gl.clearDepth(1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		_renderLoop();
	}
  //cleanup();
}


function _createShader(gl, type, source) {
  var shader_obj = gl.createShader(type);// Create fragment shader object
  gl.shaderSource(shader_obj, source);// Attach vertex shader source code
  gl.compileShader(shader_obj); // Compile the vertex shader
  var success = gl.getShaderParameter(shader_obj, gl.COMPILE_STATUS);

  // Check for any compilation error
  if (!gl.getShaderParameter(shader_obj, gl.COMPILE_STATUS)) {
     alert(gl.getShaderInfoLog(shader_obj));
     console.log(gl.getShaderInfoLog(shader_obj));
     gl.deleteShader(shader_obj);
     return null;
  }else return shader_obj;
}


function _Shader_init(){

  var vertShader = _createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  var fragShader = _createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  shaderProgram = _Create_shader_program(vertShader, fragShader);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    var linkErrLog = gl.getProgramInfoLog(shaderProgram);
    cleanup();
    console.log("Shader program did not link successfully. " +
      "Error log: " + linkErrLog
    );
    return;
  }
  //gl.useProgram(shaderProgram);

  positionLocation_attr = gl.getAttribLocation(shaderProgram, "a_position");
  point_size_attr = gl.getUniformLocation(shaderProgram, "f_point_size");
  matrixLocation_attr = gl.getUniformLocation(shaderProgram, "u_matrix");
  colorUniformLocation_attr = gl.getUniformLocation(shaderProgram, "u_color");
}

function _Create_shader_program( vert_shader, frag_shader){
  var shaderProgram = gl.createProgram();// Attach a vertex shader
  gl.attachShader(shaderProgram, frag_shader);// Attach a fragment shader
  gl.attachShader(shaderProgram, vert_shader);
  gl.linkProgram(shaderProgram); // Link both the programs

  gl.detachShader(shaderProgram, vert_shader);
  gl.detachShader(shaderProgram, frag_shader);
  gl.deleteShader(vert_shader);
  gl.deleteShader(frag_shader);

  return shaderProgram
}

function _vertex_buffer_init(){
  // DATA:
  var vertices = Array(vertices_n).fill(0);

  for (var i = 0; i < vertices_n - 1; i +=2) {
    vertices[i] = i/vertices_n;
    vertices[i + 1] = 0.9*Math.sin(i*2*3.1415/vertices_n);
  }

  gl_vertices_plot_points_f32 = new Float32Array(vertices);

  //console.log(vertices);
  //console.log(gl_vertices_plot_points_f32);
  // DATA.

  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);// Bind appropriate array buffer to it
  gl.bufferData(gl.ARRAY_BUFFER, gl_vertices_plot_points_f32, gl.STATIC_DRAW);// Pass the vertex data to the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  //prompt('Set COM port');

  //alert( "We use compiled and linked shader program" );
}

function _update_vertex_buffer( new_value, new_data ){
  for(var i = 0; i < vertices_n; i += 2){
      gl_vertices_plot_points_f32[i + 1] = gl_vertices_plot_points_f32[i + 3];
  }
  gl_vertices_plot_points_f32[ gl_vertices_plot_points_f32.length - 1 ] = new_value;
}

export function _update_plot_data(){
  _update_vertex_buffer( (client.value_from_server)/1024 - 0.5, timeSpent );
}

function GL_vertexAttribPointer( attr, byte_offset ){
  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // the pointer step
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 8*byte_offset;        // start at the beginning of the buffer
  //var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionLocation_attr, size, type, normalize, stride, offset
  );
}

function calc_Transformation_matrix3(){
  //translate and scal plot line
  var translate_leftMatrix = m3.translate_left(0.5); //setting Y axis is -1..0..1;
  var translationMatrix = m3.translate(translation[0], translation[1]);
  var scaleMatrix = m3.scale(scale[0], scale[1]);
  var matrix = m3.multiply(m3.scaleX(2), translate_leftMatrix);//setting X axis 0..1;
      matrix = m3.multiply(matrix, translationMatrix);
      matrix = m3.multiply(matrix, scaleMatrix);
  return matrix;
}


function render(){
  timeSpent += 1.0 / 60.0;

  gl.clearColor(0.08, 0.08, 0.18, 1.0);  //Clear the canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //Clear the color and depth buffer
  gl.viewport(0, 0, client.canvas.width, client.canvas.height);// Set the view port

  gl.useProgram(shaderProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, gl_vertices_plot_points_f32);

  GL_vertexAttribPointer(positionLocation_attr, 0);
  gl.enableVertexAttribArray(positionLocation_attr);
  //create transform matrix and
  var matrix = calc_Transformation_matrix3();
  gl.uniformMatrix3fv(matrixLocation_attr, false, matrix);
  gl.uniform4f(colorUniformLocation_attr, 0.8, 0.4, 1.0, 1.0);
  //gl.drawArrays(gl.LINE_STRIP, 0, vertices_n/2);// Draw the lines



  switch (mode.line_type) {
    case 'dot':{
      gl.uniform1f(point_size_attr,2.5);
      gl.drawArrays(gl.POINTS, 0, vertices_n/2);// Draw the lines
      break;
    }
    case 'continious':{
      gl.lineWidth(3);
      gl.drawArrays(gl.LINE_STRIP, 0, vertices_n/2);
      break;
    }
  }
  frame_counter++;
  if( frame_counter >= vertices_n/2 ) frame_counter = 0;
}

function cleanup() {
  gl.useProgram(null);
  if (positionBuffer) gl.deleteBuffer(positionBuffer);
  if (vertex_buffer)  gl.deleteBuffer(vertex_buffer);
  if (shaderProgram)  gl.deleteProgram(shaderProgram);
}

var need_move_plot = 0;
/*
function showCoords(evt){
  translation[0] = evt.clientX/client.canvas.clientWidth;
  translation[1] = evt.clientY/client.canvas.clientHeight;
  console.log("Mouse pos: " + translation[0] + "," + translation[1]);
}
*/
