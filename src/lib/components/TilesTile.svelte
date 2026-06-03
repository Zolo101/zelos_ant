<script lang="ts">
    import type { Tile } from "$lib/stores.svelte";

    const { tile, index, onclick }: { tile: Tile; index: number; onclick: () => void } = $props();
    let rgbColor = $derived(`rgb(${tile.colour[0]},${tile.colour[1]},${tile.colour[2]})`);

    const shouldUseLightText = $derived.by(() => {
        const [r, g, b] = tile.colour;
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        return luminance < 0.5;
    });

    const textColor = $derived(shouldUseLightText ? "white" : "black");
</script>

<button
    class="flex h-10 w-10 font-bold outline-1 outline-black"
    style="background-color: {rgbColor}"
    {onclick}
>
    <span class="m-auto text-xl" style:color={textColor}>{index}</span>
</button>
