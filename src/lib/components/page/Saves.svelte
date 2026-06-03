<script lang="ts">
    import { loadSnapshot, type PhotoSave, type Save, type Tile } from "$lib/stores.svelte";
    import type Game from "$lib/Game.svelte";
    import type Renderer from "$lib/render/webgl2.svelte";
    import type { WorkspaceSvg } from "blockly";
    import SaveComponent from "./SaveComponent.svelte";

    let {
        game,
        saves,
        renderer,
        workspace
    }: {
        game: Game;
        saves: PhotoSave[];
        renderer: Renderer | null;
        workspace: WorkspaceSvg | null;
    } = $props();
    let importInput: HTMLInputElement | undefined = $state();

    // const saveStorageSize = $derived(JSON.stringify(saves).length / 1024 / 1024);

    function loadSaveBuilder(save: Save) {
        return () => {
            if (renderer && workspace) {
                loadSnapshot(save, renderer, workspace);
            }
        };
    }

    function deleteSaveBuilder(index: number) {
        return () => {
            if (confirm(`Are you sure you want to delete this save: "${saves[index].name}"?`)) {
                saves.splice(index, 1);
            }
        };
    }

    function renameSaveBuilder(index: number) {
        return (name: string) => {
            saves[index].name = name;
            saves[index].date = new Date();
        };
    }

    function importAnt() {
        importInput?.click();
    }

    async function handleImport(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) return;

        try {
            const imported = parseImportedSave(JSON.parse(await file.text()));
            saves.push(imported);
        } catch (err) {
            console.error(err);
            alert("Failed to import ant. Please choose a valid zelo's ant export.");
        } finally {
            input.value = "";
        }
    }

    function parseImportedSave(value: unknown): PhotoSave {
        if (!isRecord(value)) {
            throw new Error("Imported ant must be an object");
        }

        const blockly = value.blockly;
        const tiles = value.tiles;

        if (!isRecord(blockly) || !Array.isArray(tiles) || !tiles.every(isTile)) {
            throw new Error("Imported ant is missing blockly or tile data");
        }

        return {
            name:
                typeof value.name === "string" && value.name.trim()
                    ? value.name.trim()
                    : "Imported Ant",
            date: value.date ? new Date(value.date as string | number | Date) : new Date(),
            blockly,
            tiles,
            src: typeof value.src === "string" ? value.src : createPreviewSrc(tiles)
        };
    }

    function isRecord(value: unknown): value is Record<string, unknown> {
        return typeof value === "object" && value !== null;
    }

    function isTile(value: unknown): value is Tile {
        if (!isRecord(value) || !Array.isArray(value.colour) || !Array.isArray(value.triggers)) {
            return false;
        }

        return (
            value.colour.length === 3 &&
            value.colour.every((channel) => typeof channel === "number") &&
            value.triggers.every((trigger) => typeof trigger === "string")
        );
    }

    function createPreviewSrc(tiles: Tile[]) {
        const foreground = toRgbCss(tiles[0]?.colour ?? [255, 255, 255]);
        const background = toRgbCss(tiles[1]?.colour ?? [0, 0, 0]);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${background}"/><path d="M32 8 52 56H12Z" fill="${foreground}"/></svg>`;

        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }

    function toRgbCss([r, g, b]: Tile["colour"]) {
        return `rgb(${r}, ${g}, ${b})`;
    }
</script>

<!-- 0.275 -->
<!-- <div class="flex w-full gap-3 m-auto text-2xl">
    <span>Save Storage:</span>
    <span>
        {saveStorageSize.toLocaleString("en-US", {
            style: "unit",
            unit: "megabyte",
            unitDisplay: "narrow"
        })}
    </span>
</div> -->
<button class="rounded bg-violet-600 px-4 py-1" onclick={importAnt}>Import Ant</button>
<input
    class="hidden"
    type="file"
    accept=".json,.zelo-ant.json,application/json"
    bind:this={importInput}
    onchange={handleImport}
/>
<button
    class="absolute top-4 right-4 rounded bg-red-600 px-4 py-1"
    onclick={() => (game.showSaves = false)}>Close</button
>
<section class="flex flex-wrap content-start gap-4 py-4">
    {#each saves as save, index (index)}
        <SaveComponent
            {save}
            loadSave={loadSaveBuilder(save)}
            deleteSave={deleteSaveBuilder(index)}
            renameSave={renameSaveBuilder(index)}
        />
    {/each}
</section>
