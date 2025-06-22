import Game from "./Game.svelte";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import { addBlockToBlockly } from "./blocklypain";
import {
    createAntJSON,
    defaultBlockly,
    injectOptions,
    iterationJSON,
    lookJSON,
    moveJSON,
    onJSON,
    turnJSON
} from "./blockly";
import type { WorkspaceSvg } from "core/workspace_svg";
import Renderer from "./render/webgl2";
import { tiles } from "./stores.svelte";

export let canvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;
export let gl2: WebGL2RenderingContext;
// export let newTileEvent = new Event("newTile");
// TODO: Temporary
// export let updateTileEvent = new Event("updateTile");
export let workspace: WorkspaceSvg;
export let renderer: Renderer;

export function main(
    canvasElement: HTMLCanvasElement,
    // ctx_2D: CanvasRenderingContext2D,
    gl2_2D: WebGL2RenderingContext
) {
    canvas = canvasElement;
    // ctx = ctx_2D;
    gl2 = gl2_2D;
    renderer = new Renderer(gl2);
    Game.clear();

    Game.addTile([0, 0, 0], ["turn right"]);
    Game.addTile([255, 255, 255], ["turn left"]);

    Game.board.addAnt(Game.board.width / 2, Game.board.height / 2);

    console.log(tiles, Game.tileTriggers, Game.board.ants);

    // TODO: tooltip does not work
    addBlockToBlockly({
        name: "turn",
        json: turnJSON,
        tooltip: (block) => {
            return `Turns the ant in the ${block.getFieldValue("Directions")} direction.`;
        },
        onRun: (block) => {
            const dropdown_directions = block.getFieldValue("Directions");
            return `ant.turn${dropdown_directions}();\n`;
        }
    });

    addBlockToBlockly({
        name: "look",
        json: lookJSON,
        tooltip: (block) => {
            return `Makes the ant look ${block.getFieldValue("Directions")}.`;
        },
        onRun: (block) => {
            const dropdown_directions = block.getFieldValue("Directions");
            switch (dropdown_directions) {
                case "North":
                    return `ant.rotation = 0;\n`;
                case "East":
                    return `ant.rotation = 1;\n`;
                case "South":
                    return `ant.rotation = 2;\n`;
                case "West":
                    return `ant.rotation = 3;\n`;
                default:
                    return "";
            }
        }
    });

    addBlockToBlockly({
        name: "on",
        json: onJSON,
        tooltip: (block) => {
            return `Triggers when an ant steps on tile ${block.getFieldValue("TileID")}.`;
        },
        onRun: (block) => {
            const number_tileid = block.getFieldValue("TileID");
            const statements_name = javascriptGenerator.statementToCode(block, "NAME");
            return `// On tile ${number_tileid}\nGame.tileTriggers.set(${number_tileid}, (ant) => {\n${statements_name}});\n`;
        }
    });

    addBlockToBlockly({
        name: "move",
        json: moveJSON,
        tooltip: (block) => {
            return `Moves the ant forward by ${block.getFieldValue("NAME")}.`;
        },
        onRun: (block: Blockly.Block) => {
            const amount = javascriptGenerator.valueToCode(
                block,
                "NAME",
                javascriptGenerator.ORDER_ADDITION
            );
            return `ant.moveForward(${amount});\n`;
        }
    });

    addBlockToBlockly({
        name: "iteration",
        json: iterationJSON,
        tooltip: () => {
            return `Triggers on each iteration.`;
        },
        onRun: (block) => {
            // let number_tileid = block.getFieldValue("TileID");
            const statements_name = javascriptGenerator.statementToCode(block, "NAME");
            return `// On iteration\nGame.onEachIteration = (ant) => {\n${statements_name}}\n`;
        }
    });

    /*
    addBlockToBlockly({
        name: "iteration_onevery",
        json: iterationJSON,
        tooltip: () => {
            return `Triggers on each iteration.`
        },
        onRun: (block: Blockly.Block) => {
            let number_tileid = block.getFieldValue('TileID');
            let statements_name = javascriptGenerator.statementToCode(block, 'NAME');
            return `// On iteration\nGame.onEachIteration = (ant) => {\n${statements_name}}\n`;
        }
    });*/

    /*
    Blockly.Blocks["iteration"] = {
        init: function() {
            this.jsonInit(iterationJSON);
            this.setTooltip(() => {
                return `Triggers on each iteration.`
            });
        }
    };

    javascriptGenerator["iteration"] = (block: Blockly.Block) => {
        let number_tileid = block.getFieldValue('TileID');
        let statements_name = javascriptGenerator.statementToCode(block, 'NAME');
        return `// On iteration\nGame.onEachIteration = (ant) => {\n${statements_name}}\n`;
    };*/

    addBlockToBlockly({
        name: "create_ant",
        json: createAntJSON,
        tooltip: (block) => {
            return `Creates an ant in the location (${block.getFieldValue("X")}, ${block.getFieldValue("Y")})`;
        },
        onRun: (block) => {
            const [x, y] = [
                javascriptGenerator.valueToCode(block, "X", javascriptGenerator.ORDER_ADDITION),
                javascriptGenerator.valueToCode(block, "Y", javascriptGenerator.ORDER_ADDITION)
            ];
            return `Game.board.addAnt(${x}, ${y});\n`;
        }
    });

    /*
    addBlockToBlockly({
        name: "clone_ant",
        json: cloneAntJSON,
        tooltip: () => {
            return `Creates an ant in the location wh`;
        },
        onRun: (block: Blockly.Block) => {
            let [x, y] = [block.getFieldValue("X"), block.getFieldValue("Y")];
            return `Game.board.addAnt(${x}, ${y});\n`;
        }
    });*/

    workspace = Blockly.inject("blockly", injectOptions);

    workspace.addChangeListener(Blockly.Events.disableOrphans);

    let code = "";
    workspace.addChangeListener((e: Blockly.Events.Abstract) => {
        // console.log(e.type, e?.reason);
        if (
            // e.type === Blockly.Events.BLOCK_CREATE ||
            // e.type === Blockly.Events.BLOCK_DELETE ||
            e.type === Blockly.Events.FINISHED_LOADING ||
            e.type === Blockly.Events.BLOCK_CHANGE ||
            e.type === Blockly.Events.BLOCK_MOVE
        ) {
            const newCode = javascriptGenerator.workspaceToCode(workspace);
            if (e.type === Blockly.Events.BLOCK_MOVE) {
                if (newCode !== code) {
                    if (e?.reason[0] === "disconnect" || e?.reason[0] === "connect") {
                        return;
                    }
                } else return;
            }
            code = newCode;
            console.log("reset!");
            // if (e.type === Blockly.Events.BLOCK_MOVE) {
            //     if (e.oldParentId === e.newParentId) return;
            //     if (e.oldInputName === e.newInputName) return;
            // }
            // document.getElementById("code")!.innerText = code;

            Game.tileTriggers.clear();
            Game.restart();
            // console.log(Blockly.serialization.workspaces.save(workspace))
            try {
                // eval for now (its slow)
                eval(code);
            } catch (er) {
                console.error("eval error", er);
            }
        }
    });
    Blockly.serialization.workspaces.load(defaultBlockly, workspace);

    window.addEventListener("newTile", () => {
        const block = workspace.newBlock("on");
        block.setFieldValue(tiles.size - 1, "TileID");
        block.initSvg();
        block.render();

        const turnBlock = workspace.newBlock("turn");
        turnBlock.setFieldValue("Left", "Directions");
        turnBlock.initSvg();
        turnBlock.render();

        // console.log(block.getInput("NAME").connection, turnBlock.previousConnection)
        block.getInput("NAME").connection.connect(turnBlock.previousConnection);

        workspace.render();
    });

    window.addEventListener("keydown", (e: KeyboardEvent) => {
        switch (e.code) {
            case "KeyR":
                Game.restart();
                break;

            case "KeyP":
                Game.instance.paused = !Game.instance.paused;
                break;
        }
    });
    window.requestAnimationFrame(frame);
}

export function frame() {
    if (!Game.instance.updateInProgress && !Game.instance.paused) Game.tick();
    renderer.render();

    window.requestAnimationFrame(frame);
}

export function iterate() {
    for (const ant of Game.board.ants) {
        // Move
        const oldPos = ant.position;
        Game.onEachIteration(ant);

        const cell = Game.board.getCell(ant.position.x, ant.position.y);
        const func = Game.tileTriggers.get(cell);
        if (func) func(ant);

        Game.board.incrementCell(oldPos.x, oldPos.y);
    }
}
