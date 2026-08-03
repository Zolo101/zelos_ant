import { BOARD_HEIGHT, BOARD_WIDTH } from "./board";

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
    // occupying: Tile

    constructor(position: Point = { x: 0, y: 0 }, rotation: AntRotation = AntRotation.North) {
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

        if (this.position.x < 0) this.position.x += BOARD_WIDTH;
        if (this.position.x >= BOARD_WIDTH) this.position.x -= BOARD_WIDTH;

        if (this.position.y < 0) this.position.y += BOARD_HEIGHT;
        if (this.position.y >= BOARD_HEIGHT) this.position.y -= BOARD_HEIGHT;
    }
}

export default Ant;
