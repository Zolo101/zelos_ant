import Blockly from "blockly";

type BlockConstructorType = {
    name: string;
    json: {};
    tooltip: () => string;
    onRun: (block: Blockly.Block) => string;
};

export function addBlockToBlockly(obj: BlockConstructorType) {
    Blockly.Blocks[obj.name] = {
        init: function () {
            this.jsonInit(obj.json);
            this.setTooltip(obj.tooltip);
        }
    };

    Blockly.JavaScript[obj.name] = obj.onRun;
}
