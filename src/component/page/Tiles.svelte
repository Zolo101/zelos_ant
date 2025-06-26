<script lang="ts">
    import Game from "../../ant/Game.svelte";
    import TilesTile from "../TilesTile.svelte";
    import { tiles } from "../../ant/stores.svelte";
    import type { Tile } from "../../ant/stores.svelte";

    const { addTile } = $props();

    const removeTile = (tile: Tile) => {
        // Must be at least one tile
        if (tiles.length - 1 === 0) return;

        tiles.splice(tiles.indexOf(tile), 1);
        Game.restart();
    };
</script>

<section class="rounded bg-purple-950/40 p-2">
    <p class="text-left text-sm font-medium text-purple-300">Manage Tiles</p>
    <div class="my-2 flex flex-row flex-wrap content-start gap-2">
        {#each tiles as tile, index}
            <TilesTile {tile} {index} onclick={() => removeTile(tile)} />
        {/each}
        <button
            onclick={addTile}
            class="flex h-10 w-10 cursor-pointer bg-black font-bold text-purple-200 outline-1 outline-purple-500"
        >
            <span class="m-auto text-xl">+</span>
        </button>
    </div>
</section>
