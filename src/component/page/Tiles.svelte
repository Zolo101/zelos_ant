<script lang="ts">
    import Game from "../../ant/Game.svelte";
    import TilesTile from "../TilesTile.svelte";
    import { colours, tiles } from "../../ant/stores.svelte";
    import type Tile from "../../ant/tile";

    const { addTile }: { addTile: () => void } = $props();

    const removeTile = (tile: Tile) => {
        // Must be at least one tile
        if (tiles.size - 1 === 0) return;

        tiles.delete(tile);
        colours.delete(tile.colour);
        Game.restart();
    };
</script>

<div class="flex flex-row flex-wrap content-start gap-2 overflow-auto rounded bg-purple-950 p-2">
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
