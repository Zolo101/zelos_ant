<script lang="ts">
    import Tile from "../ant/tile";
    import Game from "../ant/game";

    export let tile: Tile;
    export let index: number;
    let rgbColor = `rgb(${tile.colour[0]},${tile.colour[1]},${tile.colour[2]})`

    let len = tile.triggers.length
    const addTrigger = () => {
        tile.triggers.push("turn left")
        len = tile.triggers.length;

        Game.restart();
    };

    const removeTrigger = (index: number) => {
        tile.triggers.splice(index, 1);
        len = tile.triggers.length;

        Game.restart();
    };
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

    .properties {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .add {
        padding: 10px 15px;

        font-weight: bold;
        text-align: center;
        background-color: lightgrey;
        outline: 1px solid black;
        cursor: pointer;
    }

    .remove {
        padding: 5px 10px;

        font-weight: bold;
        text-align: center;
        background-color: palevioletred;
        outline: 1px solid red;
        cursor: pointer;
    }

    .dropdown-container {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
</style>