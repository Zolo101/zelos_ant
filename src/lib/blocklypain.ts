import type { Block } from "blockly";
import * as Blockly from "blockly";
import { javascriptGenerator, Order } from "blockly/javascript";
// import { toolbox } from "./blockly";

type BlockConstructorType = {
    name: string;
    json: Record<string, unknown>;
    tooltip: (block: Block) => string;
    onRun: (block: Block) => string | [string, Order];
};

export function addBlockToBlockly(obj: BlockConstructorType) {
    Blockly.Blocks[obj.name] = {
        init: function () {
            this.jsonInit(obj.json);
            this.setTooltip(obj.tooltip(this));
        }
    };

    console.log(obj);

    javascriptGenerator.forBlock[obj.name] = obj.onRun;
}

// {
//     type: "move",
//     message0: "Move forward by %1",
//     args0: [
//         {
//             type: "input_value",
//             name: "NAME",
//             check: "Number"
//         }
//     ],
//     previousStatement: null,
//     nextStatement: null,
//     colour: "#4c97ff",
//     tooltip: "",
//     helpUrl: ""
// },
// {
//     kind: "block",
//     type: "move",
//     inputs: {
//         NAME: {
//             shadow: {
//                 type: "math_number",
//                 fields: {
//                     NUM: 1
//                 }
//             }
//         }
//     }
// },
