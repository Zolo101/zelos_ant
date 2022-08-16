import Ant from "./ant";
import Game from "./game";

// import { cellsToImage } from "./assembly/wasm/release";

class Board {
    width: number
    height: number
    cells: number[]
    image: Uint8ClampedArray
    ants: Ant[]

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.cells = []
        this.image = new Uint8ClampedArray(4 * this.width * this.height)
        this.ants = []
        this.clear()
    }

    clear() {
        this.cells = new Array(this.width * this.height).fill(0)
        this.ants = []
    }

    getCell(x: number, y: number) {
        return this.cells[y * this.width + x]
    }

    setCell(x: number, y: number, value: number) {
        this.cells[y * this.width + x] = value
    }

    incrementCell(x: number, y: number) {
        const id = this.getCell(x, y)
        // id = (id + 1) & (Game.tiles.length - 1)
        this.setCell(x, y, (id < Game.tiles.length - 1) ? id + 1 : 0)
        // console.log(id, game.tiles.size, id < game.tiles.size - 1)

        return
    }

    addAnt(x: number, y: number) {
        this.ants.push(new Ant({ x, y }))
    }

    output() {
        // console.log(Game.colours, this.cells)

        // cellsToImage is webassembly version (5.5ms)
        // vanillaJs seems to be faster right now (3.3ms)
        // web workers are too slow before of postMessage

        // return cellsToImage(Game.colours, this.image, this.cells);
        return cellsToImage_vanillajs(Game.colours, this.image, this.cells);
    }
}

export function cellsToImage_vanillajs(colours: number[][], image: Uint8ClampedArray, cell: number[]): Uint8ClampedArray {
    for (let i = 0; i < image.length; i += 4) { // watch out for the i += 4
        const currentCell = cell[i / 4];
        const tile = colours[currentCell];
        image[i] = tile[0];
        image[i + 1] = tile[1];
        image[i + 2] = tile[2];
        image[i + 3] = 255;
    }

    return image;
}

export default Board;