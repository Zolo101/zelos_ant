<script lang="ts">
    import {
        downloadVideo,
        restartGame,
        startRecording,
        stopRecording,
        tick,
        canvasSource,
        type Game,
        type GameState,
        recordingOptions
    } from "$lib/stores.svelte";
    import { SvelteMap, SvelteSet } from "svelte/reactivity";
    import Button from "../Button.svelte";
    import { dev } from "$app/environment";
    import IconButton from "../IconButton.svelte";
    import type Renderer from "$lib/render/webgl2.svelte";
    import Tiles from "./Tiles.svelte";
    import type { WorkspaceSvg } from "blockly";
    import Link from "../Link.svelte";

    let {
        iterate,
        game,
        gameState = $bindable(),
        renderer,
        video = $bindable()
    }: {
        iterate: () => void;
        game: Game;
        gameState: GameState;
        renderer: Renderer;
        video: any;
    } = $props();

    let sliderValue = $state(Math.log10(gameState.iterationsPerTick));

    function formatIterations(iterations: number): string {
        return iterations.toLocaleString();
    }

    function getsliderValue(): number {
        return Math.floor(Math.pow(10, sliderValue));
    }

    function oneTick() {
        gameState.fps = tick(game, gameState, renderer!, iterate);
    }

    const formats: Record<string, string[]> = {
        "image/gif": ["-framerate", "10", "-i", "%09d.png"],
        "video/mp4": ["-framerate", "10", "-i", "%09d.png", "-c:v", "libx264", "-b:v", "1M"]
    };
    let format = $state("video/mp4");
    async function operateRecording() {
        // recording = !recording;

        if (!canvasSource) {
            startRecording(renderer);
        } else {
            try {
                video = await stopRecording(format, formats[format]);
                gameState.paused = true;
            } catch (e) {
                console.error("Recording error:", e);
            }
        }
    }

    // const tabs = new SvelteSet(["Controls", "Recording", "Settings", "About"]);
    // const tabs = new SvelteSet(["Controls", "Recording"]);
    let selectedTab = $state("About");
    const tabs = new SvelteMap([
        // ["Controls", controls],
        ["About", about]
        // ["Recording", recorder]
        // ["Tiles", tiles] // this is a ui test, idk if it'll stay
    ]);
    if (dev) tabs.set("Debug", debug);
</script>

<div class="flex flex-col gap-2">
    <div class="flex select-none">
        <input
            type="range"
            min="0"
            max="6"
            step=".1"
            bind:value={sliderValue}
            class="w-full"
            oninput={() => (gameState.iterationsPerTick = getsliderValue())}
        />
        <div class="w-32 text-center">
            <span>{formatIterations(getsliderValue())}</span>
            <span class="font-bold">I/t</span>
        </div>
    </div>
</div>
{@render controls()}
<!-- <div class="flex gap-2 border-b border-violet-200 text-lg dark:border-violet-500"> -->
<div class="flex gap-2 text-lg">
    <!-- {#each tabs as [name] (name)}
        <button
            class={[
                "cursor-pointer rounded-t border-b-2 bg-violet-200 px-3 py-1 transition-colors hover:border-violet-600 hover:bg-violet-300 dark:bg-violet-900 dark:hover:border-violet-50 dark:hover:bg-violet-800",
                (selectedTab === name && "border-violet-400") || "border-transparent"
            ]}
            onclick={() => (selectedTab = name)}
        >
            <p>{name}</p>
        </button>
    {/each} -->
</div>
{@render tabs.get(selectedTab)?.()}

{#snippet controls()}
    <div class="flex gap-3 *:grow">
        <IconButton
            icon={gameState.paused ? "play" : "pause"}
            onclick={() => (gameState.paused = !gameState.paused)}
            hotkey="P"
        />
        <IconButton
            icon="restart"
            onclick={() => {
                restartGame(game, gameState);
            }}
            hotkey="R"
        />
        <IconButton icon="advance_frame" onclick={oneTick} hotkey="T" />
    </div>
{/snippet}

{#snippet recorder()}
    {#if video}
        <div class="flex justify-center gap-3">
            <Button onclick={() => downloadVideo(video, format)}>Download</Button>
            <Button onclick={() => (video = "")}>Cancel</Button>
        </div>
    {/if}
    <div class="flex gap-3">
        <Button onclick={operateRecording}>{canvasSource ? "End" : "Start"} Recording</Button>
        <!-- <select bind:value={format} disabled={!!video} class="rounded bg-violet-900 px-2 text-sm">
            <option value="image/gif">.gif</option>
            <option value="video/mp4">.mp4 (h264)</option>
        </select> -->
    </div>
    <div>
        <span
            >Check the grid below for device support. If you think your device should support a
            feature, it could be the browsers fault. Try another browser</span
        >
    </div>
    <div class="grid grid-flow-dense grid-cols-[auto_50px] gap-3 text-sm">
        <label for="av1">Device supports AV1 encoding.</label>
        <input type="checkbox" disabled name="av1" />
        <label for="yuv444">Device supports 4:4:4 chroma subsampling in AV1.</label>
        <input type="checkbox" disabled name="yuv444" />
        <label for="yuv444"
            >Use YUV444 (perfect color accuracy, BUT bad device playback support)</label
        >
        <input type="checkbox" bind:checked={recordingOptions.yuv444} name="yuv444" />
        <!-- <label for="lossless">Lossless (x5 file size, not recommended!)</label>
        <input type="checkbox" bind:checked={recordingOptions.lossless} name="lossless" /> -->
    </div>
{/snippet}

{#snippet settings()}
    <div class="flex gap-3">
        <p>WIP</p>
    </div>
{/snippet}

{#snippet about()}
    <!-- <p>They're my ants! Not yours!</p> -->
    <!-- <p>version 2.0.0 alpha 2</p> -->

    <!-- <div class="flex gap-6"> -->
    <!-- <span>go to</span> -->
    <!-- <Link href="https://zelo.dev/">my website</Link> -->
    <!-- <Link href="https://discord.gg/YVuuF9KB5j">Discord</Link> -->
    <!-- <span>... or check out the</span> -->
    <!-- <Link href="https://github.com/Zolo101/zelos_ant">source code</Link> -->
    <!-- </div> -->
{/snippet}

{#snippet debug()}
    <pre id="code" class="text-xs"></pre>
    <!-- <Button onclick={() => alert("hey")} hotkey="P">Click me please</Button> -->
{/snippet}

<!-- {#snippet tiles()} -->
<!-- <Tiles {game} {gameState} {workspace} {renderer} /> -->
<!-- {/snippet} -->
