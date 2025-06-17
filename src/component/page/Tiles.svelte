<script lang="ts">
    import Game from "../../ant/game.svelte";
    import TilesTile from "../TilesTile.svelte";
    import { newTileEvent, updateTileEvent } from "../../ant";
    import { onMount } from "svelte";
    import Button from "../Button.svelte";
    import { colours, tiles } from "../../ant/stores.svelte";
    import type Tile from "../../ant/tile";

    const randomColour = () => [
        ~~(Math.random() * 255),
        ~~(Math.random() * 255),
        ~~(Math.random() * 255)
    ];

    let x;
    const addTile = () => {
        Game.addTile(randomColour(), ["turn left"]);
        window.dispatchEvent(updateTileEvent);
        window.dispatchEvent(newTileEvent);
        Game.restart();
    };

    const removeTile = (tile: Tile) => {
        // Must be at least one tile
        if (tiles.size - 1 === 0) return;

        tiles.delete(tile);
        colours.delete(tile.colour);
        // tiles1 = Array.from(Game.tiles.values());
        window.dispatchEvent(updateTileEvent);
        Game.restart();
    };

    // TODO: Temporary
    // window.addEventListener("updateTile", () => (x = (x + 1) & 3));

    onMount(() => window.dispatchEvent(updateTileEvent));
</script>

<div
    class="flex h-160 max-w-160 flex-row flex-wrap content-start gap-2 overflow-auto bg-gray-200 p-2"
>
    {#each tiles as tile, index}
        <TilesTile {tile} {index} onclick={() => removeTile(tile)} />
    {/each}
</div>
<Button onclick={addTile}>+</Button>

<!-- 
<style>
    .tiles {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        height: 400px;
        max-width: 800px;
        max-height: 400px;
        overflow: auto;
        background-color: #bbb;
    }

    .tile-container {
        display: flex;
        flex-direction: row;
        margin: 10px;
        align-items: center;
        /*max-height: 10px;*/
    }

    .add {
        padding: 5px 10px;

        font-weight: bold;
        text-align: center;
        background-color: #ddd;
        outline: 1px solid black;
        max-width: 800px;
        cursor: pointer;
    }

    .add:hover {
        background-color: #ccc;
    }

    .remove {
        position: relative;
        top: 20px;
        left: 20px;
        padding: 2px 4px;

        /*font-weight: bold;*/
        text-align: center;
        background-color: rgba(219, 112, 147, 0.75);
        outline: 1px solid red;
        cursor: pointer;
    }
</style> -->
