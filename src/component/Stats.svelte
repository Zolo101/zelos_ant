<script lang="ts">
    import Game from "../ant/game";

    export let avgms;
    export let ant;

    $: antPural = ant > 1 ? "ants" : "ant";
</script>

<div class="stats">
    {#key avgms}
        <!--        <p>each tick takes {avgms}ms, each iteration takes {avgiterationms}µs</p>-->
        <p>Each tick takes {avgms.toLocaleString()}ms</p>
        <p>{ant} {antPural} moving around</p>
        <p>Iterations: {Game.iterations.toLocaleString()}</p>
    {/key}
</div>

<style>
    .stats {
        display: flex;
        flex-direction: row;
    }

    .stats p {
        margin: 10px 50px;
    }
</style>