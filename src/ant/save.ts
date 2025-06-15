import Tile from "./tile";

class Save {
    id?: number;
    name: string;
    date: Date;
    blockly: {};
    // TODO: Rename as tiles
    tile: Tile[];
    // TODO: Compress in the future (images are currently 2.56MB)
    src: string;

    constructor(name: string, blockly: {}, tile: Tile[], src: string) {
        this.name = name;
        this.date = new Date();
        this.blockly = blockly;
        this.tile = tile;
        this.src = src;
    }
}

export default Save;
