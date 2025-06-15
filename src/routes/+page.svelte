<script lang="ts">
    import { onMount } from "svelte";
    import { main } from "../ant";
    import Tab from "../component/Tab.svelte";
    import Alert from "../component/Alert.svelte";
    import Stats from "../component/Stats.svelte";

    onMount(() => {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        const ctx = canvas.getContext("canvas") as CanvasRenderingContext2D;
        const gl2 = canvas.getContext("webgl2") as WebGL2RenderingContext;
        main(canvas, ctx, gl2);
    });
</script>

<div class="main">
    <div class="top">
        <div class="viewer-editor">
            <canvas id="canvas" width="800" height="800"></canvas>
        </div>
        <div class="right">
            <Stats />
            <Tab />
        </div>
    </div>
</div>
<Alert />

<style>
    .main {
        display: flex;
        flex-direction: column;
        padding: 10px;
    }

    .right {
        display: flex;

        flex-direction: column;
        overflow-y: auto;
        flex-grow: 1;
        margin: 0 10px;
        padding: 1px;
    }

    pre {
        outline: 1px solid black;
        background-color: lightgrey;
        max-width: 300px;
        max-height: 300px;
        overflow: auto;
        padding: 10px;
    }

    .top {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .end {
        flex-grow: 1;
    }

    .viewer-editor {
        display: flex;
        flex-direction: row;
    }
</style>
