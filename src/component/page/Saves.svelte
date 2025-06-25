<script lang="ts">
    import Game from "../../ant/Game.svelte";
    import Screen from "../Screen.svelte";
    import type { Save } from "../../ant/stores.svelte";
    import Button from "../Button.svelte";

    let { saves, renderer, workspace, canvas } = $props();

    const dateOptions = { day: "numeric", month: "long", year: "numeric" };

    const fColour = (index: number) => {
        const tile = saves[index].tiles[0];
        const [red, green, blue] = tile ? tile.colour : [255, 255, 255];
        return `rgb(${red}, ${green}, ${blue})`;
    };

    const bColour = (index: number) => {
        const tile = saves[index].tiles[1];
        const tile0Colour = saves[index].tiles[0].colour;
        const inverse = [255 - tile0Colour[0], 255 - tile0Colour[1], 255 - tile0Colour[2]];
        const [red, green, blue] = tile ? tile.colour : inverse;
        return `rgb(${red}, ${green}, ${blue})`;
    };

    const loadSave = (save: Save) => {
        Game.loadSnapshot(save, renderer, workspace);
    };
</script>

<section class="flex h-full flex-col items-center gap-4 bg-black/70 p-2 backdrop-blur-xs">
    <Button
        class="w-48 outline-purple-400/75!"
        onclick={() => Game.saveSnapshot(saves, renderer, workspace, canvas)}>Save Rules</Button
    >
    <hr class="w-full" />
    <div class="flex flex-wrap gap-3">
        {#if saves}
            {#each saves as save, index}
                <div>
                    <button class="cursor-pointer" onclick={() => loadSave(save)}>
                        <Screen id={index} src={save.src} width={800} height={800} scale={0.16} />
                        <div style="background-color: {fColour(index)}; color: {bColour(index)}">
                            <p
                                class="overflow-x-hidden px-1 text-center font-bold overflow-ellipsis"
                            >
                                {save.name}
                            </p>
                            <p class="text-center text-xs">
                                {new Date(save.date).toLocaleDateString("en-GB", dateOptions)}
                            </p>
                        </div>
                    </button>
                    <!-- <button onclick={() => Game.deleteSave(index)}>Delete</button> -->
                </div>
            {/each}
        {/if}
    </div>
</section>
