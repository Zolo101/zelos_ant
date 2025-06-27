<script lang="ts">
    import Game from "../ant/Game.svelte";

    export let object;
    export let onChange: (val: unknown) => void;
    export let options: IterableIterator<string>;
    export let currentValue: unknown;

    let opened = false;
    let operateDropdown = () => (opened = !opened);
    let selectOption = (val: unknown) => {
        onChange(val);
        currentValue = val;

        Game.restart();
        operateDropdown();
    };

    // console.log(object, options)
</script>

<div class="dropdown">
    <button class="button hidden" onclick={operateDropdown}>{currentValue}</button>
    <div class="options" class:open={opened}>
        {#each Array.from(options) as option}
            <!--{#if option === defaultSelection}-->
            <!--               <div class="option selected">{option}</div>-->
            <!--           {:else}-->
            <button class="option" onclick={() => selectOption(option)}>{option}</button>
            <!--{/if}-->
        {/each}
    </div>
</div>

<style>
    .button {
        text-align: center;
        outline: 1px solid black;
        padding: 5px;
        cursor: pointer;
    }

    .dropdown {
        padding: 5px;
        width: 140px;
    }

    .options {
        display: none;
        position: absolute;
        outline: 1px solid black;
        background-color: #ddd;
        cursor: pointer;
        width: 140px;
    }

    .open {
        display: block;
    }

    .option:hover {
        background-color: #ccc;
    }

    .option {
        padding: 5px;
        border-radius: 0;
    }

    .hidden {
        background-color: #ccc;
    }
</style>
