<script lang="ts">
    import SaveComponent from "./SaveComponent.svelte";

    let { game, gameState, saves, renderer, workspace } = $props();

    const localStorageSaveSize = JSON.stringify(saves).length / 1024 / 1024;
    const localStorageSaveLimit = 5; // 5MB
</script>

<!-- 0.275 -->
<div class="flex w-full items-center gap-1 bg-black p-2 text-sm">
    <span>Save Limit:</span>
    <span>
        {localStorageSaveSize.toLocaleString("en-US", {
            style: "unit",
            unit: "megabyte",
            unitDisplay: "narrow"
        })}
    </span>
    <span>/</span>
    <span>
        {localStorageSaveLimit.toLocaleString("en-US", {
            style: "unit",
            unit: "megabyte",
            unitDisplay: "narrow"
        })}
    </span>
</div>
<section class="flex h-full flex-wrap content-start gap-3 bg-black/70 p-2 backdrop-blur-xs">
    {#each saves as _, index}
        <SaveComponent {game} {gameState} {renderer} {workspace} {saves} {index} />
    {/each}
</section>
