<script lang="ts">
    import Tiles from "./page/Tiles.svelte";
    import Controls from "./page/Controls.svelte";
    import Credits from "./page/Credits.svelte";
    import Saves from "./page/Saves.svelte";

    let page = 0;
</script>

<div class="header">
    <p class="button" on:click={() => (page = 0)}>Editor</p>
    <p class="button" on:click={() => (page = 1)}>Tiles</p>
    <p class="button" on:click={() => (page = 2)}>Saves</p>
    <p class="button" on:click={() => (page = 3)}>Settings</p>
    <p class="button" on:click={() => (page = 4)}>About</p>
    <!--    <p class="button" on:click={() => page = 5}>Debug</p>-->
</div>
<div>
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
    .header {
        display: flex;
        flex-direction: row;
    }

    .hidden {
        display: none;
    }

    .blockly {
        outline: 1px solid black;
    }
</style>
