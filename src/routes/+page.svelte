<script lang="ts">
    import { onMount } from "svelte";
    import * as Blockly from "blockly";
    import "@blockly/field-colour-hsv-sliders";
    import Stats from "../component/Stats.svelte";
    import Controls from "../component/page/Controls.svelte";
    import { javascriptGenerator, Order } from "blockly/javascript";
    import {
        turnJSON,
        lookJSON,
        onJSON,
        moveJSON,
        iterationJSON,
        createAntJSON,
        injectOptions,
        defaultBlockly,
        incrementJSON,
        defaultTiles
    } from "../ant/blockly";
    import { addBlockToBlockly } from "../ant/blocklypain";
    import Renderer from "../ant/render/webgl2.svelte";
    import {
        height,
        loadSnapshot,
        restartGame,
        tick,
        tiles,
        width,
        type Game,
        type PhotoSave,
        type Save,
        type Tile
    } from "../ant/stores.svelte";
    import type { WorkspaceSvg } from "blockly";
    import Tiles from "../component/page/Tiles.svelte";
    import Saves from "../component/page/Saves.svelte";
    import zelosAntLogo from "$lib/assets/zelos_ant.png";
    import Link from "../component/Link.svelte";
    import sync from "../ant/sync.svelte";
    import { devicePixelRatio, innerHeight } from "svelte/reactivity/window";
    import { fade } from "svelte/transition";
    import { getBackgroundColour, getForegroundColour, hexToRgb, rgbToHex } from "../ant/util";
    import { page } from "$app/state";
    import PocketBase from "pocketbase";
    import Board from "../ant/board";
    import type Ant from "../ant/ant";

    // TODO: Unfortunately, the only reasonable way to share saves is to use a database...
    const pb = new PocketBase("https://cdn.zelo.dev");
    let canvas: HTMLCanvasElement | null = $state(null);
    let workspace: WorkspaceSvg | null = $state(null);
    let renderer: Renderer | null = $state(null);
    let DPR = $state(devicePixelRatio.current ?? 1);
    let showSaves = $state(false);

    let game: Game = $state({
        board: new Board(width, height),
        tileTriggers: new Map<number, (ant: Ant) => void>(),
        onEachIteration: () => {},
        alertText: "",
        oldTiles: [],
        updateInProgress: false,
        paused: false,
        fps: 0,
        iterations: 0,
        iterationsPerTick: 100
    });

    let saves: PhotoSave[] = sync("ant-saves", []);

    // TODO: Make a default save generator so we don't have to hardcode this
    let autoSave: Save = sync("current-save", {
        name: "AutoSave",
        date: new Date(),
        blockly: defaultBlockly,
        tiles: defaultTiles
    });
    let sharedSave: Save | null = $state(null);

    onMount(() => {
        const gl2 = canvas!.getContext("webgl2") as WebGL2RenderingContext;

        renderer = new Renderer(gl2);
        clear();

        addTileIDK(renderer, [0, 0, 0], ["turn right"]);
        addTileIDK(renderer, [255, 255, 255], ["turn left"]);

        game.board.addAnt(game.board.width / 2, game.board.height / 2);

        // console.log(tiles, Game.tileTriggers, Game.board.ants);

        addBlockToBlockly({
            name: "turn",
            json: turnJSON,
            tooltip: (block) => {
                return `Turns the ant in the ${block.getFieldValue("Directions")} direction.`;
            },
            onRun: (block) => {
                const dropdown_directions = block.getFieldValue("Directions");
                return `ant.turn${dropdown_directions}();\n`;
            }
        });

        addBlockToBlockly({
            name: "look",
            json: lookJSON,
            tooltip: (block) => {
                return `Makes the ant look ${block.getFieldValue("Directions")}.`;
            },
            onRun: (block) => {
                const dropdown_directions = block.getFieldValue("Directions");
                switch (dropdown_directions) {
                    case "North":
                        return `ant.rotation = 0;\n`;
                    case "East":
                        return `ant.rotation = 1;\n`;
                    case "South":
                        return `ant.rotation = 2;\n`;
                    case "West":
                        return `ant.rotation = 3;\n`;
                    default:
                        return "";
                }
            }
        });

        addBlockToBlockly({
            name: "on",
            json: onJSON,
            tooltip: (block) => {
                return `Triggers when an ant steps on tile ${block.getFieldValue("TileID")}.`;
            },
            onRun: (block) => {
                const number_tileid = block.getFieldValue("TileID");
                const statements_name = javascriptGenerator.statementToCode(block, "NAME");
                return `// On tile ${number_tileid}\ngame.tileTriggers.set(${number_tileid}, (ant) => {\n${statements_name}});\n`;
            }
        });

        addBlockToBlockly({
            name: "move",
            json: moveJSON,
            tooltip: (block) => {
                return `Moves the ant forward by ${block.getFieldValue("NAME")}.`;
            },
            onRun: (block: Blockly.Block) => {
                const amount = javascriptGenerator.valueToCode(block, "NAME", Order.ADDITION);
                return `ant.moveForward(${amount});\n`;
            }
        });

        addBlockToBlockly({
            name: "increment",
            json: incrementJSON,
            tooltip: (block) => {
                return `Increments the current cell by ${block.getFieldValue("NAME")}.`;
            },
            onRun: (block: Blockly.Block) => {
                const amount = javascriptGenerator.valueToCode(block, "NAME", Order.ADDITION);
                return `ant.incrementCell(${amount});\n`;
            }
        });

        addBlockToBlockly({
            name: "iteration",
            json: iterationJSON,
            tooltip: () => {
                return `Triggers on each iteration.`;
            },
            onRun: (block) => {
                // let number_tileid = block.getFieldValue("TileID");
                const statements_name = javascriptGenerator.statementToCode(block, "NAME");
                return `// On iteration\ngame.onEachIteration = (ant) => {\n${statements_name}}\n`;
            }
        });

        addBlockToBlockly({
            name: "create_ant",
            json: createAntJSON,
            tooltip: (block) => {
                return `Creates an ant in the location (${block.getFieldValue("X")}, ${block.getFieldValue("Y")})`;
            },
            onRun: (block) => {
                const [x, y] = [
                    javascriptGenerator.valueToCode(block, "X", Order.ADDITION),
                    javascriptGenerator.valueToCode(block, "Y", Order.ADDITION)
                ];
                return `game.board.addAnt(${x}, ${y});\n`;
            }
        });

        workspace = Blockly.inject("blockly", injectOptions);

        workspace.addChangeListener(Blockly.Events.disableOrphans);

        let code = "";
        workspace.addChangeListener((e: Blockly.Events.Abstract) => {
            // console.log(e.type, e?.reason);
            if (
                // e.type === Blockly.Events.BLOCK_CREATE ||
                // e.type === Blockly.Events.BLOCK_DELETE ||
                e.type === Blockly.Events.FINISHED_LOADING ||
                e.type === Blockly.Events.BLOCK_CHANGE ||
                e.type === Blockly.Events.BLOCK_MOVE ||
                e.type === Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE
            ) {
                const newCode = javascriptGenerator.workspaceToCode(workspace!);
                if (e.type === Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE) {
                    const { name, blockId, newValue } =
                        e as Blockly.Events.BlockFieldIntermediateChange;
                    if (name === "COLOUR") {
                        // In the case of colour
                        // Find the block and its tileId
                        const block = workspace!.getBlockById(blockId!);
                        const tileId = block?.getFieldValue("TileID");
                        // console.log(tileId, newValue);

                        tiles[tileId].colour = hexToRgb(newValue as string)!;
                    }
                }

                if (newCode === code) return;
                if (e.type === Blockly.Events.BLOCK_MOVE) {
                    if (newCode !== code) {
                        if (e?.reason[0] === "disconnect" || e?.reason[0] === "connect") {
                            return;
                        }
                    } else return;
                }
                code = newCode;
                updateAutoSave();
                console.log("reset!");

                // Debug
                // TODO: Debug in dev environment?
                if (document.getElementById("code")) {
                    document.getElementById("code")!.innerText = code;
                }

                game.tileTriggers.clear();
                restartGame(game);
                try {
                    // eval for now (its slow)
                    eval(code);
                } catch (err) {
                    console.error("eval error", err);
                }
            }
        });
        Blockly.serialization.workspaces.load(defaultBlockly, workspace);

        window.addEventListener("keydown", (e: KeyboardEvent) => {
            switch (e.code) {
                case "KeyR":
                    restartGame(game);
                    break;

                case "KeyP":
                    game.paused = !game.paused;
                    break;

                case "KeyT":
                    game.fps = tick(game, renderer!, iterate);
                    break;
            }
        });

        function updateAutoSave() {
            autoSave.date = new Date();
            autoSave.blockly = Blockly.serialization.workspaces.save(workspace!);
            autoSave.tiles = tiles;

            // weirdly enough as it turns out normal stringify is on par with the rest
            // console.warn(LZString.compressToEncodedURIComponent(JSON.stringify(autoSave)));
            // console.warn(JSON.stringify(compress(autoSave)));
            // console.warn(JSON.stringify(autoSave));
        }

        if (autoSave) {
            loadSnapshot(game, autoSave, renderer!, workspace!);
        }

        window.requestAnimationFrame(frame);

        $effect(() => {
            renderer?.updateColours();
        });

        // Load a save from the URL if it exists
        const params = page.url.searchParams.get("s");
        if (params) {
            pb.collection("ant")
                .getOne(params)
                .then((save) => {
                    sharedSave = save.workspace;
                    loadSnapshot(game, save.workspace, renderer!, workspace!);
                })
                .catch((err) => {
                    console.error(err);
                    alert("Failed to load save... Please try again later");
                });
        }
    });

    const randomColour = (): Tile["colour"] => [
        ~~(Math.random() * 255),
        ~~(Math.random() * 255),
        ~~(Math.random() * 255)
    ];

    function findOnTileBlock(index: number) {
        for (const block of workspace!.getAllBlocks()) {
            if (block.getFieldValue("TileID") === index) {
                return block;
            }
        }
        return null;
    }

    // This is O(n^2). In my tests it only causes noticable lag after 100 tiles.
    // OFC it can be O(n). If someone complains, I will optimise it.
    function updateTileColours() {
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            const block = findOnTileBlock(i);
            if (block) {
                block.setFieldValue(rgbToHex(...tile.colour), "COLOUR");
            }
        }
    }

    function addTile() {
        addTileIDK(renderer!, randomColour(), ["turn left"]);

        // Check if the block already exists
        const existingBlock = findOnTileBlock(tiles.length - 1);
        const tile = tiles[tiles.length - 1];
        if (existingBlock) {
            existingBlock.setFieldValue(rgbToHex(...tile.colour), "COLOUR");
        } else {
            const block = workspace!.newBlock("on");
            block.setFieldValue(tiles.length - 1, "TileID");

            block.setFieldValue(rgbToHex(...tile.colour), "COLOUR");
            block.initSvg();
            block.render();

            const turnBlock = workspace!.newBlock("turn");
            turnBlock.setFieldValue("Left", "Directions");
            turnBlock.initSvg();
            turnBlock.render();
            // console.log(block.getInput("NAME").connection, turnBlock.previousConnection)
            block.getInput("NAME")!.connection!.connect(turnBlock.previousConnection);
        }

        workspace!.render();
        restartGame(game);
    }

    function removeTile(tile: Tile) {
        // Must be at least one tile
        if (tiles.length - 1 === 0) return;

        // Remove the block
        tiles.splice(tiles.indexOf(tile), 1);

        // Update the tile colours
        updateTileColours();

        restartGame(game);
    }

    function frame() {
        if (!game.updateInProgress && !game.paused) {
            game.fps = tick(game, renderer!, iterate);
        }
        renderer!.render();

        window.requestAnimationFrame(frame);
    }

    function iterate() {
        for (const ant of game.board.ants) {
            // Move
            game.onEachIteration(ant);

            const cell = game.board.getCell(ant.position.x, ant.position.y);

            // Attempt to run the trigger function if exists
            game.tileTriggers.get(cell)?.(ant);
        }
    }

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
            loadSnapshot(game, autoSave, renderer!, workspace!);

            // Reset users' url search params
            const url = new URL(window.location.href);
            url.searchParams.delete("s");
            window.history.replaceState({}, "", url.toString());
        }
    }

    // Game.svelte.ts stuff
    function clear() {
        game.board.clear();
        tiles.length = 0;
    }

    function takePhoto(renderer: Renderer, canvas: HTMLCanvasElement) {
        renderer.render();
        return canvas.toDataURL();
    }

    function saveSnapshot(
        saves: PhotoSave[],
        renderer: Renderer,
        workspace: Blockly.WorkspaceSvg,
        canvas: HTMLCanvasElement
    ) {
        const name = prompt("Name your save")?.trim();
        if (name) {
            saves.push({
                name,
                date: new Date(),
                blockly: Blockly.serialization.workspaces.save(workspace),
                tiles: Array.from(tiles),
                src: takePhoto(renderer, canvas)
            });
        }
    }

    function addTileIDK(renderer: Renderer, color: Tile["colour"], triggers: Tile["triggers"]) {
        const newTile = {
            colour: color,
            triggers: triggers
        };
        tiles.push(newTile);
        renderer.updateColours();

        return newTile;
    }

    let headerHeight = $state(0);
</script>

<svelte:head>
    {#if sharedSave}
        <title>{sharedSave.name} - zelo's ant</title>
    {:else}
        <title>zelo's ant</title>
    {/if}
</svelte:head>

<header class="flex items-end gap-3 text-xs font-medium" bind:clientHeight={headerHeight}>
    <img
        src={zelosAntLogo}
        alt="Zelos Ant Logo"
        width={164 / DPR}
        class="mt-3 ml-3 hue-rotate-280"
        style="image-rendering: pixelated;"
    />
    <Link href="https://github.com/Zolo101/zelos_ant">2.0.0</Link>
    <span>•</span>
    <Link href="https://discord.gg/YVuuF9KB5j">Discord</Link>
    <span>•</span>
    <button onclick={() => saveSnapshot(saves, renderer!, workspace!, canvas!)}>Save</button>
    <span>•</span>
    <button onclick={() => (showSaves = !showSaves)}>Load</button>
    <span>•</span>
    <button onclick={resetWorkspace}>Reset</button>
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
<main class="flex p-3">
    <div class="grow">
        <div class="relative h-full w-full">
            <div
                class="absolute top-0 left-0 w-full"
                id="blockly"
                style="height: {innerHeight.current! - headerHeight - 24}px;"
            ></div>
            {#if showSaves}
                <div
                    transition:fade={{ duration: 100 }}
                    class="absolute top-0 left-0 z-[99999] w-full overflow-auto"
                    style="height: {innerHeight.current! - headerHeight - 24}px;"
                >
                    <Saves {game} {saves} {renderer} {workspace} {pb} />
                </div>
            {/if}
        </div>
    </div>
    <div class="flex max-w-1/2 flex-col gap-2" style="width: {width / DPR}px;">
        <Stats {game} />
        <canvas
            bind:this={canvas}
            style="max-height: {height / DPR}px; max-width: {width / DPR}px;"
            class="outline outline-white/10"
            id="canvas"
            {width}
            {height}
        ></canvas>
        <Tiles {addTile} {removeTile} />
        <Controls {renderer} {iterate} {game} />
    </div>
</main>
