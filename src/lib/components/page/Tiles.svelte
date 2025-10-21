<script lang="ts">
    import TilesTile from "../TilesTile.svelte";
    import {
        restartGame,
        tiles,
        type Game,
        type GameState,
        type RGB,
        type Tile
    } from "$lib/stores.svelte";
    import type Renderer from "$lib/render/webgl2.svelte";
    import { rgbToHex } from "$lib/util";
    import type { WorkspaceSvg } from "blockly";

    let {
        game,
        gameState,
        renderer,
        workspace
    }: {
        game: Game;
        gameState: GameState;
        renderer: Renderer;
        workspace: WorkspaceSvg;
    } = $props();

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

    // This is O(n^2). In my tests it only causes noticable lag after 100 tiles.
    // OFC it can be O(n). If someone complains, I will optimise it.
    function updateTileColours() {
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            const block = findOnTileBlock(workspace, i);
            if (block) {
                block.setFieldValue(rgbToHex(...tile.colour), "COLOUR");
            }
        }
    }

    function addTile(addBlocks: boolean = true) {
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

            workspace.render();
            restartGame(game, gameState);
        }
    }

    function removeTile(tile: Tile) {
        if (tiles.length > 1) return;

        // Remove the block
        tiles.splice(tiles.indexOf(tile), 1);
        updateTileColours();
        restartGame(game, gameState);
    }
</script>

<section class="relative z-100 rounded bg-purple-950/40 p-2">
    <p class="text-left text-sm font-medium text-purple-300">Manage Tiles</p>
    <div class="my-2 flex flex-row flex-wrap content-start gap-2">
        {#each tiles as tile, index}
            <TilesTile {tile} {index} onclick={() => removeTile(tile)} />
        {/each}
        <button
            onclick={() => addTile(true)}
            class="flex h-10 w-10 cursor-pointer bg-black font-bold text-purple-200 outline-1 outline-purple-500"
        >
            <span class="m-auto text-xl">+</span>
        </button>
    </div>
</section>
