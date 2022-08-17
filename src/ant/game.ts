import Board from "./board";
import Tile from "./tile";
import { writable } from "svelte/store";
import { createImage, ctx, iterate, updateTileEvent, workspace } from "./index";
import Ant from "./ant";
import Blockly from "blockly";
import Save from "./save";
import { addSave } from "./db";

class Game {
    static board = new Board(800, 800)
    static tiles: Tile[] = []
    // TODO: Necessary?
    static colours: Tile["colour"][] = []
    static tileTriggers = new Map<number, (ant: Ant) => void>()
    static onEachIteration: (ant: Ant) => void = () => {}

    static alertText = writable("")
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

    static saveSnapshot() {
        // save the current state of everything
        let name = prompt("Name your save")?.trim()
        if (!name) name = "Untitled Save"
        const save = new Save(name, Blockly.serialization.workspaces.save(workspace), Game.tiles, Game.board.output())
        addSave(save).then(() => Game.alertText.set("Rules saved!"))
    }

    static loadSnapshot(save: Save) {
        Game.tiles = save.tile
        Game.colours = save.tile.map(t => t.colour)
        Blockly.serialization.workspaces.load(save.blockly, workspace)
        this.restart()
        window.dispatchEvent(updateTileEvent)
    }

    /*
    static saveToLocalStorage() {
        localStorage.setItem("saveState", JSON.stringify(Game.saves))
    }

    static loadFromLocalStorage() {
        const potentialSaveState = localStorage.getItem("saveState")
        if (potentialSaveState !== null) {
            const saveState = JSON.parse(potentialSaveState)
            Game.saves = saveState
            // Blockly.serialization.workspaces.load(saveState, workspace)
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
    */

    static tick() {
        Game.updateInProgress = true;
        let pn1 = performance.now();

        for (let i = 0; i < Game.iterationsPerTick; i++) iterate()
        Game.iterations += Game.iterationsPerTick
        createImage(ctx, Game.board.output(), Game.board.width, Game.board.height)

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