<script lang="ts">
    import { type PhotoSave } from "$lib/stores.svelte";
    import { devicePixelRatio } from "svelte/reactivity/window";
    import { getBackgroundColour, getForegroundColour } from "$lib/util";

    let {
        save,
        loadSave,
        deleteSave,
        renameSave
    }: {
        save: PhotoSave;
        loadSave: () => void;
        deleteSave: () => void;
        renameSave: (name: string) => void;
    } = $props();

    const shareSave = async (save: PhotoSave) => {
        const { src, ...saveWithoutSrc } = save;

        const { default: PocketBase } = await import("pocketbase");

        new PocketBase("https://cdn.zelo.dev")
            .collection("ant")
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

    function deleteFromMenu(event: MouseEvent) {
        const menu = (event.currentTarget as HTMLButtonElement).closest("details");
        if (menu) menu.open = false;
        deleteSave();
    }

    function renameFromMenu(event: MouseEvent) {
        const menu = (event.currentTarget as HTMLButtonElement).closest("details");
        if (menu) menu.open = false;

        const name = prompt("Rename your save", save.name)?.trim();
        if (name) {
            renameSave(name);
        }
    }

    function exportFromMenu(event: MouseEvent) {
        const menu = (event.currentTarget as HTMLButtonElement).closest("details");
        if (menu) menu.open = false;

        const blob = new Blob([JSON.stringify($state.snapshot(save), null, 2)], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filenameSafe(save.name || "ant")}.zelo-ant.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    function filenameSafe(name: string) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 80);
    }
</script>

<!-- 0.275 -->
<div
    class="outline-2"
    style="background-color: {getForegroundColour(save)}; color: {getBackgroundColour(save)}; "
>
    <button data-umami-event="load" class="block cursor-pointer" onclick={() => loadSave()}>
        <img
            style="image-rendering: pixelated;"
            alt=""
            src={save.src}
            width={screenDimensions}
            height={screenDimensions}
        />
    </button>
    <div>
        <p class="overflow-x-hidden px-1 text-center font-bold text-ellipsis">
            {save.name}
        </p>
        <div class="flex items-center justify-between tabular-nums bg-black/70 px-2 pt-0.5 text-xs">
            <p class="text-xs">
                {new Date(save.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                })}
            </p>
            <!-- <button
                data-umami-event="share"
                class="text-blue-300 hover:cursor-pointer"
                onclick={() => shareSave(save)}
            >
                {shareText}
            </button> -->
            <details class="dropdown relative text-white">
                <summary
                    class="cursor-pointer list-none px-1 text-base leading-none font-bold select-none"
                    aria-label="Save actions">≡</summary
                >
                <div
                    class="absolute right-0 bottom-full z-10 mb-1 min-w-24 border border-white/20 bg-black text-sm shadow-lg"
                >
                    <button
                        class="block w-full px-3 py-1.5 text-left hover:bg-white/20"
                        type="button"
                        onclick={renameFromMenu}
                    >
                        Rename
                    </button>
                    <button
                        class="block w-full px-3 py-1.5 text-left hover:bg-white/20"
                        type="button"
                        onclick={exportFromMenu}
                    >
                        Export
                    </button>
                    <button
                        class="block w-full px-3 py-1.5 text-left hover:bg-white/20"
                        type="button"
                        onclick={deleteFromMenu}
                    >
                        Delete
                    </button>
                </div>
            </details>
        </div>
    </div>
</div>

<style>
    .dropdown > summary::-webkit-details-marker {
        display: none;
    }
</style>
