<script lang="ts">
    import Tiles from "./page/Tiles.svelte";
    import Credits from "./page/Credits.svelte";
    import Saves from "./page/Saves.svelte";
    import Button from "./Button.svelte";
    // import { slide, type SlideParams } from "svelte/transition";

    let page = 0;

    // const slideOptions: SlideParams = { axis: "x", duration: 500 };
</script>

{#snippet button(text: string, pg: number)}
    <Button onclick={() => (page = pg)}>{text}</Button>
{/snippet}

<div class="flex flex-row gap-2 *:grow">
    {@render button("Editor", 0)}
    {@render button("Tiles", 1)}
    {@render button("Saves", 2)}
    {@render button("About", 3)}
    <!--    <p class="button" on:click={() => page = 5}>Debug</p>-->
</div>
<div class="mt-2 h-full w-full">
    {#if page === 0}
        <div class="relative h-full w-full">
            <div class="absolute top-0 left-0 h-full w-full" id="blockly"></div>
        </div>
    {/if}
    {#if page === 1}
        <Tiles />
    {/if}
    {#if page === 2}
        <Saves />
    {/if}
    {#if page === 3}
        <Credits />
    {/if}
</div>
