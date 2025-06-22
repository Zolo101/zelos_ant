<script lang="ts">
    import { onMount } from "svelte";
    import { main } from "../ant";
    import Tab from "../component/Tab.svelte";
    import Alert from "../component/Alert.svelte";
    import Stats from "../component/Stats.svelte";
    import Controls from "../component/page/Controls.svelte";

    let canvas: HTMLCanvasElement;
    onMount(() => {
        // const dpr = window.devicePixelRatio || 1;
        const gl2 = canvas.getContext("webgl2") as WebGL2RenderingContext;
        main(canvas, gl2);
    });
</script>

<main class="flex gap-3 p-3">
    <div class="flex w-1/2 flex-col">
        <canvas
            bind:this={canvas}
            class="outline outline-white/10"
            id="canvas"
            width="800"
            height="800"
        ></canvas>
        <Stats />
        <Controls />
    </div>
    <div class="w-1/2">
        <Tab />
    </div>
</main>

<Alert />
