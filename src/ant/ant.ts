import Game from "./Game.svelte";

// import { moveForward_wasm } from "./assembly/wasm/release";

enum AntRotation {
    North = 0,
    East = 1,
    South = 2,
    West = 3
}

class Ant {
    position: Point;
    rotation: AntRotation;
    // occupying: Tile

    constructor(position: Point = { x: 0, y: 0 }, rotation: AntRotation = AntRotation.North) {
        this.position = position;
        this.rotation = rotation;

        // const tileId = this.board.getCell(position.x, position.y)
        // this.occupying = game.tiles.get(tileId)! // <-- errors when out of bounds
    }

    turnLeft() {
        this.rotation = (this.rotation - 1) & 3;
    }

    turnRight() {
        this.rotation = (this.rotation + 1) & 3;
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

        if (this.position.x < 0) this.position.x += Game.board.width;
        if (this.position.x >= Game.board.width) this.position.x -= Game.board.width;

        if (this.position.y < 0) this.position.y += Game.board.width;
        if (this.position.y >= Game.board.height) this.position.y -= Game.board.width;
    }
}

export default Ant;
