<script lang="ts">
    const { id, src, width, height, scale = 1 } = $props();
</script>

<img alt="" id="screen-{id}" {src} width={width * scale} height={height * scale} />

<style>
    img {
        image-rendering: pixelated;
    }
</style>
