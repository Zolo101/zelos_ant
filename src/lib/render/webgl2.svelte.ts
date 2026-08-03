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
// import "webgl-lint";
import vertexShader from "./vertex.glsl?raw";
import fragmentShader from "./fragment.glsl?raw";
import { height, tiles, width, type RGB } from "../stores.svelte";

const colours: RGB[] = $derived(tiles.map((t) => t.colour));

export default class Renderer {
    gl: WebGL2RenderingContext;
    programInfo: ProgramInfo;
    tileTexture: WebGLTexture;
    colours: WebGLTexture;
    private tileData: Uint8ClampedArray;
    private tilesDirty = true;
    bufferInfo: BufferInfo;

    get tiles() {
        return this.tileData;
    }

    set tiles(tiles: Uint8ClampedArray) {
        this.tileData = tiles;
        this.tilesDirty = true;
    }

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        const program = createProgram(gl, [vertexShader, fragmentShader]);
        this.programInfo = createProgramInfoFromProgram(gl, program);
        this.tileData = new Uint8ClampedArray(width * height);
        this.bufferInfo = primitives.createXYQuadBufferInfo(gl);

        this.tileTexture = createTexture(gl, {
            mag: gl.NEAREST,
            min: gl.NEAREST,
            internalFormat: gl.R8,
            src: this.tileData
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

        if (this.tilesDirty) {
            // Storage was allocated when the texture was created. Updating it in
            // place avoids making TWGL re-specify the texture every frame.
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.tileTexture);
            this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
            this.gl.texSubImage2D(
                this.gl.TEXTURE_2D,
                0,
                0,
                0,
                width,
                height,
                this.gl.RED,
                this.gl.UNSIGNED_BYTE,
                this.tileData
            );
            this.tilesDirty = false;
        }
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
