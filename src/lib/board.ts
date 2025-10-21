import Ant from "./ant";
import { tiles } from "./stores.svelte";

// import { cellsToImage } from "./assembly/wasm/release";

export default class Board {
    width: number;
    height: number;
    cells: Uint8ClampedArray;
    image: Uint8ClampedArray;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.cells = new Uint8ClampedArray(width * height);
        this.image = new Uint8ClampedArray(3 * this.width * this.height);
        this.clear();
    }

    clear() {
        this.cells.fill(0);
    }

    getCell(x: number, y: number) {
        return this.cells[y * this.width + x];
    }

    setCell(x: number, y: number, value: number) {
        this.cells[y * this.width + x] = value;
    }

    incrementCell(ant: Ant, by: number = 1) {
        const id = this.getCell(ant.position.x, ant.position.y);
        this.setCell(ant.position.x, ant.position.y, (id + by) % tiles.length);
    }

    // output() {
    // console.log(Game.colours, this.cells)
    // web workers are too slow before of postMessage
    // cellsToImage is webassembly version (5.5ms)
    // vanillaJs seems to be faster right now (3.3ms)
    // webgl2 + vanillaJs (2.4ms)
    // webgl2 + GPU (0.001ms)
    // return cellsToImage(Game.colours, this.image, this.cells);
    // return cellsToImage_vanillajs(Game.colours, this.image, this.cells);
    // }
}
