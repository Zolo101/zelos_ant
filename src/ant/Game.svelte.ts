import Board from "./board";
import Ant from "./ant";
import * as Blockly from "blockly";
import {
    clear,
    height,
    importTiles,
    tiles,
    width,
    type PhotoSave,
    type Save,
    type Tile
} from "./stores.svelte";
import type Renderer from "./render/webgl2.svelte";

// Singleton
export default class Game {
    static board = new Board(width, height);
    static tileTriggers = new Map<number, (ant: Ant) => void>();
    static onEachIteration: (ant: Ant) => void = () => {};

    alertText = $state("");
    static oldTiles: [number, number][] = [];
    updateInProgress = $state(false);

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
        saves: PhotoSave[],
        renderer: Renderer,
        workspace: Blockly.WorkspaceSvg,
        canvas: HTMLCanvasElement
    ) {
        const name = prompt("Name your save")?.trim();
        if (name) {
            saves.push({
                name,
                date: new Date(),
                blockly: Blockly.serialization.workspaces.save(workspace),
                tiles: Array.from(tiles),
                src: Game.takePicture(renderer, canvas)
            });
        }
    }

    static loadSnapshot(save: Save, renderer: Renderer, workspace: Blockly.WorkspaceSvg) {
        importTiles(save.tiles);
        Blockly.serialization.workspaces.load(save.blockly, workspace);
        renderer.updateColours();
        this.restart();
    }

    static tick(renderer: Renderer, iterate: () => void) {
        Game.instance.updateInProgress = true;
        const pn1 = performance.now();

        for (let i = 0; i < Game.instance.iterationsPerTick; i++) iterate();
        Game.instance.iterations += Game.instance.iterationsPerTick;
        renderer.tiles = Game.board.cells;

        Game.instance.updateInProgress = false;
        return performance.now() - pn1;
    }

    static addTile(renderer: Renderer, color: Tile["colour"], triggers: Tile["triggers"]) {
        const newTile = {
            colour: color,
            triggers: triggers
        };
        tiles.push(newTile);
        renderer.updateColours();

        return newTile;
    }
}
