import type { SvelteSet } from "svelte/reactivity";
import Ant from "./ant";
import type Board from "./board";
import type Renderer from "./render/webgl2.svelte";
import * as Blockly from "blockly";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export const width = $state(800);
export const height = $state(800);

export const tiles: Tile[] = $state([]);

let recorder: MediaRecorder | null = null;
let chunks: Blob[] = [];

let ffmpeg: FFmpeg | null = null;
let recording = false;
let frameCount = 0;
let intervalId: number | null = null;

export type PhotoSave = Save & { src: string };

export type Save = {
    name: string;
    date: Date;
    blockly: Record<string, unknown>;
    tiles: Tile[];
};

export type RGB = [number, number, number];

export type Tile = {
    colour: [number, number, number];
    triggers: string[];
};

// Things that don't
export type Game = {
    board: Board;
    ants: SvelteSet<Ant>;
    tileTriggers: Map<number, (ant: Ant) => void>;
    onStart: () => void;
    onEachIteration: (ant: Ant) => void;
    getState(): GameState;
};

// Things that need to be updated in the UI
export type GameState = {
    updateInProgress: boolean;
    paused: boolean;
    fps: number;
    iterations: number;
    iterationsPerTick: number;
};

export function tick(game: Game, gameState: GameState, renderer: Renderer, iterate: () => void) {
    gameState.updateInProgress = true;

    const pn1 = performance.now();

    try {
        for (let i = 0; i < gameState.iterationsPerTick; i++) {
            iterate();
            gameState.iterations++;
        }
    } catch (e) {
        console.error(e);
        gameState.paused = true;
        alert("Maximum number of ants reached. Please restart the game.");
    }

    // gameState.iterations += gameState.iterationsPerTick;
    renderer.tiles = game.board.cells;

    gameState.updateInProgress = false;

    const time = performance.now() - pn1;

    // 5 seconds timeout
    if (time > 1000) {
        gameState.paused = true;
    }

    return time;
}

export function restartGame(game: Game, gameState: GameState) {
    game.board.clear();
    game.ants.clear();

    gameState.iterations = 0;
    game.onStart();
    game.ants.add(new Ant({ x: game.board.width / 2, y: game.board.height / 2 }));
}

export async function startRecording(renderer: Renderer) {
    console.log("startRecording called");
    if (!ffmpeg) {
        ffmpeg = new FFmpeg();
        ffmpeg.on("log", ({ type, message }) => {
            console.log(`[FFmpeg ${type}]: ${message}`);
        });
        await ffmpeg.load();
        console.log("FFmpeg loaded");
    }
    recording = true;
    frameCount = 0;
    const canvas = renderer.gl.canvas as HTMLCanvasElement;
    console.log("Canvas size:", canvas.width, canvas.height);
    intervalId = setInterval(async () => {
        if (!recording) return;
        try {
            const dataURL = canvas.toDataURL("image/png");
            const response = await fetch(dataURL);
            const blob = await response.blob();
            const fileName = `${frameCount.toString().padStart(9, "0")}.png`;
            await ffmpeg!.writeFile(fileName, await fetchFile(blob));
            console.log(fileName, "written, size:", blob.size);
            frameCount++;
        } catch (e) {
            console.error("Error writing frame:", e);
        }
    }, 1000 / 10);
    // }, 1);
}

export async function stopRecording(format: string, params: string[]) {
    console.log("stopRecording called, frameCount:", frameCount);
    recording = false;
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    if (ffmpeg && frameCount > 0) {
        console.warn(await ffmpeg!.listDir("/"));
        console.log(`Encoding ${frameCount} frames`);
        const ext = format.split("/")[1];
        const filename = `output.${ext}`;
        await ffmpeg!.exec([...params, filename]);
        console.log("Encoding done");
        const data = await ffmpeg!.readFile(filename);
        console.log("File read, size:", data.length);
        const blob = new Blob([data as BlobPart], { type: format });
        return URL.createObjectURL(blob);
    } else {
        throw new Error("No frames recorded or FFmpeg not initialized");
    }
}

export async function downloadVideo(video: string, format: string) {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    a.href = video;
    a.download = `output.${format.split("/")[1]}`;
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

// export function startRecordingOld(renderer: Renderer) {
//     const canvas = renderer.gl.canvas as HTMLCanvasElement;
//     // TODO: Allow different FPS
//     const stream = canvas.captureStream(60);
//     recorder = new MediaRecorder(stream, {
//         // mimeType: "video/webm; codecs=av01.2.",
//         // mimeType: "video/webm; codecs=av01.2.15M.10.0.100.09.16.09.0",
//         // mimeType: "video/webm; codecs=vp09.01.30.08.03.01.01.01.01",
//         // mimeType: 'video/webm; codecs="vp09.01.01.10.05.01.01.00"',
//         // mimeType: 'video/webm; codecs="av01.1.08M.08.0.000.01.01.01.1"',
//         // mimeType: 'video/webm; codecs="av01.0.08M.08.0.000.01.01.01.1"',
//         mimeType: 'video/webm; codecs="vp09.01.41.08.01.01.01.01.00"',
//         videoBitsPerSecond: 250000000 // 100 Mbps Effectively lossless
//     });
//     recorder.ondataavailable = (e) => {
//         if (e.data.size > 0) {
//             chunks.push(e.data);
//         }
//     };
//     recorder.onstop = () => {
//         const blob = new Blob(chunks, { type: "video/webm" });
//         chunks = [];
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         document.body.appendChild(a);
//         a.style.display = "none";
//         a.href = url;
//         a.download = "animation.webm";
//         a.click();
//         console.log(url);
//         window.URL.revokeObjectURL(url);
//     };

//     recorder.start();
// }
// export function stopRecordingOld() {
//     console.log("stopping...");

//     if (recorder) {
//         recorder.stop();
//     }
// }

export function loadSnapshot(
    game: Game,
    gameState: GameState,
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
    restartGame(game, gameState);
}
