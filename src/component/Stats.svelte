<script lang="ts">
    import Game from "../ant/Game.svelte";

    const { fps } = $props();
    let antPural = $derived(Game.board.ants.length > 1 ? "ants" : "ant");
</script>

<div class="flex w-full justify-between px-5">
    <p>
        Each tick takes {fps.toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2
        })}ms
    </p>
    <p>{Game.board.ants.length} {antPural} moving around</p>
    <p>Iterations: {Game.instance.iterations.toLocaleString()}</p>
</div>
