import Board from "./board";
import type Renderer from "./render/webgl2.svelte";
import type { SimulationRequest, SimulationResponse } from "./simulation-messages";
import sync from "./sync.svelte";

export default class Game {
    board = new Board();
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
        reduceMotion: false
    });

    private worker: Worker | null = null;
    private code = "";
    private tileCount = 1;
    private workerReady = false;

    // stolen from everything market (upcoming game im making... sshhhh)
    // https://github.com/sveltejs/svelte/issues/9547
    // https://github.com/sveltejs/svelte/issues/14804 we wait
    static instance: Game;

    constructor() {
        Game.instance = this;
    }

    setProgram(code: string, tileCount: number, renderer: Renderer | null) {
        this.code = code;
        this.tileCount = Math.max(1, tileCount);

        if (renderer) this.restart(renderer);
    }

    requestStep(iterations: number) {
        if (
            !this.worker ||
            !this.workerReady ||
            this.gameState.updateInProgress ||
            this.board.cells.byteLength === 0
        ) {
            return false;
        }

        const snapshot = this.board.cells.buffer as ArrayBuffer;
        const message: SimulationRequest = {
            type: "step",
            iterations,
            snapshot
        };

        this.workerReady = false;
        this.gameState.updateInProgress = true;

        try {
            this.worker.postMessage(message, [snapshot]);
            return true;
        } catch (error) {
            this.workerReady = true;
            this.gameState.updateInProgress = false;
            console.error("Failed to send a simulation step to the worker", error);
            return false;
        }
    }

    restart(renderer: Renderer, tileCount = this.tileCount) {
        this.dispose();
        this.tileCount = Math.max(1, tileCount);
        this.gameState.updateInProgress = true;
        this.gameState.paused = false;
        this.gameState.fps = 0;
        this.gameState.iterations = 0;

        // A running step may have transferred the previous snapshot. Give the
        // renderer an owned, cleared buffer immediately while the new worker boots.
        this.board.cells = new Uint8ClampedArray(this.board.width * this.board.height);
        renderer.tiles = this.board.cells;

        if (typeof Worker === "undefined") {
            this.gameState.updateInProgress = false;
            return;
        }

        // Vite only recognises this exact URL constructor form when bundling a worker.
        // eslint-disable-next-line svelte/prefer-svelte-reactivity
        const worker = new Worker(new URL("./simulation.worker.ts", import.meta.url), {
            type: "module"
        });
        this.worker = worker;

        worker.onmessage = ({ data }: MessageEvent<SimulationResponse>) => {
            if (this.worker !== worker) return;

            this.board.cells = new Uint8ClampedArray(data.cells);
            renderer.tiles = this.board.cells;
            this.gameState.fps = data.duration;
            this.gameState.iterations = data.iterations;
            this.gameState.updateInProgress = false;
            this.workerReady = !data.error;

            if (data.error) {
                this.gameState.paused = true;
                const error = new Error(data.error.message);
                error.name = data.error.name;
                if (data.error.stack) error.stack = data.error.stack;
                console.error(error);
            }
        };

        worker.onerror = (event) => {
            if (this.worker !== worker) return;

            this.workerReady = false;
            this.gameState.updateInProgress = false;
            this.gameState.paused = true;
            console.error("Simulation worker error", event.error ?? event.message);
        };

        const message: SimulationRequest = {
            type: "init",
            code: this.code,
            tileCount: this.tileCount
        };
        worker.postMessage(message);
    }

    dispose() {
        this.worker?.terminate();
        this.worker = null;
        this.workerReady = false;
        this.gameState.updateInProgress = false;
    }

    static restart(renderer: Renderer, tileCount?: number) {
        Game.instance.restart(renderer, tileCount);
    }
}
