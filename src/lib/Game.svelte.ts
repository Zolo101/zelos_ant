import { SvelteMap, SvelteSet } from "svelte/reactivity";
import Ant from "./ant";
import Board from "./board";

export default class Game {
    board = new Board();
    ants = new SvelteSet<Ant>();
    // TODO: Switched to SvelteMap, is this a good idea?
    tileTriggers = new SvelteMap<number, (ant: Ant) => void>();
    onStart = () => {};
    onEachIteration = (ant: Ant) => {};
    gameState = $state({
        updateInProgress: false,
        paused: false,
        fps: 0,
        iterations: 0,
        iterationsPerTick: 1
    });

    showSaves = $state(false);
    showAbout = $state(false);

    // stolen from everything market (upcoming game im making... sshhhh)
    // https://github.com/sveltejs/svelte/issues/9547
    // https://github.com/sveltejs/svelte/issues/14804 we wait
    static instance: Game;

    constructor() {
        Game.instance = this;
    }

    // TODO: Should this be static?
    static restart() {
        const game = Game.instance;
        game.board.clear();
        game.ants.clear();

        game.gameState.iterations = 0;
        game.onStart();
        game.ants.add(new Ant({ x: game.board.width / 2, y: game.board.height / 2 }));
    }
}
