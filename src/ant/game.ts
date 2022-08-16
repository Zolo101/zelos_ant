import Board from "./board";
import Tile from "./tile";
import { writable } from "svelte/store";
import { createImage, ctx, iterate, workspace } from "./index";
import Ant from "./ant";
import Blockly from "blockly";

class Game {
    static board = new Board(800, 800)
    static tiles: Tile[] = []
    static colours: Tile["colour"][] = []
    static tileTriggers = new Map<number, (ant: Ant) => void>()
    static onEachIteration: (ant: Ant) => void = () => {}

    static oldTiles: [number, number][] = []
    static updateInProgress: boolean = false
    static fps = writable(0)


    static paused: boolean = false
    static iterationsPerTick: number = 100
    static iterations = 0

    static restart() {
        Game.board.clear()
        Game.iterations = 0
        Game.board.addAnt(Game.board.width / 2, Game.board.height / 2);
    }

    static clear() {
        Game.board.clear()
        Game.tiles = []
    }

    static save() {
        const binary = JSON.stringify(Blockly.serialization.workspaces.save(workspace))
        localStorage.setItem("saveState", binary)
        alert("Rules saved!")
    }

    static load() {
        const potentialSaveState = localStorage.getItem("saveState")
        if (potentialSaveState !== null) {
            const saveState = JSON.parse(potentialSaveState)
            Blockly.serialization.workspaces.load(saveState, workspace)
        }
    }

    // TODO: exports
    static export() {
        // const file = JSON.stringify(Blockly.serialization.workspaces.save(workspace))
        // save to file (json)
        // const blob = new Blob([file], { type: "application/json" })
        // const url = URL.createObjectURL(blob)
    }

    // TODO: imports
    static import() {

    }

    static tick() {
        Game.updateInProgress = true;
        let pn1 = performance.now();

        for (let i = 0; i < Game.iterationsPerTick; i++) iterate()
        Game.iterations += Game.iterationsPerTick
        createImage(ctx)

        Game.fps.set(performance.now() - pn1);
        Game.updateInProgress = false;
    }

    static addTile(color: Tile["colour"], triggers: Tile["triggers"]) {
        const newTile = new Tile(color, triggers)
        Game.tiles.push(newTile)
        Game.colours.push(newTile.colour)

        return newTile
    }
}

export default Game;