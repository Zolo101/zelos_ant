<script lang="ts">
    import Tiles from "./Tiles.svelte";
    import Controls from "./Controls.svelte";
    import Stats from "./Stats.svelte";
    import Credits from "./Credits.svelte";

    // for stats
    export let avgms;
    export let ant;

    let page = 0;
</script>

<div class="header">
    <p class="button" on:click={() => page = 0}>Editor</p>
    <p class="button" on:click={() => page = 1}>Tiles</p>
    <p class="button" on:click={() => page = 2}>Settings</p>
    <p class="button" on:click={() => page = 3}>About</p>
<!--    <p class="button" on:click={() => page = 4}>Debug</p>-->
    <Stats avgms={avgms} ant={ant}/>
</div>
<div>
        <div class:hidden={page !== 0} class="blockly" id="blockly" style="width: 1000px; height: 800px"></div>
        <div class:hidden={page !== 1}><Tiles/></div>
        <div class:hidden={page !== 2}><Controls/></div>
        <div class:hidden={page !== 3}><Credits/></div>
<!--        <div class:hidden={page !== 4}><pre id="code"></pre></div>-->
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