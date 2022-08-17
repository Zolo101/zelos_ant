class Tile {
    // name: string
    // colour: string
    colour: [number, number, number]
    // TODO: remove triggers
    triggers: string[]

    // constructor(name: string, colour: Tile["colour"], triggers: string[]) {
    constructor(colour: Tile["colour"], triggers: string[]) {
        // this.name = name
        this.colour = colour
        this.triggers = triggers
    }
}

export default Tile;
