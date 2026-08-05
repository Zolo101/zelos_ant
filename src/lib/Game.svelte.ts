import Ant from "./ant";
import Board from "./board";
import type Renderer from "./render/webgl2.svelte";
import sync from "./sync.svelte";

class UserCodeTimeoutError extends Error {
    constructor() {
        super("The program ran for longer than 1 second and was stopped.");
        this.name = "UserCodeTimeoutError";
    }
}

export default class Game {
    board = new Board();
    // TODO: SvelteSet and SvelteMap hurts performance
    ants = new Set<Ant>();
    // TODO: Compile this into a list
    // tileTriggers = new Map<number, (ant: Ant) => void>();
    tileTriggers: Array<(ant: Ant) => void> = [];
    onStart = () => {};

    /**
     *
     * @param ant The ant to run the iteration on
     * @param subIter Ticks are done on N iterations/steps. game.gameState.iterations only increments every tick, not step.
     */
    onEachIteration = (ant: Ant, subIter: number) => {};
    gameState = $state({
        updateInProgress: false,
        paused: false,
        fps: 0,
        iterations: 0,
        iterationsPerTick: 1
    });

    showSaves = $state(false);
    showSettings = $state(false);
    showAbout = $state(false);

    settings = sync("settings", {
        advancedMode: false,
        loop: true,
        noTimeout: false,
        reduceMotion: false
    });

    // TODO: Won't be needed when we move to web workers
    private userCodeDeadline = Infinity;

    checkUserCodeDeadline = () => {
        if (performance.now() >= this.userCodeDeadline) {
            throw new UserCodeTimeoutError();
        }
    };

    runUserCode<Args extends unknown[]>(callback: (...args: Args) => void, ...args: Args): boolean {
        if (!this.settings.noTimeout) {
            this.userCodeDeadline = performance.now() + 1000;
        }

        try {
            callback(...args);
            return true;
        } catch (error) {
            this.gameState.paused = true;
            console.error(error);
            return false;
        } finally {
            this.userCodeDeadline = Infinity;
        }
    }

    // stolen from everything market (upcoming game im making... sshhhh)
    // https://github.com/sveltejs/svelte/issues/9547
    // https://github.com/sveltejs/svelte/issues/14804 we wait
    static instance: Game;

    constructor() {
        Game.instance = this;
    }

    // TODO: Should this be static?
    static restart(renderer: Renderer) {
        const game = Game.instance;
        game.board.clear();
        game.ants.clear();

        game.gameState.iterations = 0;
        game.runUserCode(game.onStart);
        game.ants.add(new Ant({ x: game.board.width / 2, y: game.board.height / 2 }));

        // TODO: Make a function for refreshing the screen or something
        // refresh screen
        renderer.tiles = game.board.cells;
    }
}
