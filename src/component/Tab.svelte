<script lang="ts">
    import Tiles from "./page/Tiles.svelte";
    import Controls from "./page/Controls.svelte";
    import Credits from "./page/Credits.svelte";
    import Saves from "./page/Saves.svelte";

    let page = 1;
</script>

{#snippet button(text: string, pg: number)}
    <button
        class="cursor-pointer rounded px-3 py-1 outline-2 outline-white"
        on:click={() => (page = pg)}>{text}</button
    >
{/snippet}

<div class="flex flex-row gap-2">
    {@render button("Editor", 0)}
    {@render button("Controls", 3)}
    {@render button("Tiles", 1)}
    {@render button("Saves", 2)}
    {@render button("About", 4)}
    <!--    <p class="button" on:click={() => page = 5}>Debug</p>-->
</div>
<div class="mt-2">
    <div
        class:hidden={page !== 0}
        class="blockly"
        id="blockly"
        style="width: 1000px; height: 800px"
    ></div>
    <div class:hidden={page !== 1}><Tiles /></div>
    <div class:hidden={page !== 2}><Saves /></div>
    <div class:hidden={page !== 3}><Controls /></div>
    <div class:hidden={page !== 4}><Credits /></div>
    <!--        <div class:hidden={page !== 5}><pre id="code"></pre></div>-->
</div>

<style>
    .hidden {
        display: none;
    }
</style>
