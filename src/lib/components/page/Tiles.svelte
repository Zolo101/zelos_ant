<script lang="ts">
    import TilesTile from "../TilesTile.svelte";
    import { tiles } from "$lib/stores.svelte";

    const { addTile, removeTile } = $props();
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
