<script lang="ts">
    import Game from "../ant/game";
    import Tile from "./Tile.svelte";
    import { newTileEvent } from "../ant";
    import { onMount } from "svelte";

    const randomColor = () => [~~(Math.random()*255),~~(Math.random()*255),~~(Math.random()*255)]

    let len;
    const addTile = () => {
        const newTile = Game.addTile(randomColor(), ["turn left"]);
        // tiles1 = Array.from(Game.tiles.values());
        len = Game.tiles.length

        window.dispatchEvent(newTileEvent)
        Game.restart();
    };

    const removeTile = (index: number) => {
        // Must be at least one tile
        if (Game.tiles.length - 1 === 0) return;

        Game.tiles.splice(index, 1)
        Game.colours.splice(index, 1)
        // tiles1 = Array.from(Game.tiles.values());
        len = Game.tiles.length

        Game.restart();
    };

    onMount(() => len = Game.tiles.length)
</script>

<div class="tiles">
    {#key len}
        {#each Game.tiles as tile, index}
            <div class="tile-container">
                <div class="remove" on:click={() => removeTile(index)}>X</div>
                <Tile {tile} {index}/>
            </div>
<!--            <Line/>-->
        {/each}
    {/key}
</div>
<div class="add" on:click={() => addTile()}>+</div>

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
</style>