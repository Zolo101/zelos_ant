<script lang="ts">
    const { game } = $props();
    let antPural = $derived(game.board.ants.length > 1 ? "ants" : "ant");
</script>

<div class="flex w-full justify-between px-5">
    <p>
        Each tick takes {game.fps.toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2
        })}ms
    </p>
    <p>{game.board.ants.length} {antPural} moving around</p>
    <p>Iterations: {game.iterations.toLocaleString()}</p>
</div>
