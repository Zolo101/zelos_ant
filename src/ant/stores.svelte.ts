import { SvelteSet } from "svelte/reactivity";
import type Tile from "./tile";

export const tiles: Set<Tile> = new SvelteSet();
export const colours: Set<Tile["colour"]> = new SvelteSet();

export const clear = () => {
    tiles.clear();
    colours.clear();
};
export const importTiles = (t: Tile[]) => {
    tiles.clear();
    colours.clear();

    t.forEach((tile) => {
        tiles.add(tile);
        colours.add(tile.colour);
    });
};
