<script lang="ts">
    import { onMount } from "svelte";

    // It sucks that this plugin forces us to import 200kb worth of blockly stuff we don't use
    import "@blockly/field-colour-hsv-sliders";
    import Controls from "../lib/components/page/Tabs.svelte";
    import { javascriptGenerator } from "blockly/javascript";
    import { injectOptions, defaultBlockly, defaultTiles, blocks, toolbox } from "$lib/blockly";
    import { addBlockToBlockly } from "$lib/blocklypain";
    import Renderer from "$lib/render/webgl2.svelte";
    import {
        canvasSource,
        height,
        loadSnapshot,
        tick,
        tiles,
        width,
        type PhotoSave,
        type Save,
        type Tile
    } from "$lib/stores.svelte";
    import { Events, inject, serialization, type WorkspaceSvg } from "blockly";
    import Tiles from "../lib/components/page/Tiles.svelte";
    import Saves from "../lib/components/page/Saves.svelte";
    import zelosAntLogo from "$lib/assets/zelos_ant.png";
    import Link from "../lib/components/Link.svelte";
    import sync from "$lib/sync.svelte";
    import { devicePixelRatio, innerHeight } from "svelte/reactivity/window";
    import { fade } from "svelte/transition";
    import { getBackgroundColour, getForegroundColour, hexToRgb } from "$lib/util";
    import Ant from "$lib/ant";
    import { replaceState } from "$app/navigation";
    import { browser, dev } from "$app/environment";
    import type { Attachment } from "svelte/attachments";
    import Game from "$lib/Game.svelte";
    // Currently broken
    // import { registerContinuousToolbox } from "@blockly/continuous-toolbox";

    let workspace: WorkspaceSvg | null = $state(null);
    let renderer: Renderer | null = $state(null);
    let DPR = $state(devicePixelRatio.current ?? 1);
    // let antLimit = 2 ** 14; // 16k

    function prefersDarkMode() {
        return browser && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    function getDefaultTilesForTheme(): Tile[] {
        return prefersDarkMode()
            ? structuredClone(defaultTiles)
            : [
                  { colour: [255, 255, 255], triggers: ["turn right"] },
                  { colour: [0, 0, 0], triggers: ["turn left"] }
              ];
    }

    // const game: Game = {
    //     board: new Board(),
    //     ants: new SvelteSet(),
    //     tileTriggers: new Map(),
    //     onStart: () => {},
    //     onEachIteration: () => {},
    //     getState: () => game.gameState
    // };

    const game = new Game();

    let saves: PhotoSave[] = sync("ant-saves", []);

    // TODO: Make a default save generator so we don't have to hardcode this
    let autoSave: Save = sync("current-save", {
        name: "AutoSave",
        date: new Date(),
        blockly: defaultBlockly,
        tiles: getDefaultTilesForTheme()
    });
    let sharedSave: Save | null = $state(null);

    function addAnt(x: number, y: number) {
        game.ants.add(new Ant({ x, y }));
    }

    // function cloneAnt(ant: Ant) {
    //     if (game.ants.size < antLimit) {
    //         // 65k limit
    //         // TODO: Make this a setting
    //         game.ants.add(new Ant({ x: ant.position.x, y: ant.position.y }));
    //     }
    // }

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
            autoSave.tiles = getDefaultTilesForTheme();
            loadSnapshot(autoSave, renderer!, workspace!);

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
                Game.restart();
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

        return () => {
            console.log("Destroying blockly canvas");
        };
    };

    function takePhoto(renderer: Renderer, canvas: HTMLCanvasElement) {
        renderer.render();
        return canvas.toDataURL();
    }

    function saveSnapshot(
        saves: PhotoSave[],
        renderer: Renderer,
        workspace: WorkspaceSvg,
        canvas: HTMLCanvasElement
    ) {
        const name = prompt("Name your save")?.trim();
        if (name) {
            saves.push({
                name,
                date: new Date(),
                blockly: serialization.workspaces.save(workspace),
                tiles: Array.from(tiles),
                src: takePhoto(renderer, canvas)
            });
        }
    }
    const antCanvas: Attachment = (canvas) => {
        if (renderer) return;
        const gl2 = (canvas as HTMLCanvasElement).getContext("webgl2", {
            preserveDrawingBuffer: true
        }) as WebGL2RenderingContext;

        renderer = new Renderer(gl2);

        Game.restart();

        renderer.updateColours();

        addAnt(game.board.width / 2, game.board.height / 2);

        // console.log(tiles, tileTriggers, Game.board.ants);

        window.addEventListener("keydown", (e: KeyboardEvent) => {
            switch (e.code) {
                case "KeyR":
                    Game.restart();
                    break;

                case "KeyP":
                    game.gameState.paused = !game.gameState.paused;
                    break;

                case "KeyT":
                    game.gameState.fps = tick(game, renderer!, iterate);
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
        //             loadSnapshot(save.workspace, renderer!, workspace!);
        //         })
        //         .catch((err) => {
        //             console.error(err);
        //             alert("Failed to load save... Please try again later");
        //         });
        // }

        function frame() {
            if (!game.gameState.updateInProgress && !game.gameState.paused) {
                game.gameState.fps = tick(game, renderer!, iterate);
            }
            renderer!.render();

            window.requestAnimationFrame(frame);
        }

        return () => {
            console.log("Destroying ant canvas");
        };
    };

    onMount(() => {
        const defaultTilesForTheme = getDefaultTilesForTheme();

        tiles.push(...defaultTilesForTheme);

        if (autoSave) {
            loadSnapshot(autoSave, renderer!, workspace!);
        }

        // DPR watch for canvas, does not work on chrome linux
        // TODO: Make sure this isn't causing pixels to be "hidden" since we're technically rendering at a higher res than the css size
        DPR = window.devicePixelRatio || 1;

        const mediaQuery = window.matchMedia(`(resolution: ${DPR}dppx)`);
        const updateDpr = () => {
            DPR = window.devicePixelRatio || 1;
        };
        mediaQuery.addEventListener("change", updateDpr);

        return () => mediaQuery.removeEventListener("change", updateDpr);
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

    // let recording = $state(false);

    // Contains video URL of the recording
    let video: string | null = $state(null);
    let canvas: HTMLCanvasElement | null = $state(null);

    const fps = $derived(1000 / game.gameState.fps);
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
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link
        href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap"
        rel="stylesheet"
    />
</svelte:head>

<header class="mx-3 my-1 flex items-end gap-9 text-lg" bind:clientHeight={headerHeight}>
    <img
        src={zelosAntLogo}
        alt="Zelos Ant Logo"
        width={164 / DPR}
        class="relative bottom-1"
        style="image-rendering: pixelated;"
    />

    <button
        data-umami-event="save"
        onclick={() => {
            if (renderer && workspace && canvas) {
                saveSnapshot(saves, renderer, workspace, canvas);
            }
        }}>Save</button
    >
    <button onclick={() => (game.showSaves = !game.showSaves)}>Load</button>
    <!-- <button onclick={() => (game.showSaves = !game.showSaves)}>Featured</button> -->
    <button onclick={resetWorkspace}>Reset</button>
    <button onclick={() => (game.showAbout = true)}>About</button>
    <!-- <p class="opacity-75">Saves & Recording is currently disabled</p> -->
    <div class="mr-5 ml-auto flex gap-9 tabular-nums">
        <span>{game.gameState.iterations.toLocaleString()} iterations</span>
        <!-- <span>
            {game.ants.size.toLocaleString()}
            {game.ants.size === 1 ? "ant" : "ants"} moving around
        </span> -->
        <span>
            {fps > 60 ? ">60fps" : `${fps.toPrecision(2)}fps`}
        </span>
    </div>

    {#if game.gameState.fps > 1000 && game.gameState.paused}
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
<main class="flex">
    <div class="grow">
        <div class="absolute bottom-0 left-0 w-full">
            {#if workspace && renderer}
                <!-- This prop drilling is unavoidable dont bother -->
                <!-- 2026 TODO: IS IT DOE??????????? -->
                <Tiles {workspace} {renderer} />
            {/if}
        </div>
        <div class="relative h-full w-full">
            <div
                class="w-full"
                id="blockly"
                style="height: {innerHeight.current! - headerHeight - 115}px;"
                {@attach blocklyContainer}
            ></div>
            {#if game.showSaves}
                <div
                    transition:fade={{ duration: 100 }}
                    class="absolute top-0 left-0 z-9999 w-full overflow-auto bg-violet-100/60 dark:bg-black/70 px-6 py-3 backdrop-blur-xs"
                    style="height: {innerHeight.current! - headerHeight - 24}px;"
                >
                    <Saves {game} {renderer} {workspace} {saves} />
                </div>
            {/if}
        </div>
    </div>
    <div class="flex max-w-1/2 flex-col gap-2 mx-3" style="width: {width / DPR}px;">
        <canvas
            style="height: {height / DPR}px; width: {width / DPR}px;"
            class={[
                "outline transition-colors",
                (canvasSource && "outline-red-500") || "outline-white/10",
                video && "hidden",
                "outline-2"
            ]}
            id="canvas"
            {width}
            {height}
            bind:this={canvas}
            {@attach antCanvas}
        ></canvas>
        {#if video}
            <video class="max-w-full" controls>
                <track kind="captions" />
                <source src={video} type="video/mp4" />
            </video>
            <!-- <img src={video} alt="Recorded gif" class="max-w-full" /> -->
        {/if}
        {#if renderer}
            <Controls {iterate} {game} {renderer} bind:video />
        {/if}
    </div>
</main>

{#if game.showAbout}
    <div
        class="fixed inset-0 z-500 flex items-center justify-center"
        transition:fade={{ duration: 200 }}
    >
        <div class="fixed inset-0 bg-black/75 backdrop-blur-xs"></div>
        <dialog
            class="static z-10 h-120 w-160 overflow-y-auto rounded-lg bg-taupe-200 p-5 shadow-lg dark:bg-(--dark2)"
            open={game.showAbout}
        >
            <button
                onclick={() => (game.showAbout = false)}
                class="absolute top-2 right-2 rounded bg-red-500 px-3 py-1 text-white"
            >
                Close
            </button>
            <div>
                <img
                    src={zelosAntLogo}
                    alt="Zelos Ant Logo"
                    width={360 / DPR}
                    class="mx-auto"
                    style="image-rendering: pixelated;"
                />
                <p class="text-center text-xs">2.0.0 alpha 2</p>
                <br />

                <p>
                    zelo's ant is an interactive
                    <Link href="https://en.wikipedia.org/wiki/Langton%27s_ant">Langton's ant</Link> simulator
                    on the web. Create your own rules and see what patterns the ant makes.
                </p>

                <br />
                <p>
                    This simulator shows you how a simple set of rules can create complex patterns.
                    One small edit and the result becomes completely different! It's also a great
                    way to learn about cellular automata and emergent behavior. In the future,
                    you'll also be able to explore rules made by other users.
                </p>
                <br />

                <div class="flex flex-col gap-2">
                    <!-- <div>
                        <span>If you REALLY REALLY NEED HELP!! JOIN MY</span>
                        <Link href="https://discord.gg/YVuuF9KB5j">DISCORD!!</Link>
                    </div> -->

                    <div>
                        <span
                            >If you want to contribute / report issues, visit the <Link
                                href="https://github.com/Zolo101/zelos_ant">GitHub repository</Link
                            >, or <Link href="https://zelo.dev/about">email me!</Link> &lt;3</span
                        >
                    </div>

                    <div>
                        <span>Check out more cool stuff on</span>
                        <Link href="https://zelo.dev/">my website!</Link>
                    </div>
                </div>
                <!-- <p class="text-center text-xs">They're MY ants, not yours</p> -->
            </div>
        </dialog>
    </div>
{/if}
