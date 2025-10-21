<script lang="ts">
    import { onMount } from "svelte";

    // It sucks that this plugin forces us to import 200kb worth of blockly stuff we don't use
    import "@blockly/field-colour-hsv-sliders";
    import Controls from "../lib/components/page/Controls.svelte";
    import { javascriptGenerator } from "blockly/javascript";
    import { injectOptions, defaultBlockly, defaultTiles, blocks, toolbox } from "$lib/blockly";
    import { addBlockToBlockly } from "$lib/blocklypain";
    import Renderer from "$lib/render/webgl2.svelte";
    import {
        height,
        loadSnapshot,
        restartGame,
        tick,
        tiles,
        width,
        type Game,
        type GameState,
        type PhotoSave,
        type Save
    } from "$lib/stores.svelte";
    import { Events, inject, serialization, type WorkspaceSvg } from "blockly";
    import Tiles from "../lib/components/page/Tiles.svelte";
    import Saves from "../lib/components/page/Saves.svelte";
    import zelosAntLogo from "$lib/assets/zelos_ant.png";
    import Link from "../lib/components/Link.svelte";
    import sync from "$lib/sync.svelte";
    import { devicePixelRatio, innerHeight } from "svelte/reactivity/window";
    import { fade } from "svelte/transition";
    import { getBackgroundColour, getForegroundColour, hexToRgb, rgbToHex } from "$lib/util";
    import { page } from "$app/state";
    import Board from "$lib/board";
    import Ant from "$lib/ant";
    import { SvelteSet } from "svelte/reactivity";
    import { replaceState } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import { dev } from "$app/environment";
    import type { Attachment } from "svelte/attachments";
    // Currently broken
    // import { registerContinuousToolbox } from "@blockly/continuous-toolbox";

    let workspace: WorkspaceSvg | null = $state(null);
    let renderer: Renderer | null = $state(null);
    let DPR = $state(devicePixelRatio.current ?? 1);
    let showSaves = $state(false);
    let antLimit = 2 ** 14; // 16k

    const game: Game = {
        board: new Board(width, height),
        ants: new SvelteSet(),
        tileTriggers: new Map(),
        onStart: () => {},
        onEachIteration: () => {},
        getState: () => gameState
    };

    let gameState: GameState = $state({
        updateInProgress: false,
        paused: false,
        fps: 0,
        iterations: 0,
        iterationsPerTick: 1
    });

    let saves: Readonly<PhotoSave>[] = sync("ant-saves", []);

    // TODO: Make a default save generator so we don't have to hardcode this
    let autoSave: Save = sync("current-save", {
        name: "AutoSave",
        date: new Date(),
        blockly: defaultBlockly,
        tiles: defaultTiles
    });
    let sharedSave: Save | null = $state(null);

    function addAnt(x: number, y: number) {
        game.ants.add(new Ant({ x, y }));
    }

    function cloneAnt(ant: Ant) {
        if (game.ants.size < antLimit) {
            // 65k limit
            // TODO: Make this a setting
            game.ants.add(new Ant({ x: ant.position.x, y: ant.position.y }));
        }
    }

    // function killAnt(ant: Ant) {
    //     game.ants.delete(ant);
    // }

    // Uncaught Svelte error: missing_context
    // Context was not set in a parent component
    // https://svelte.dev/e/missing_context
    // (personally I think this is a bug in svelte)
    // setWorkspace(null);
    // setRenderer(null);

    function resetWorkspace() {
        if (
            confirm(
                "Are you sure you want to reset? This will remove all modified blocks and tiles."
            )
        ) {
            // Reset the auto save (or current save)
            autoSave.date = new Date();
            autoSave.blockly = defaultBlockly;
            autoSave.tiles = defaultTiles;
            loadSnapshot(game, gameState, autoSave, renderer!, workspace!);

            // Reset users' url search params
            const url = new URL(window.location.href);
            url.searchParams.delete("s");
            sharedSave = null;
            replaceState(url.toString(), {});
        }
    }

    // onMount(async () => {
    const blocklyContainer: Attachment = (container) => {
        if (workspace) return;

        // Build RawBlock -> Block
        for (const [type, block] of Object.entries(blocks)) {
            const { json, tooltip, onRun } = block;
            let b = block;
            b.json.type = type;

            let args = block.json.args0 as any[];
            let inputs: Record<string, unknown> = {};

            const toolboxItem = {
                kind: "BLOCK",
                type,
                blockxml: ""
            };

            if (args) {
                for (const arg of args) {
                    const { name, check, shadow } = arg;
                    let type = "math_number";

                    if (name) {
                        inputs[name] = {
                            shadow: {
                                type, // TODO: Use check for this
                                fields: {
                                    NUM: 1
                                }
                                // fields: shadow?.fields
                            }
                        };
                    }
                }

                // toolboxItem["inputs"] = inputs;
                console.log(toolboxItem);
            }

            toolbox.contents[0].contents?.push(toolboxItem);

            addBlockToBlockly({
                name: type,
                json,
                tooltip,
                onRun
            });
        }

        console.log(toolbox);

        // registerContinuousToolbox();
        workspace = inject("blockly", injectOptions);
        workspace.addChangeListener(Events.disableOrphans);

        let code = "";
        workspace.addChangeListener((e: Events.Abstract) => {
            // console.log(e.type, e?.reason);
            if (
                // e.type === Events.BLOCK_CREATE ||
                // e.type === Events.BLOCK_DELETE ||
                e.type === Events.FINISHED_LOADING ||
                e.type === Events.BLOCK_CHANGE ||
                e.type === Events.BLOCK_MOVE ||
                e.type === Events.BLOCK_FIELD_INTERMEDIATE_CHANGE
            ) {
                const newCode = javascriptGenerator.workspaceToCode(workspace!);
                if (e.type === Events.BLOCK_FIELD_INTERMEDIATE_CHANGE) {
                    const { name, blockId, newValue } = e as Events.BlockFieldIntermediateChange;
                    if (name === "COLOUR") {
                        // In the case of colour
                        // Find the block and its tileId
                        const block = workspace!.getBlockById(blockId!);
                        const tileId = block?.getFieldValue("TileID");
                        // console.log(tileId, newValue);

                        tiles[tileId].colour = hexToRgb(newValue as string)!;
                        renderer?.updateColours();
                    }
                }

                if (newCode === code) return;
                if (e.type === Events.BLOCK_MOVE) {
                    if (newCode !== code) {
                        const { reason } = e as Events.BlockMove;
                        if (reason?.[0] === "disconnect" || reason?.[0] === "connect") {
                            return;
                        }
                    } else return;
                }
                code = newCode;
                updateAutoSave();
                // console.log("reset!");
                // console.log(code);

                // Debug
                // TODO: Debug in dev environment?
                if (dev) {
                    if (document.getElementById("code")) {
                        document.getElementById("code")!.innerText = code;
                    }
                }

                game.tileTriggers.clear();
                restartGame(game, gameState);
                try {
                    // a better eval, but still not sandboxed
                    new Function("game", code)(game);
                } catch (err) {
                    console.error("eval error", err);
                }
            }
        });
        serialization.workspaces.load(defaultBlockly, workspace);

        function updateAutoSave() {
            autoSave.date = new Date();
            autoSave.blockly = serialization.workspaces.save(workspace!);
            autoSave.tiles = tiles;

            // weirdly enough as it turns out normal stringify is on par with the rest
            // console.warn(LZString.compressToEncodedURIComponent(JSON.stringify(autoSave)));
            // console.warn(JSON.stringify(compress(autoSave)));
            // console.warn(JSON.stringify(autoSave));
        }

        // function takePhoto(renderer: Renderer, canvas: HTMLCanvasElement) {
        //     renderer.render();
        //     return canvas.toDataURL();
        // }

        // function saveSnapshot(
        //     saves: PhotoSave[],
        //     renderer: Renderer,
        //     workspace: WorkspaceSvg,
        //     canvas: HTMLCanvasElement
        // ) {
        //     const name = prompt("Name your save")?.trim();
        //     if (name) {
        //         saves.push({
        //             name,
        //             date: new Date(),
        //             blockly: serialization.workspaces.save(workspace),
        //             tiles: Array.from(tiles),
        //             src: takePhoto(renderer, canvas)
        //         });
        //     }
        // }

        return () => {
            console.log("Destroying blockly canvas");
        };
    };

    const antCanvas: Attachment = (canvas) => {
        if (renderer) return;
        const gl2 = (canvas as HTMLCanvasElement).getContext("webgl2", {
            preserveDrawingBuffer: true
        }) as WebGL2RenderingContext;

        renderer = new Renderer(gl2);

        restartGame(game, gameState);

        renderer.updateColours();

        addAnt(game.board.width / 2, game.board.height / 2);

        // console.log(tiles, tileTriggers, Game.board.ants);

        window.addEventListener("keydown", (e: KeyboardEvent) => {
            switch (e.code) {
                case "KeyR":
                    restartGame(game, gameState);
                    break;

                case "KeyP":
                    gameState.paused = !gameState.paused;
                    break;

                case "KeyT":
                    gameState.fps = tick(game, gameState, renderer!, iterate);
                    break;
            }
        });

        window.requestAnimationFrame(frame);

        $effect(() => {
            renderer?.updateColours();
        });

        // TODO: Unfortunately, the only reasonable way to share saves is to use a database...
        // Load a save from the URL if it exists
        // const params = page.url.searchParams.get("s");
        // if (params) {
        //     // Only import pocketbase when needed!
        //     // TODO: Lazy class or something?
        //     const { default: PocketBase } = await import("pocketbase");
        //     new PocketBase("https://cdn.zelo.dev")
        //         .collection("ant")
        //         .getOne(params)
        //         .then((save) => {
        //             sharedSave = save.workspace;
        //             loadSnapshot(game, gameState, save.workspace, renderer!, workspace!);
        //         })
        //         .catch((err) => {
        //             console.error(err);
        //             alert("Failed to load save... Please try again later");
        //         });
        // }

        function frame() {
            if (!gameState.updateInProgress && !gameState.paused) {
                gameState.fps = tick(game, gameState, renderer!, iterate);
            }
            renderer!.render();

            window.requestAnimationFrame(frame);
        }

        return () => {
            console.log("Destroying ant canvas");
        };
    };

    onMount(() => {
        tiles.push({ colour: [0, 0, 0], triggers: ["turn right"] });
        tiles.push({ colour: [255, 255, 255], triggers: ["turn left"] });

        if (autoSave) {
            loadSnapshot(game, gameState, autoSave, renderer!, workspace!);
        }
    });

    function iterate() {
        for (const ant of game.ants) {
            game.onEachIteration(ant);

            const cell = game.board.getCell(ant.position.x, ant.position.y);

            // Attempt to run the trigger function if exists
            game.tileTriggers.get(cell)?.(ant);
        }
    }

    // For blockly positioning
    let headerHeight = $state(0);

    let recording = $state(false);

    // Contains video URL of the recording
    let video: string | null = $state(null);

    const fps = $derived(1000 / gameState.fps);
</script>

<svelte:head>
    {#if sharedSave}
        <title>{sharedSave.name} - zelo's ant</title>
    {:else}
        <title>zelo's ant</title>
    {/if}
    <script
        defer
        src="https://analytics.zelo.dev/script.js"
        data-website-id="86e78800-b780-4b47-bccd-4da3f6e67f7b"
    ></script>
</svelte:head>

<header class="flex items-end gap-3 text-xs font-medium" bind:clientHeight={headerHeight}>
    <img
        src={zelosAntLogo}
        alt="Zelos Ant Logo"
        width={164 / DPR}
        class="mt-3 ml-3 hue-rotate-280"
        style="image-rendering: pixelated;"
    />
    <Link href="https://github.com/Zolo101/zelos_ant">2.0.0 alpha</Link>
    <span>•</span>
    <Link href="https://discord.gg/YVuuF9KB5j">Discord</Link>
    <span>•</span>
    <!-- <button
        data-umami-event="save"
        onclick={() => saveSnapshot(saves, renderer!, workspace!, canvas!)}>Save</button
    >
    <span>•</span>
    <button onclick={() => (showSaves = !showSaves)}>Load</button>
    <span>•</span> -->
    <button onclick={resetWorkspace}>Reset</button>
    <span>•</span>
    <p class="opacity-75">Saves & Recording is currently disabled</p>
    <div class="text-md ml-auto flex gap-3 pr-5">
        <span>
            {fps > 60 ? ">60fps" : `${fps.toPrecision(2)}fps`}
        </span>
        <span>•</span>
        <span>
            {game.ants.size.toLocaleString()}
            {game.ants.size === 1 ? "ant" : "ants"} moving around
        </span>
        <span>•</span>
        <span>Iterations: {gameState.iterations.toLocaleString()}</span>
    </div>

    {#if gameState.fps > 1000 && gameState.paused}
        <span>•</span>
        <span class="text-red-500">Anti-Freeze: Game has auto paused</span>
    {/if}
    {#if sharedSave}
        <div class="ml-auto flex items-center gap-3 px-2">
            <span>Viewing:</span>
            <span
                class="px-1"
                style="background-color: {getForegroundColour(
                    sharedSave
                )}; color: {getBackgroundColour(sharedSave)}">{sharedSave?.name}</span
            >
        </div>
    {/if}
</header>
<main class="flex gap-3 p-3">
    <div class="grow">
        <div class="relative h-full w-full">
            <div
                class="w-full"
                id="blockly"
                style="height: {innerHeight.current! - headerHeight - 115}px;"
                {@attach blocklyContainer}
            ></div>
            {#if workspace && renderer}
                <!-- This prop drilling is unavoidable dont bother -->
                <Tiles {game} {workspace} {renderer} {gameState} />
            {/if}
            {#if showSaves}
                <div
                    transition:fade={{ duration: 100 }}
                    class="absolute top-0 left-0 z-9999 w-full overflow-auto"
                    style="height: {innerHeight.current! - headerHeight - 24}px;"
                >
                    <Saves {game} {renderer} {workspace} {gameState} {saves} />
                </div>
            {/if}
        </div>
    </div>
    <div class="flex max-w-1/2 flex-col gap-2" style="width: {width / DPR}px;">
        <canvas
            style="max-height: {height / DPR}px; max-width: {width / DPR}px;"
            class="outline transition-colors {[
                (recording && 'outline-red-500') || 'outline-white/10'
            ]} {[video && 'hidden']} outline-2"
            id="canvas"
            {width}
            {height}
            {@attach antCanvas}
        ></canvas>
        {#if video}
            <!-- <video class="max-w-full" controls>
                <track kind="captions" />
                <source src={video} type="video/mp4" />
            </video> -->
            <img src={video} alt="Recorded gif" class="max-w-full" />
        {/if}
        {#if renderer}
            <Controls {iterate} {game} {renderer} bind:gameState bind:recording bind:video />
        {/if}
    </div>
</main>
