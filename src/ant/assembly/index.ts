// The entry file of your WebAssembly module.

// export function cellsToImage(map: Map<i32, i32[]>, image: Uint8ClampedArray, cell: i32[][]): i32 {
// export function cellsToImage(colours: StaticArray<StaticArray<i32>>, image: Uint8ClampedArray, cell: StaticArray<StaticArray<i32>>): i32 {

export function cellsToImage(colours: StaticArray<StaticArray<i32>>, image: Uint8ClampedArray, cell: StaticArray<i32>): Uint8ClampedArray {

    for (let i = 0; i < image.length; i += 4) { // watch out for the i += 4
        const currentCell: i32 = unchecked(cell[i / 4]);
        const tile: StaticArray<i32> = unchecked(colours[currentCell]);
        unchecked(image[i] = tile[0]);
        unchecked(image[i + 1] = tile[1]);
        unchecked(image[i + 2] = tile[2]);
        unchecked(image[i + 3] = 255);
    }

    return image;
}

export function moveForward_wasm(rotation: i32, magnitude: i32): i32[] {
    let b1: bool = !!(rotation % 2)  // is even
    let b2: bool = !!(rotation >> 1) // second binary digit
    let c03 = -((rotation + 1) % 3) % 2 // (0 1 2 3) -> (1 2 0 1) -> (-1 0 0 -1)
    c03 = 2 * c03 + 1;

    let p1 = c03 * magnitude * +((b1 && !b2) || (b1 && b2))
    let p2 = c03 * magnitude * +(!p1)

    return [p1, p2]
}

export function turnLeft_wasm(rotation: u8): u8 {
    return (rotation - 1) & 3
}

export function turnRight_wasm(rotation: u8): u8 {
    return (rotation + 1) & 3
}

// export function iterate_wasm(gamex: Game, board: Board): void {
//     for (let i = 0; i < board.ants.length; i++) {
//         const ant = board.ants[i];
//
//         // Move
//         const oldPos = ant.position
//         gamex.onEachIteration(ant)
//
//         const cell = board.getCell(ant.position.x, ant.position.y)
//         const func = game_wasm.tileTriggers.get(cell);
//         if (func) func(ant);
//
//         board.incrementCell(oldPos.x, oldPos.y)
//     }
// }
