<script lang="ts">
    import Game from "../../ant/game";

    $: controlText = Game.paused ? "Resume" : "Pause";
</script>

<div class="controls">
    <div class="main">
        <div
            class="button control"
            on:click={() => {
                Game.restart();
                Game.paused = false;
            }}
        >
            Restart (R)
        </div>
        <div class="button control" on:click={() => (Game.paused = !Game.paused)}>
            {controlText} (P)
        </div>
    </div>
    <div class="tickspeed">
        <p class="tickspeed-header">Tickspeed</p>
        <div class="button once" on:click={() => Game.tick()}>One Tick</div>
        <div class="button once" on:click={() => (Game.iterationsPerTick = 1)}>1 I/t</div>
        <div class="button once" on:click={() => (Game.iterationsPerTick = 10)}>10 I/t</div>
        <div class="button once" on:click={() => (Game.iterationsPerTick = 100)}>100 I/t</div>
        <div class="button once" on:click={() => (Game.iterationsPerTick = 1000)}>1,000 I/t</div>
        <div class="button once" on:click={() => (Game.iterationsPerTick = 10000)}>10,000 I/t</div>
        <div class="button once" on:click={() => (Game.iterationsPerTick = 100000)}>
            100,000 I/t
        </div>
        <div class="button once" on:click={() => (Game.iterationsPerTick = 1000000)}>
            1,000,000 I/t
        </div>
        <div class="button once" on:click={() => (Game.iterationsPerTick = 10000000)}>
            10,000,000 I/t
        </div>
    </div>
</div>

<style>
    .controls {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .tickspeed {
        display: flex;
        flex-direction: column;
    }

    .tickspeed-header {
        text-align: center;
    }
</style>
