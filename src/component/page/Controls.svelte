<script lang="ts">
    import Game from "../../ant/Game.svelte";
    import type Renderer from "../../ant/render/webgl2.svelte";
    import Button from "../Button.svelte";

    let {
        renderer,
        iterate,
        fps
    }: { renderer: Renderer | null; iterate: () => void; fps: number } = $props();

    let sliderValue = $state(Math.log10(Game.instance.iterationsPerTick));
    let controlText = $derived(Game.instance.paused ? "Resume" : "Pause");

    function formatIterations(iterations: number): string {
        return iterations.toLocaleString();
    }

    function getsliderValue(): number {
        return Math.floor(Math.pow(10, sliderValue));
    }

    function oneTick() {
        fps = Game.tick(renderer!, iterate);
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
            oninput={() => (Game.instance.iterationsPerTick = getsliderValue())}
        />
        <div class="text-center">
            {formatIterations(getsliderValue())} <span class="font-serif font-bold">I/t</span>
        </div>
    </div>
    <div class="flex flex-row gap-2">
        <Button onclick={oneTick}>One Tick (T)</Button>
        <Button onclick={() => (Game.instance.paused = !Game.instance.paused)}>
            {controlText} (P)
        </Button>
        <Button
            onclick={() => {
                Game.restart();
                Game.instance.paused = false;
            }}
        >
            Restart (R)
        </Button>
    </div>
    <!-- <pre id="code" class="text-xs"></pre> -->
</div>
