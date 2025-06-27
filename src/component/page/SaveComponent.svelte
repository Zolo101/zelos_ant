<script lang="ts">
    import Game from "../../ant/Game.svelte";
    import type { PhotoSave, Save } from "../../ant/stores.svelte";
    import { devicePixelRatio } from "svelte/reactivity/window";
    import { getBackgroundColour, getForegroundColour } from "../../ant/util";

    let { saves, index, renderer, workspace, pb } = $props();
    const save = $derived(saves[index]);

    const loadSave = (save: Save) => {
        Game.loadSnapshot(save, renderer, workspace);
    };

    const deleteSave = (index: number) => {
        if (confirm(`Are you sure you want to delete this save: "${saves[index].name}"?`)) {
            saves.splice(index, 1);
        }
    };

    const shareSave = (save: PhotoSave) => {
        const { src, ...saveWithoutSrc } = save;

        pb.collection("ant")
            .create({ workspace: saveWithoutSrc })
            .then((record) => {
                const url = `${window.location.origin}/?s=${record.id}`;
                navigator.clipboard.writeText(url);
                justShared = true;
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to share save... Please try again later");
            });
    };

    const screenScale = 0.24;
    const screenDimensions = $derived((800 / devicePixelRatio.current!) * screenScale);

    let justShared = $state(false);
    let shareText = $derived(justShared ? "Copied!" : "Share");

    $effect(() => {
        if (justShared) {
            setTimeout(() => {
                justShared = false;
            }, 5000);
        }
    });
</script>

<!-- 0.275 -->
<div
    class="outline-2"
    style="background-color: {getForegroundColour(save)}; color: {getBackgroundColour(save)}; "
>
    <button class="block cursor-pointer" onclick={() => loadSave(save)}>
        <img
            style="image-rendering: pixelated;"
            alt=""
            src={save.src}
            width={screenDimensions}
            height={screenDimensions}
        />
    </button>
    <div>
        <p class="overflow-x-hidden px-1 text-center font-bold overflow-ellipsis">
            {save.name}
        </p>
        <div class="flex items-center justify-between bg-black/70 px-2 pt-0.5 text-xs">
            <p class="text-xs">
                {new Date(save.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                })}
            </p>
            <button class="text-blue-300 hover:cursor-pointer" onclick={() => shareSave(save)}>
                {shareText}
            </button>
            <button class="font-bold hover:cursor-pointer" onclick={() => deleteSave(index)}
                ><p>X</p></button
            >
        </div>
    </div>
</div>
