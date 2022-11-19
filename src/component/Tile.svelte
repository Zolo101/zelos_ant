<script lang="ts">
    import Tile from "../ant/tile";

    export let tile: Tile;
    export let index: number;
    let rgbColor = `rgb(${tile.colour[0]},${tile.colour[1]},${tile.colour[2]})`
</script>

<div class="tile" style="background-color: {rgbColor}">
    <span class="name">{index}</span>
</div>

<style>
    .tile {
        height: 50px;
        width: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 5px;
        outline: 2px solid rgba(0, 0, 0, 0.5);
    }

    .name {
        color: ghostwhite;
        font-size: 2em;
        font-weight: bold;
        -webkit-text-stroke: 1px black;
    }
</style>