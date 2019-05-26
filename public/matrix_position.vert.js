export var vertexShaderSource = `
attribute vec2 a_position;
uniform mat3 u_matrix;
uniform float f_point_size;

void main(){
  // Multiply the position by the matrix.
  gl_Position = vec4( u_matrix*vec3(a_position, 1), 1.0);
  gl_PointSize = f_point_size;
}
`;
