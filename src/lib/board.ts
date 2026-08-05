import type Ant from "./ant";

export const BOARD_WIDTH = 640;
export const BOARD_HEIGHT = 640;

export default class Board {
    // width: number;
    // height: number;
    width = BOARD_WIDTH;
    height = BOARD_HEIGHT;
    tileCount = 1;
    cells: Uint8ClampedArray;
    image: Uint8ClampedArray;

    // constructor(width: number, height: number) {
    constructor() {
        // this.width = width;
        // this.height = height;
        this.cells = new Uint8ClampedArray(this.width * this.height);
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

    setTileCount(tileCount: number) {
        this.tileCount = Math.max(1, tileCount);
    }

    incrementCell(ant: Ant, by: number = 1) {
        const id = this.getCell(ant.position.x, ant.position.y);
        this.setCell(ant.position.x, ant.position.y, (id + by) % this.tileCount);
    }

    // output() {
    // console.log(Game.colours, this.cells)
    // web workers are too slow before of postMessage
    // (aged like milk) ^^
    // cellsToImage is webassembly version (5.5ms)
    // vanillaJs seems to be faster right now (3.3ms)
    // webgl2 + vanillaJs (2.4ms)
    // webgl2 + GPU (0.001ms)
    // return cellsToImage(Game.colours, this.image, this.cells);
    // return cellsToImage_vanillajs(Game.colours, this.image, this.cells);
    // }
}
