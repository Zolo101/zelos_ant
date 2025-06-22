import Board from "./board";
import Tile from "./tile";
import Ant from "./ant";
import * as Blockly from "blockly";
import Save from "./save";
import { addSave } from "./db";
import { clear, colours, height, importTiles, tiles, width } from "./stores.svelte";
import type Renderer from "./render/webgl2";

// export let iterations = $state(0);

// Singleton
export default class Game {
    static board = new Board(width, height);
    static tileTriggers = new Map<number, (ant: Ant) => void>();
    static onEachIteration: (ant: Ant) => void = () => {};

    alertText = $state("");
    static oldTiles: [number, number][] = [];
    updateInProgress = $state(false);
    // static fpsHistory: number[] = [];
    fps = $state(0);

    paused = $state(false);
    iterationsPerTick = $state(100);
    iterations = $state(0);

    private static _instance: Game;
    static get instance() {
        if (!Game._instance) {
            Game._instance = new Game();
        }
        return Game._instance;
    }

    static restart() {
        Game.board.clear();
        this.instance.iterations = 0;
        Game.board.addAnt(Game.board.width / 2, Game.board.height / 2);
    }

    static clear() {
        Game.board.clear();
        clear();
    }

    static takePicture(renderer: Renderer, canvas: HTMLCanvasElement) {
        renderer.render();
        return canvas.toDataURL();
    }

    static saveSnapshot(
        renderer: Renderer,
        workspace: Blockly.WorkspaceSvg,
        canvas: HTMLCanvasElement
    ) {
        // save the current state of everything
        let name = prompt("Name your save")?.trim();
        if (!name) name = "Untitled Save";

        const save = new Save(
            name,
            Blockly.serialization.workspaces.save(workspace),
            Array.from(tiles),
            Game.takePicture(renderer, canvas)
        );
        addSave(save).then(() => (Game.instance.alertText = "Rules saved!"));
    }

    static loadSnapshot(save: Save, renderer: Renderer, workspace: Blockly.WorkspaceSvg) {
        importTiles(save.tile);
        // tiles = save.tile;
        // colours = save.tile.map((t) => t.colour);
        Blockly.serialization.workspaces.load(save.blockly, workspace);
        renderer.updateColours();
        this.restart();
        // window.dispatchEvent(updateTileEvent);
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

    static tick(renderer: Renderer, iterate: () => void) {
        Game.instance.updateInProgress = true;
        const pn1 = performance.now();
        // console.log(Game.instance.iterationsPerTick);

        for (let i = 0; i < Game.instance.iterationsPerTick; i++) iterate();
        Game.instance.iterations += Game.instance.iterationsPerTick;
        renderer.tiles = Game.board.cells;

        // Game.pushHistory(performance.now() - pn1);
        Game.instance.fps = performance.now() - pn1;

        Game.instance.updateInProgress = false;
    }

    // static pushHistory(time: number) {
    //     Game.fpsHistory.push(time);

    //     if (Game.fpsHistory.length > 60) Game.fpsHistory.shift();
    // }

    static addTile(renderer: Renderer, color: Tile["colour"], triggers: Tile["triggers"]) {
        const newTile = new Tile(color, triggers);
        tiles.add(newTile);
        colours.add(newTile.colour);
        renderer.updateColours();

        return newTile;
    }
}
