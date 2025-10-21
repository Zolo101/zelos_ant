<script lang="ts">
    import type { Tile } from "$lib/stores.svelte";

    const { tile, index, onclick }: { tile: Tile; index: number; onclick: () => void } = $props();
    let rgbColor = $derived(`rgb(${tile.colour[0]},${tile.colour[1]},${tile.colour[2]})`);

    const shouldInvert = $derived(() => {
        const [r, g, b] = tile.colour;
        // Calculate relative luminance using the formula: 0.299R + 0.587G + 0.114B
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        // Use white text for dark backgrounds (luminance < 0.5) and black text for light backgrounds
        return luminance >= 0.5;
    });
</script>

<button
    class="flex h-10 w-10 font-bold outline-1 outline-black"
    style="background-color: {rgbColor}"
    {onclick}
>
    <span class="m-auto text-xl" class:invert={shouldInvert()}>{index}</span>
</button>

<style>
    .invert {
        color: ghostwhite;
    }
</style>
