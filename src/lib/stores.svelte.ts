// import type { SvelteSet } from "svelte/reactivity";
// import Ant from "./ant";
// import type Board from "./board";
import type Renderer from "./render/webgl2.svelte";
// import { FFmpeg } from "@ffmpeg/ffmpeg";
// import { fetchFile } from "@ffmpeg/util";
import { serialization, type WorkspaceSvg } from "blockly";
import {
    BufferTarget,
    CanvasSource,
    MkvOutputFormat,
    Output,
    QUALITY_HIGH
    // QUALITY_MEDIUM,
    // QUALITY_VERY_HIGH,
    // QUALITY_VERY_LOW
} from "mediabunny";
import Game from "./Game.svelte";
import { BOARD_HEIGHT, BOARD_WIDTH } from "./board";

export const width = $state(BOARD_WIDTH);
export const height = $state(BOARD_HEIGHT);

export const tiles: Tile[] = $state([]);

export let canvasSource: CanvasSource | null = null;
export const recordingOptions = {
    lossless: false,
    yuv444: false
};

let frameCount = 0;

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

let output: Output<MkvOutputFormat, BufferTarget> | null = null;
let recordingWriteQueue: Promise<void> = Promise.resolve();

export function tick(game: Game, renderer: Renderer, iterate: (iterations: number) => void) {
    game.gameState.updateInProgress = true;

    const pn1 = performance.now();
    const iterations = game.gameState.iterationsPerTick;

    try {
        iterate(iterations);
        // Keep the counter reactive for the UI, but only notify Svelte once per
        // frame rather than once per simulated step.
        game.gameState.iterations += iterations;
    } catch (e) {
        console.error(e);
        game.gameState.paused = true;
        alert("An error has occurred. Please restart the game.");
    }

    renderer.tiles = game.board.cells;

    game.gameState.updateInProgress = false;

    const time = performance.now() - pn1;

    if (canvasSource && output && output.state === "started") {
        const source = canvasSource;
        const timestamp = frameCount / 60;
        frameCount++;

        recordingWriteQueue = recordingWriteQueue
            .then(() => source.add(timestamp, 0.0166, { keyFrame: recordingOptions.lossless }))
            .catch((e) => console.error("Error writing frame:", e));
    }

    // 5 seconds timeout
    if (time > 1000) {
        game.gameState.paused = true;
    }

    return time;
}

export async function startRecording(renderer: Renderer) {
    console.log("startRecording called");
    // recording = true;
    frameCount = 0;
    recordingWriteQueue = Promise.resolve();
    const canvas = renderer.gl.canvas as HTMLCanvasElement;
    console.log("Canvas size:", canvas.width, canvas.height);
    canvasSource = new CanvasSource(canvas, {
        // codec: "vp9",
        codec: "av1",
        // bitrate: QUALITY_MEDIUM,
        bitrate: QUALITY_HIGH,
        // fullCodecString: "vp09.01.30.08.03.01.01.01.01",
        fullCodecString: "av01.1.08H.08",
        contentHint: "text"
    });
    output = new Output({
        target: new BufferTarget(),
        format: new MkvOutputFormat()
    });
    // output.target.onwrite = (start, end) => {
    //     console.log("Wrote bytes:", start, end);
    // };
    output.addVideoTrack(canvasSource);
    await output.start();
    // intervalId = setInterval(async () => {
    //     if (!recording) return;
    //     try {
    //         // console.log(fileName, "written, size:", blob.size);
    //         await canvasSource.add(frameCount / 10, 0.1);
    //         frameCount++;
    //     } catch (e) {
    //         console.error("Error writing frame:", e);
    //     }
    // }, 1000 / 10);
    // }, 1);
}

export async function stopRecording(format: string, params: string[]) {
    console.log("stopRecording called, frameCount:", frameCount);
    // recording = false;
    // if (intervalId) {
    //     clearInterval(intervalId);
    //     intervalId = null;
    // }

    // if (canvasSource && frameCount > 0) {
    if (canvasSource && output) {
        console.log(`Encoding ${frameCount} frames`);

        await recordingWriteQueue;
        canvasSource.close();
        await output.finalize();

        console.log("Encoding done");
        const blob = new Blob([output.target.buffer!], { type: output.format.mimeType });
        console.log("File read, size:", blob.size);
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

export function loadSnapshot(save: Save, renderer: Renderer, workspace: WorkspaceSvg) {
    // clear and import tiles
    tiles.length = 0;
    save.tiles.forEach((tile) => {
        tiles.push(tile);
    });

    serialization.workspaces.load(save.blockly, workspace);
    renderer.updateColours();
    Game.restart(renderer);
}
