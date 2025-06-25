<script lang="ts">
    import { onMount } from "svelte";
    import * as Blockly from "blockly";
    import Stats from "../component/Stats.svelte";
    import Controls from "../component/page/Controls.svelte";
    import { javascriptGenerator } from "blockly/javascript";
    import Game from "../ant/Game.svelte";
    import {
        turnJSON,
        lookJSON,
        onJSON,
        moveJSON,
        iterationJSON,
        createAntJSON,
        injectOptions,
        defaultBlockly,
        incrementJSON
    } from "../ant/blockly";
    import { addBlockToBlockly } from "../ant/blocklypain";
    import Renderer from "../ant/render/webgl2";
    import { height, tiles, width, type Save } from "../ant/stores.svelte";
    import type { WorkspaceSvg } from "blockly";
    import Tiles from "../component/page/Tiles.svelte";
    import Tile from "../ant/tile";
    import Saves from "../component/page/Saves.svelte";
    import zelosAntLogo from "$lib/assets/zelos_ant.png";
    import Link from "../component/Link.svelte";
    import sync from "../ant/sync.svelte";
    import { devicePixelRatio, innerHeight } from "svelte/reactivity/window";
    import { fade } from "svelte/transition";

    let canvas: HTMLCanvasElement | null = $state(null);
    let workspace: WorkspaceSvg | null = $state(null);
    let renderer: Renderer | null = $state(null);
    let DPR = $state(devicePixelRatio.current ?? 1);
    let showSaves = $state(false);

    let saves: Save[] = sync("ant-saves", []);
    onMount(() => {
        const gl2 = canvas!.getContext("webgl2") as WebGL2RenderingContext;

        renderer = new Renderer(gl2);
        Game.clear();

        Game.addTile(renderer, [0, 0, 0], ["turn right"]);
        Game.addTile(renderer, [255, 255, 255], ["turn left"]);

        Game.board.addAnt(Game.board.width / 2, Game.board.height / 2);

        console.log(tiles, Game.tileTriggers, Game.board.ants);

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
                return `// On tile ${number_tileid}\nGame.tileTriggers.set(${number_tileid}, (ant) => {\n${statements_name}});\n`;
            }
        });

        addBlockToBlockly({
            name: "move",
            json: moveJSON,
            tooltip: (block) => {
                return `Moves the ant forward by ${block.getFieldValue("NAME")}.`;
            },
            onRun: (block: Blockly.Block) => {
                const amount = javascriptGenerator.valueToCode(
                    block,
                    "NAME",
                    javascriptGenerator.ORDER_ADDITION
                );
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
                const amount = javascriptGenerator.valueToCode(
                    block,
                    "NAME",
                    javascriptGenerator.ORDER_ADDITION
                );
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
                return `// On iteration\nGame.onEachIteration = (ant) => {\n${statements_name}}\n`;
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
                    javascriptGenerator.valueToCode(block, "X", javascriptGenerator.ORDER_ADDITION),
                    javascriptGenerator.valueToCode(block, "Y", javascriptGenerator.ORDER_ADDITION)
                ];
                return `Game.board.addAnt(${x}, ${y});\n`;
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
                e.type === Blockly.Events.BLOCK_MOVE
            ) {
                const newCode = javascriptGenerator.workspaceToCode(workspace!);
                if (newCode === code) return;

                if (e.type === Blockly.Events.BLOCK_MOVE) {
                    if (newCode !== code) {
                        if (e?.reason[0] === "disconnect" || e?.reason[0] === "connect") {
                            return;
                        }
                    } else return;
                }
                code = newCode;
                console.log("reset!");

                // Debug
                // TODO: Debug in dev environment?
                if (document.getElementById("code")) {
                    document.getElementById("code")!.innerText = code;
                }

                Game.tileTriggers.clear();
                Game.restart();
                try {
                    // eval for now (its slow)
                    eval(code);
                } catch (er) {
                    console.error("eval error", er);
                }
            }
        });
        Blockly.serialization.workspaces.load(defaultBlockly, workspace);

        window.addEventListener("keydown", (e: KeyboardEvent) => {
            switch (e.code) {
                case "KeyR":
                    Game.restart();
                    break;

                case "KeyP":
                    Game.instance.paused = !Game.instance.paused;
                    break;
            }
        });
        window.requestAnimationFrame(frame);
    });

    const randomColour = (): Tile["colour"] => [
        ~~(Math.random() * 255),
        ~~(Math.random() * 255),
        ~~(Math.random() * 255)
    ];

    function addTile() {
        Game.addTile(renderer!, randomColour(), ["turn left"]);

        const block = workspace!.newBlock("on");
        block.setFieldValue(tiles.size - 1, "TileID");
        block.initSvg();
        block.render();

        const turnBlock = workspace!.newBlock("turn");
        turnBlock.setFieldValue("Left", "Directions");
        turnBlock.initSvg();
        turnBlock.render();

        // console.log(block.getInput("NAME").connection, turnBlock.previousConnection)
        block.getInput("NAME")!.connection!.connect(turnBlock.previousConnection);

        workspace!.render();
        Game.restart();
    }

    function frame() {
        if (!Game.instance.updateInProgress && !Game.instance.paused) Game.tick(renderer!, iterate);
        renderer!.render();

        window.requestAnimationFrame(frame);
    }

    function iterate() {
        for (const ant of Game.board.ants) {
            // Move
            Game.onEachIteration(ant);

            const cell = Game.board.getCell(ant.position.x, ant.position.y);

            // Attempt to run the trigger function if exists
            Game.tileTriggers.get(cell)?.(ant);
        }
    }

    let headerHeight = $state(0);
</script>

<header class="flex items-end gap-3 text-xs font-medium" bind:clientHeight={headerHeight}>
    <img
        src={zelosAntLogo}
        alt="Zelos Ant Logo"
        width={164 / DPR}
        class="mt-3 ml-3 hue-rotate-280"
        style="image-rendering: pixelated;"
    />
    <p>2.0.0</p>
    <span>•</span>
    <Link href="https://github.com/Zolo101/zelos_ant">GitHub</Link>
    <span>•</span>
    <button onclick={() => (showSaves = !showSaves)}>Saved Rules</button>
</header>
<main class="flex gap-3 p-3">
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
                    <Saves {saves} {renderer} {workspace} {canvas} />
                </div>
            {/if}
        </div>
    </div>
    <div class="flex max-w-1/2 flex-col gap-2" style="width: {width / DPR}px;">
        <Stats />
        <canvas
            bind:this={canvas}
            style="max-height: {height / DPR}px; max-width: {width / DPR}px;"
            class="outline outline-white/10"
            id="canvas"
            {width}
            {height}
        ></canvas>
        <Tiles {addTile} />
        <Controls {renderer} {iterate} />
    </div>
</main>
