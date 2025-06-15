import Dexie, { type Table } from "dexie";
import Save from "./save";
import Game from "./game";

class ZADexie extends Dexie {
    saves!: Table<Save>;

    constructor() {
        super("zelos-ant");
        this.version(1).stores({
            saves: "++id, name, blockly, tile, image"
        });
    }
}

export const db = new ZADexie();

export async function addSave(save: Save) {
    try {
        await db.saves.add(save);
    } catch (err) {
        Game.alertText.set(`Save failed! ${err}`);
    }
}
