import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

type BlockConstructorType = {
    name: string;
    json: {};
    tooltip: (block: Blockly.Block) => string;
    onRun: (block: Blockly.Block) => string;
};

export function addBlockToBlockly(obj: BlockConstructorType) {
    Blockly.Blocks[obj.name] = {
        init: function () {
            this.jsonInit(obj.json);
            this.setTooltip(obj.tooltip(this));
        }
    };

    javascriptGenerator.forBlock[obj.name] = obj.onRun;
}
