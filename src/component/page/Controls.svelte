<script lang="ts">
    import { restartGame, tick } from "../../ant/stores.svelte";
    import Button from "../Button.svelte";

    let { renderer, iterate, game } = $props();

    let sliderValue = $state(Math.log10(game.iterationsPerTick));
    let controlText = $derived(game.paused ? "Resume" : "Pause");

    function formatIterations(iterations: number): string {
        return iterations.toLocaleString();
    }

    function getsliderValue(): number {
        return Math.floor(Math.pow(10, sliderValue));
    }

    function oneTick() {
        game.fps = tick(game, renderer!, iterate);
    }
</script>

<div class="flex flex-col gap-2">
    <div class="tickspeed">
        <input
            type="range"
            min="0"
            max="6"
            step=".1"
            bind:value={sliderValue}
            class="w-full"
            oninput={() => (game.iterationsPerTick = getsliderValue())}
        />
        <div class="text-center">
            {formatIterations(getsliderValue())} <span class="font-serif font-bold">I/t</span>
        </div>
    </div>
    <div class="flex flex-row gap-2">
        <Button onclick={() => (game.paused = !game.paused)}>
            {controlText} (P)
        </Button>
        <Button
            onclick={() => {
                restartGame(game);
                game.paused = false;
            }}
        >
            Restart (R)
        </Button>
        <Button onclick={oneTick}>One Tick (T)</Button>
    </div>
    <!-- <pre id="code" class="text-xs"></pre> -->
</div>
