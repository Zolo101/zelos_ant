<script lang="ts">
    export let id: number;
    export let src: string;
    export let width: number;
    export let height: number;
    export let sx: number;
    export let sy: number;
    export let scale: number = 1;
</script>

<img id="screen-{id}" src={src} width={width * scale} height={height * scale}/>

<style>
    img {
        image-rendering: pixelated;
        margin: 2px;
    }
</style>