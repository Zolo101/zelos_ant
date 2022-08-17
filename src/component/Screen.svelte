<script lang="ts">
    import { createImage } from "../ant";
    import { onMount } from "svelte";

    export let id: number;
    export let image: Uint8ClampedArray;
    export let width: number;
    export let height: number;
    export let sx: number;
    export let sy: number;
    export let scale: number = 1;

    let canvas;
    onMount(() => {
        let ctx = canvas.getContext("2d", { alpha: false });
        createImage(ctx, image, width, height, sx, sy);
    })
</script>

<canvas
        id="screen-{id}"
        width={width * scale}
        height={height * scale}
        bind:this={canvas}
></canvas>

<style>
    canvas {
        margin: 2px;
    }
</style>