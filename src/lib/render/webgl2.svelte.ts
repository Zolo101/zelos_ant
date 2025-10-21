import {
    createProgram,
    createProgramInfoFromProgram,
    createTexture,
    drawBufferInfo,
    m4,
    primitives,
    setBuffersAndAttributes,
    setTextureFromArray,
    setUniforms,
    type BufferInfo,
    type ProgramInfo
} from "twgl.js";
import "webgl-lint";
import vertexShader from "./vertex.glsl?raw";
import fragmentShader from "./fragment.glsl?raw";
import { height, tiles, width, type RGB } from "../stores.svelte";

const colours: RGB[] = $derived(tiles.map((t) => t.colour));

export default class Renderer {
    gl: WebGL2RenderingContext;
    programInfo: ProgramInfo;
    tileTexture: WebGLTexture;
    colours: WebGLTexture;
    tiles: Uint8ClampedArray;
    bufferInfo: BufferInfo;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        const program = createProgram(gl, [vertexShader, fragmentShader]);
        this.programInfo = createProgramInfoFromProgram(gl, program);
        this.tiles = new Uint8ClampedArray(width * height);
        this.bufferInfo = primitives.createXYQuadBufferInfo(gl);

        this.tileTexture = createTexture(gl, {
            mag: gl.NEAREST,
            min: gl.NEAREST,
            internalFormat: gl.R8,
            src: this.tiles
        });

        this.colours = createTexture(gl, {
            mag: gl.NEAREST,
            min: gl.NEAREST,
            format: gl.RGB,
            // TODO: Set limit for colours (1024)
            src: new Uint8ClampedArray(3 * 1024), // support 1024 colours
            width: 1024,
            height: 1
        });

        requestAnimationFrame(() => this.render());
    }

    updateColours() {
        const texture = new Uint8ClampedArray(3 * 1024);

        texture.set(colours.flat(), 0);
        setTextureFromArray(this.gl, this.colours, texture, {
            format: this.gl.RGB,
            width: 1024,
            height: 1
        });
    }

    render() {
        const [matrix, textureMatrix] = [m4.identity(), m4.identity()];

        setTextureFromArray(this.gl, this.tileTexture, this.tiles, {
            internalFormat: this.gl.R8
        });
        const uniforms = {
            matrix,
            textureMatrix,
            tiles: this.tileTexture,
            colours: this.colours
        };

        // these convert from pixels to clip space
        m4.ortho(0, width, height, 0, -1, 1, matrix);

        // these move and scale the unit quad into the size we want
        // in the target as pixels
        m4.translate(matrix, [0, 0, 0], matrix);
        m4.scale(matrix, [width, height, 1], matrix);

        this.gl.useProgram(this.programInfo.program);
        setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
        setUniforms(this.programInfo, uniforms);
        drawBufferInfo(this.gl, this.bufferInfo);
    }
}
