#version 300 es
precision highp float;
precision highp int;

uniform sampler2D tiles;
uniform sampler2D colours;

in vec2 texcoord;
out vec4 outColour;

void main() {
    float cell = texture(tiles, texcoord).r * 255.0;
    outColour = texelFetch(colours, ivec2(cell, 0), 0);
}