<script lang="ts">
    import Game from "../ant/game";
    import { sum } from "ramda";
    import { onMount } from "svelte";
    import { main } from "../ant";
    import Tab from "../component/Tab.svelte";

    onMount(() => {
        const ctx = document.getElementById("canvas").getContext("2d", {alpha: false});
        main(ctx)
    })
    // const output = Game.output
    // $: rows = $output.split("\n")
    // console.log(rows)

    const turn = ["↑", "→", "↓", "←"]
    // let e;
    // setInterval(() => e = turn[Game.board.ants[0].rotation], 16)
    let ant = Game.board.ants.length
    const fps = Game.fps
    let hist = []
    let avgms = 0
    // let avgiterationms = 0
    fps.subscribe((value) => {
        hist.push(value)
        if (hist.length > 60) {
            hist.shift()
        }

        avgms = sum(hist) / hist.length
        ant = Game.board.ants.length
        // avgiterationms = ((avgms / Game.iterationsPerTick) * 1000)
        return value;
    })
</script>

<div class="main">
    <div class="top">
        <div class="viewer-editor">
            <canvas id="canvas" width="800" height="800"></canvas>
        </div>
        <div class="right">
            <Tab avgms={avgms.toFixed(2)} ant={ant}/>
        </div>
    </div>
</div>

<style>
    .main {
        display: flex;
        flex-direction: column;
        padding: 10px;
    }

    .right {
        display: flex;

        flex-direction: column;
        overflow-y: auto;
        flex-grow: 1;
        margin: 0 10px;
        padding: 1px;
    }

    pre {
        outline: 1px solid black;
        background-color: lightgrey;
        max-width: 300px;
        max-height: 300px;
        overflow: auto;
        padding: 10px;
    }

    .top {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .end {
        flex-grow: 1;
    }

    .viewer-editor {
        display: flex;
        flex-direction: row;
    }
</style>