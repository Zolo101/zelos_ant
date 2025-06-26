export const width = $state(800);
export const height = $state(800);

export const tiles: Tile[] = $state([]);

export const getColours = () => tiles.map((t) => t.colour);

export type Save = {
    id?: number;
    name: string;
    date: Date;
    blockly: Record<string, unknown>;
    tiles: Tile[];
    src: string;
};

export type Tile = {
    colour: [number, number, number];
    triggers: string[];
};

export const clear = () => {
    tiles.length = 0;
};
export const importTiles = (t: Tile[]) => {
    tiles.length = 0;

    t.forEach((tile) => {
        tiles.push(tile);
    });
};
