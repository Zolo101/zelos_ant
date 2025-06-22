<script lang="ts">
    import Game from "../../ant/Game.svelte";
    import TilesTile from "../TilesTile.svelte";
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
        // window.dispatchEvent(updateTileEvent);
        // window.dispatchEvent(newTileEvent);
        Game.restart();
    };

    const removeTile = (tile: Tile) => {
        // Must be at least one tile
        if (tiles.size - 1 === 0) return;

        tiles.delete(tile);
        colours.delete(tile.colour);
        // tiles1 = Array.from(Game.tiles.values());
        // window.dispatchEvent(updateTileEvent);
        Game.restart();
    };

    // TODO: Temporary
    // window.addEventListener("updateTile", () => (x = (x + 1) & 3));

    // onMount(() => window.dispatchEvent(updateTileEvent));
</script>

<div
    class="flex h-160 max-w-160 flex-row flex-wrap content-start gap-2 overflow-auto bg-gray-200 p-2"
>
    {#each tiles as tile, index}
        <TilesTile {tile} {index} onclick={() => removeTile(tile)} />
    {/each}
</div>
<Button onclick={addTile}>+</Button>
