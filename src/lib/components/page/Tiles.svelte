<script lang="ts">
    import { tiles, type RGB, type Tile } from "$lib/stores.svelte";
    import type Renderer from "$lib/render/webgl2.svelte";
    import { rgbToHex } from "$lib/util";
    import type { WorkspaceSvg } from "blockly";
    import Game from "$lib/Game.svelte";

    let {
        renderer,
        workspace
    }: {
        renderer: Renderer;
        workspace: WorkspaceSvg;
    } = $props();

    let advanced = $derived(Game.instance.settings.advancedMode);
    let canAdd = $derived(tiles.length < 7 || advanced);
    const missingTileDisabledReason = "missing-tile";

    function randomColour(): RGB {
        return [~~(Math.random() * 255), ~~(Math.random() * 255), ~~(Math.random() * 255)];
    }

    function findOnTileBlock(workspace: WorkspaceSvg, index: number) {
        for (const block of workspace.getAllBlocks()) {
            if (block.getFieldValue("TileID") === index) {
                return block;
            }
        }
        return null;
    }

    function updateOnTileBlocks() {
        for (const block of workspace.getBlocksByType("on", false)) {
            const tileId = Number(block.getFieldValue("TileID"));
            const tile = tiles[tileId];

            block.setDisabledReason(!tile, missingTileDisabledReason);

            if (tile) {
                const colour = rgbToHex(...tile.colour);
                if (block.getFieldValue("COLOUR") !== colour) {
                    block.setFieldValue(colour, "COLOUR");
                }
            }
        }
    }

    $effect(() => {
        // Keep validity in sync when tiles are replaced while loading a save.
        updateOnTileBlocks();
    });

    function addTile(addBlocks: boolean = true) {
        if (!canAdd) return;

        const newTile = {
            colour: randomColour(),
            triggers: ["turn left"]
        };
        tiles.push(newTile);
        renderer.updateColours();

        if (addBlocks) {
            // Check if the block already exists
            const existingBlock = findOnTileBlock(workspace, tiles.length - 1);
            const tile = tiles[tiles.length - 1];
            if (existingBlock) {
                existingBlock.setFieldValue(rgbToHex(...tile.colour), "COLOUR");
            } else {
                const block = workspace.newBlock("on");
                block.setFieldValue(tiles.length - 1, "TileID");

                block.setFieldValue(rgbToHex(...tile.colour), "COLOUR");
                block.initSvg();
                block.render();

                const turnBlock = workspace.newBlock("turn");
                turnBlock.setFieldValue("Left", "Directions");
                turnBlock.initSvg();
                turnBlock.render();
                // console.log(block.getInput("NAME").connection, turnBlock.previousConnection)
                block.getInput("NAME")!.connection!.connect(turnBlock.previousConnection);
            } // derive a formula

            updateOnTileBlocks();
            workspace.render();
            Game.restart(renderer);
        }
    }

    function removeTile(tile: Tile) {
        if (tiles.length <= 1) return;

        tiles.splice(tiles.indexOf(tile), 1);
        updateOnTileBlocks();
        Game.restart(renderer);
    }

    const shouldUseLightText = (tile: Tile) => {
        const [r, g, b] = tile.colour;
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        return luminance < 0.5;
    };

    const textColor = (tile: Tile) => (shouldUseLightText(tile) ? "white" : "black");

    let selectedTileIndex = $state(0);
    let selectedTile = $derived(tiles[selectedTileIndex]);
    let selectedTileColour = $derived(rgbToHex(...selectedTile.colour));
    let colourEditor = $state<HTMLDivElement>();

    type EmbeddedColourField = {
        createDropdownSliders(): void;
        dropdownDisposeSliders(): void;
        dropdownContainer: HTMLDivElement | null;
        updateSliderValues(): void;
    };

    $effect(() => {
        if (!colourEditor || !selectedTile) return;

        const block = findOnTileBlock(workspace, selectedTileIndex);
        const field = block?.getField("COLOUR") as unknown as EmbeddedColourField | undefined;
        if (!field) return;

        // The Blockly plugin normally puts this element in DropDownDiv. Keeping
        // the field itself means its native events still update the workspace.
        field.createDropdownSliders();
        const editor = field.dropdownContainer;
        if (!editor) return;

        colourEditor.replaceChildren(editor);
        field.updateSliderValues();

        return () => {
            field.dropdownDisposeSliders();
            editor.remove();
        };
    });
</script>

<section class="relative flex flex-col gap-1 text-lg z-100 rounded">
    <p class="text-center text-violet-100">Tiles</p>
    <div class="flex flex-row flex-wrap *:grow gap-3">
        {#each tiles as tile, index (index)}
            <button
                class={[
                    "flex font-black rounded outline-2 outline-black",
                    index === selectedTileIndex &&
                        "outline-transparent! ring-3 ring-inset ring-orange-400",
                    advanced ? "w-10 h-10 text-2xl" : "w-15 h-15 text-4xl"
                ]}
                style="background-color: {rgbToHex(...tile.colour)};"
                onclick={() => (selectedTileIndex = index)}
            >
                <span class="m-auto" style:color={textColor(tile)}>{index}</span>
            </button>
        {/each}
        {#if canAdd}
            <button
                onclick={() => addTile(true)}
                class={[
                    "flex cursor-pointer rounded bg-violet-400 font-bold text-violet-200 outline-1 outline-violet-500 dark:bg-violet-900 dark:outline-violet-900",
                    advanced ? "w-10 h-10 text-4xl" : "w-15 h-15 text-6xl"
                ]}
            >
                <span class="relative bottom-1.5 m-auto">+</span>
            </button>
        {/if}
    </div>
    {#if selectedTile}
        <div class="mt-2 flex flex-wrap items-start gap-3">
            <div
                bind:this={colourEditor}
                class="rounded bg-white p-1 text-base shadow dark:bg-violet-950"
                aria-label="Colour editor for tile {selectedTileIndex}"
            ></div>
            <!-- <p>Selected tile: {selectedTileIndex}</p> -->
            <div class="flex justify-around">
                <button
                    class="rounded bg-violet-400 px-3 py-2 text-violet-200 hover:bg-violet-500 dark:bg-violet-900 dark:hover:bg-violet-800"
                    onclick={() => removeTile(selectedTile)}>Delete</button
                >
            </div>
        </div>
    {/if}
</section>
