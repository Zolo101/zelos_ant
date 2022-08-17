import Tile from "./tile";

class Save {
    id?: number
    name: string
    date: Date
    blockly: {}
    // TODO: Rename as tiles
    tile: Tile[]
    // TODO: Compress in the future (images are currently 2.56MB)
    image: Uint8ClampedArray

    constructor(name: string, blockly: {}, tile: Tile[], image: Uint8ClampedArray) {
        this.name = name
        this.date = new Date()
        this.blockly = blockly;
        this.tile = tile;
        this.image = image;
    }
}

export default Save;