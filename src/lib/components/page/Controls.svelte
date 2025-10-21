<script lang="ts">
    import {
        downloadVideo,
        restartGame,
        startRecording,
        stopRecording,
        tick,
        type Game,
        type GameState
    } from "$lib/stores.svelte";
    import { SvelteMap, SvelteSet } from "svelte/reactivity";
    import Button from "../Button.svelte";
    import { dev } from "$app/environment";
    import IconButton from "../IconButton.svelte";
    import type Renderer from "$lib/render/webgl2.svelte";
    import Tiles from "./Tiles.svelte";
    import type { WorkspaceSvg } from "blockly";

    let {
        iterate,
        game,
        gameState = $bindable(),
        renderer,
        recording = $bindable(),
        video = $bindable()
    }: {
        iterate: () => void;
        game: Game;
        gameState: GameState;
        renderer: Renderer;
        recording: any;
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
    let format = $state("image/gif");
    async function operateRecording() {
        recording = !recording;

        if (recording) {
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
    let selectedTab = $state("Controls");
    const tabs = new SvelteMap([
        ["Controls", controls],
        ["About", about]
        // ["Tiles", tiles] // this is a ui test, idk if it'll stay
        // ["Recording", recorder]
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
    <div class="flex gap-2 border-b border-purple-900 text-sm">
        {#each tabs as [name]}
            <button
                class="cursor-pointer border-b-2 bg-purple-900 px-3 py-1 transition-colors hover:border-purple-50 hover:bg-purple-800 {[
                    (selectedTab === name && 'border-purple-400') || 'border-transparent'
                ]}"
                onclick={() => (selectedTab = name)}
            >
                <p>{name}</p>
            </button>
        {/each}
    </div>
    {@render tabs.get(selectedTab)?.()}
</div>

{#snippet controls()}
    <div class="flex gap-3">
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
    <p class="text-center">
        warning: Recording for the first time will download FFmpeg.wasm (32MB)
    </p>
    {#if video}
        <div class="flex justify-center gap-3">
            <Button onclick={() => downloadVideo(video, format)}>Download</Button>
            <Button onclick={() => (video = "")}>Cancel</Button>
        </div>
    {/if}
    <div class="flex gap-3">
        <Button onclick={operateRecording}>{recording ? "End" : "Start"} Recording</Button>
        <select bind:value={format} disabled={!!video} class="rounded bg-purple-900 px-2 text-sm">
            <option value="image/gif">.gif</option>
            <!-- <option value="video/mp4">.mp4 (h264)</option> -->
        </select>
    </div>
{/snippet}

{#snippet settings()}
    <div class="flex gap-3">
        <p>WIP</p>
    </div>
{/snippet}

{#snippet about()}
    <p>They're my ants! Not yours!</p>
    <Button onclick={() => alert("hey")} hotkey="P">Click me please</Button>
{/snippet}

{#snippet debug()}
    <pre id="code" class="text-xs"></pre>
{/snippet}

<!-- {#snippet tiles()} -->
<!-- <Tiles {game} {gameState} {workspace} {renderer} /> -->
<!-- {/snippet} -->
