import Ant from "./ant";
import Board from "./board";
import type { SimulationError, SimulationRequest, SimulationResponse } from "./simulation-messages";

type SimulationGame = {
    board: Board;
    // ants: Set<Ant>;
    ant: Ant;
    tileTriggers: Array<((ant: Ant) => void) | undefined>;
    onStart: () => void;
    onEachIteration: (ant: Ant, subIteration: number) => void;
};

type WorkerScope = {
    onmessage: ((event: MessageEvent<SimulationRequest>) => void) | null;
    postMessage(message: SimulationResponse, transfer: Transferable[]): void;
};

const workerScope = globalThis as unknown as WorkerScope;
const board = new Board();

// TODO: Not sure if I wanna do multiple ants just yet...
// const ants = new Set<Ant>();
let ant = new Ant({ x: board.width / 2, y: board.height / 2 });

const game: SimulationGame = {
    board,
    ant,
    tileTriggers: [],
    onStart: () => {},
    onEachIteration: () => {}
};

let completedIterations = 0;

function serializeError(error: unknown): SimulationError {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack
        };
    }

    return {
        name: "Error",
        message: String(error)
    };
}

function sendFrame(duration = 0, error?: unknown) {
    const cells = board.cells.buffer as ArrayBuffer;
    const response: SimulationResponse = {
        type: "frame",
        cells,
        duration,
        iterations: completedIterations,
        ...(error === undefined ? {} : { error: serializeError(error) })
    };

    workerScope.postMessage(response, [cells]);
}

function initialise(code: string, tileCount: number) {
    board.clear();
    board.setTileCount(tileCount);
    // ants.clear();
    ant = new Ant({ x: board.width / 2, y: board.height / 2 });
    game.tileTriggers = [];
    game.onStart = () => {};
    game.onEachIteration = () => {};
    completedIterations = 0;

    let error: unknown;

    try {
        // Blockly output is evaluated in the worker so user code can never block
        // the browser's UI thread.
        new Function("game", code)(game);
        game.onStart();
    } catch (caught) {
        error = caught;
    }

    // ants.add(new Ant({ x: board.width / 2, y: board.height / 2 }));
    sendFrame(0, error);
}

function step(iterations: number, snapshot: ArrayBuffer) {
    board.cells =
        snapshot.byteLength === board.width * board.height
            ? new Uint8ClampedArray(snapshot)
            : new Uint8ClampedArray(board.width * board.height);

    const startedAt = performance.now();
    let error: unknown;

    try {
        for (let i = 0; i < iterations; i++) {
            // for (const ant of ants) {
            game.onEachIteration(ant, 0);

            const { x, y } = ant.position;
            const tileTrigger = game.tileTriggers[board.cells[y * board.width + x]];
            tileTrigger?.(ant);
            // }

            completedIterations++;
        }
    } catch (caught) {
        error = caught;
    }

    sendFrame(performance.now() - startedAt, error);
}

workerScope.onmessage = ({ data }) => {
    if (data.type === "init") {
        initialise(data.code, data.tileCount);
        return;
    }

    step(Math.max(0, Math.floor(data.iterations)), data.snapshot);
};
