<script lang="ts">
    import Game from "../../ant/game.svelte";
    import { liveQuery } from "dexie";
    import { db } from "../../ant/db";
    import Screen from "../Screen.svelte";
    import Line from "../Line.svelte";
    import Save from "../../ant/save";

    const saves = liveQuery(() => db.saves.toArray());
    const dateOptions = { day: "numeric", month: "long", year: "numeric" };

    const fColour = (id: number) => {
        const tile = $saves[id - 1].tile[0];
        const [red, green, blue] = tile ? tile.colour : [255, 255, 255];
        return `rgb(${red}, ${green}, ${blue})`;
    };

    const bColour = (id: number) => {
        const tile = $saves[id - 1].tile[1];
        const tile0Colour = $saves[id - 1].tile[0].colour;
        const inverse = [255 - tile0Colour[0], 255 - tile0Colour[1], 255 - tile0Colour[2]];
        const [red, green, blue] = tile ? tile.colour : inverse;
        return `rgb(${red}, ${green}, ${blue})`;
    };

    const loadSave = (save: Save) => {
        Game.loadSnapshot(save);
    };
</script>

<div class="button save-btn" on:click={() => Game.saveSnapshot()}>Save</div>
<Line />
<br />
<!--    <div class="button control" on:click={() => Game.loadFromLocalStorage()}>Load</div>-->
<!--        <div class="button control" on:click={() => Game.paused = !Game.paused}>Export</div>-->
<!--        <div class="button control" on:click={() => Game.paused = !Game.paused}>Import</div>-->
<div class="saves">
    {#if $saves}
        {#each $saves as save (save.id)}
            <div class="save" on:click={() => loadSave(save)}>
                <Screen
                    id={save.id}
                    src={save.src}
                    width={800}
                    height={800}
                    scale={0.16}
                    sx={340}
                    sy={320}
                />
                <p
                    class="save-name"
                    style="background-color: {fColour(save.id)}; color: {bColour(save.id)}"
                >
                    {save.name}
                </p>
                <p class="save-date">{save.date.toLocaleDateString("en-GB", dateOptions)}</p>
                <div class="save-delete">
                    <!--                <button onclick="Game.deleteSave('{save.id}')">Delete</button>-->
                </div>
            </div>
        {/each}
    {/if}
</div>

<style>
    p {
        margin: 0;
    }

    .saves {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
        grid-auto-rows: 1fr;
        grid-gap: 10px;
    }

    .save {
        border-radius: 2px;
        cursor: pointer;
    }

    .save:hover {
        background-color: #888;
    }

    .save-btn {
        width: 500px;
    }

    .save-name {
        text-align: center;
        padding: 3px 0;
        font-weight: bold;
        text-overflow: ellipsis;
        overflow-x: hidden;
        /*-webkit-text-stroke: .3px whitesmoke;*/
        /*text-shadow: 0px 0px 10px 1px #fff;*/
    }

    .save-date {
        text-align: center;
        padding: 3px;
        font-size: 0.8em;
    }
</style>
