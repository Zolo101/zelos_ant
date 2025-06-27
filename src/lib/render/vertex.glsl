#version 300 es
in vec4 position;

uniform mat4 matrix;
uniform mat4 textureMatrix;

out vec2 texcoord;

void main () {
  gl_Position = matrix * position;

  texcoord = (textureMatrix * position).xy;
}