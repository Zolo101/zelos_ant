import type Ant from "./ant";
import type Board from "./board";
import type Renderer from "./render/webgl2.svelte";
import * as Blockly from "blockly";

export const width = $state(800);
export const height = $state(800);

export const tiles: Tile[] = $state([]);

export const getColours = () => tiles.map((t) => t.colour);

export type PhotoSave = Save & { src: string };

export type Save = {
    name: string;
    date: Date;
    blockly: Record<string, unknown>;
    tiles: Tile[];
};

export type Tile = {
    colour: [number, number, number];
    triggers: string[];
};

export type Game = {
    board: Board;
    tileTriggers: Map<number, (ant: Ant) => void>;
    onEachIteration: (ant: Ant) => void;
    alertText: string;
    oldTiles: [number, number][];
    updateInProgress: boolean;
    paused: boolean;
    fps: number;
    iterations: number;
    iterationsPerTick: number;
};

export function tick(game: Game, renderer: Renderer, iterate: () => void) {
    game.updateInProgress = true;
    const pn1 = performance.now();

    for (let i = 0; i < game.iterationsPerTick; i++) iterate();
    game.iterations += game.iterationsPerTick;
    renderer.tiles = game.board.cells;

    game.updateInProgress = false;
    return performance.now() - pn1;
}

export function restartGame(game: Game) {
    game.board.clear();
    game.iterations = 0;
    game.board.addAnt(game.board.width / 2, game.board.height / 2);
}

export function loadSnapshot(
    game: Game,
    save: Save,
    renderer: Renderer,
    workspace: Blockly.WorkspaceSvg
) {
    // clear and import tiles
    tiles.length = 0;
    save.tiles.forEach((tile) => {
        tiles.push(tile);
    });

    Blockly.serialization.workspaces.load(save.blockly, workspace);
    renderer.updateColours();
    restartGame(game);
}
