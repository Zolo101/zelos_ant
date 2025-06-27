<script lang="ts">
    import SaveComponent from "./SaveComponent.svelte";

    let { game, saves, renderer, workspace, pb } = $props();
</script>

<!-- 0.275 -->
<section class="flex h-full flex-wrap content-start gap-3 bg-black/70 p-2 backdrop-blur-xs">
    {#each saves as _, index}
        <SaveComponent {game} {saves} {index} {renderer} {workspace} {pb} />
    {/each}
</section>
