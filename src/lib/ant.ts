// import { moveForward_wasm } from "./assembly/wasm/release";

import type Board from "./board";
import { height, width } from "./stores.svelte";

enum AntRotation {
    North = 0,
    East = 1,
    South = 2,
    West = 3
}

type Point = {
    x: number;
    y: number;
};

class Ant {
    position: Point;
    rotation: AntRotation;
    board: Board;
    // occupying: Tile

    constructor(
        board: Board,
        position: Point = { x: 0, y: 0 },
        rotation: AntRotation = AntRotation.North
    ) {
        this.board = board;
        this.position = position;
        this.rotation = rotation;

        // const tileId = this.board.getCell(position.x, position.y)
        // this.occupying = game.tiles.get(tileId)! // <-- errors when out of bounds
    }

    turnLeft() {
        this.rotation = (this.rotation + 1) & 3;
    }

    turnRight() {
        this.rotation = (this.rotation - 1) & 3;
    }

    turnBack() {
        this.turnLeft();
        this.turnLeft();
    }

    moveForward(magnitude: number = 1) {
        switch (this.rotation) {
            case AntRotation.North:
                return this.moveBy(0, -magnitude);
            case AntRotation.East:
                return this.moveBy(magnitude, 0);
            case AntRotation.South:
                return this.moveBy(0, magnitude);
            case AntRotation.West:
                return this.moveBy(-magnitude, 0);
        }
    }

    moveBy(x: number, y: number) {
        this.position.x += x;
        this.position.y += y;

        // -1 @ 0  == 799
        // -2 @ 0  == 798

        // 1 @ 799 == 0
        // 2 @ 799 == 1

        if (this.position.x < 0) this.position.x += width;
        if (this.position.x >= width) this.position.x -= width;

        if (this.position.y < 0) this.position.y += height;
        if (this.position.y >= height) this.position.y -= height;
    }

    incrementCell(by: number = 1) {
        this.board.incrementCell(this.position.x, this.position.y, by);
    }
}

export default Ant;
