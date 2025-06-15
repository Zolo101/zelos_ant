<script lang="ts">
    import Game from "../ant/game";
    import { sum } from "ramda";

    export let avgms = 0;
    export let ant = 0;

    setInterval(() => {
        avgms = sum(Game.fpsHistory) / Game.fpsHistory.length;
        ant = Game.board.ants.length;
        // avgiterationms = ((avgms / Game.iterationsPerTick) * 1000)
    }, 100);

    $: antPural = ant > 1 ? "ants" : "ant";
</script>

<div class="stats">
    {#key avgms}
        <!--        <p>each tick takes {avgms}ms, each iteration takes {avgiterationms}µs</p>-->
        <p>
            Each tick takes {avgms.toLocaleString(undefined, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3
            })}ms
        </p>
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
