<script lang="ts">
    import Game from "../../ant/game";
    import Button from "../Button.svelte";

    let sliderValue = $state(0);
    let controlText = $derived(Game.paused ? "Resume" : "Pause");

    function formatIterations(iterations: number): string {
        return iterations.toLocaleString();
    }

    function getsliderValue(): number {
        return Math.floor(Math.pow(10, sliderValue));
    }
</script>

<div class="flex flex-col gap-2">
    <div class="main">
        <Button
            onclick={() => {
                Game.restart();
                Game.paused = false;
            }}
        >
            Restart (R)
        </Button>
        <Button onclick={() => (Game.paused = !Game.paused)}>
            {controlText} (P)
        </Button>
    </div>
    <div class="tickspeed">
        <input
            type="range"
            min="0"
            max="6"
            step=".1"
            bind:value={sliderValue}
            class="w-full"
            oninput={() => (Game.iterationsPerTick = getsliderValue())}
        />
        <div class="text-center">
            {formatIterations(getsliderValue())} <span class="font-serif font-bold">I/t</span>
        </div>
        <Button onclick={() => Game.tick()}>One Tick</Button>
    </div>
</div>
