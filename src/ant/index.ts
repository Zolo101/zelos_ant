import Game from "./game";
import Blockly from "blockly"
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

export let canvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;
export let gl2: WebGL2RenderingContext;
export let newTileEvent = new Event("newTile");
// TODO: Temporary
export let updateTileEvent = new Event("updateTile");
export let workspace: WorkspaceSvg;
export let renderer: Renderer;

export function main(canvasElement: HTMLCanvasElement, ctx_2D: CanvasRenderingContext2D, gl2_2D: WebGL2RenderingContext) {
    canvas = canvasElement;
    ctx = ctx_2D
    gl2 = gl2_2D
    renderer = new Renderer(gl2)
    Game.clear();

    Game.addTile([255, 255, 255], ["turn right"]);
    Game.addTile([0, 0, 0], ["turn left"]);

    Game.board.addAnt(Game.board.width / 2, Game.board.height / 2);

    console.log(Game.tiles, Game.tileTriggers, Game.board.ants)


    // TODO: tooltip does not work
    addBlockToBlockly({
        name: "turn",
        json: turnJSON,
        tooltip: () => {
            return `Turns the ant in the ${this.getFieldValue("Directions")} direction.`
        },
        onRun: (block: Blockly.Block) => {
            let dropdown_directions = block.getFieldValue('Directions');
            return `ant.turn${dropdown_directions}();\n`;
        }
    });

    addBlockToBlockly({
        name: "look",
        json: lookJSON,
        tooltip: () => {
            return `Makes the ant look ${this.getFieldValue("Directions")}.`
        },
        onRun: (block: Blockly.Block) => {
            let dropdown_directions = block.getFieldValue('Directions');
            switch (dropdown_directions) {
                case "North": return `ant.rotation = 0;\n`;
                case "East": return `ant.rotation = 1;\n`;
                case "South": return `ant.rotation = 2;\n`;
                case "West": return `ant.rotation = 3;\n`;
                default: return "";
            }
        }
    });

    addBlockToBlockly({
        name: "on",
        json: onJSON,
        tooltip: () => {
            return `Triggers when an ant steps on tile ${this.getFieldValue("TileID")}.`
        },
        onRun: (block: Blockly.Block) => {
            let number_tileid = block.getFieldValue('TileID');
            let statements_name = Blockly.JavaScript.statementToCode(block, 'NAME');
            return `// On tile ${number_tileid}\nGame.tileTriggers.set(${number_tileid}, (ant) => {\n${statements_name}});\n`;
        }
    });

    addBlockToBlockly({
        name: "move",
        json: moveJSON,
        tooltip: () => {
            return `Moves the ant forward by ${this.getFieldValue("NAME")}.`
        },
        onRun: (block: Blockly.Block) => {
            let amount = Blockly.JavaScript.valueToCode(block,"NAME", Blockly.JavaScript.ORDER_ADDITION);
            return `ant.moveForward(${amount});\n`;
        }
    });

    addBlockToBlockly({
        name: "iteration",
        json: iterationJSON,
        tooltip: () => {
            return `Triggers on each iteration.`
        },
        onRun: (block: Blockly.Block) => {
            // let number_tileid = block.getFieldValue("TileID");
            let statements_name = Blockly.JavaScript.statementToCode(block, "NAME");
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
            let statements_name = Blockly.JavaScript.statementToCode(block, 'NAME');
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

    Blockly.JavaScript["iteration"] = (block: Blockly.Block) => {
        let number_tileid = block.getFieldValue('TileID');
        let statements_name = Blockly.JavaScript.statementToCode(block, 'NAME');
        return `// On iteration\nGame.onEachIteration = (ant) => {\n${statements_name}}\n`;
    };*/

    addBlockToBlockly({
        name: "create_ant",
        json: createAntJSON,
        tooltip: () => {
            return `Creates an ant in the location (${this.getFieldValue("X")}, ${this.getFieldValue("Y")})`;
        },
        onRun: (block: Blockly.Block) => {
            let [x, y] = [
                Blockly.JavaScript.valueToCode(block, "X", Blockly.JavaScript.ORDER_ADDITION),
                Blockly.JavaScript.valueToCode(block, "Y", Blockly.JavaScript.ORDER_ADDITION)
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



    // @ts-ignore
    workspace = Blockly.inject("blockly", injectOptions)

    workspace.addChangeListener((e: any) => {
        if (e.type === Blockly.Events.BLOCK_CREATE || e.type === Blockly.Events.BLOCK_DELETE || e.type === Blockly.Events.FINISHED_LOADING || e.type === Blockly.Events.BLOCK_CHANGE || e.type === Blockly.Events.BLOCK_MOVE) {
            if (e.type === Blockly.Events.BLOCK_MOVE) {
                if (e.oldParentId === e.newParentId) return;
                if (e.oldInputName === e.newInputName) return;
            }
            const code = Blockly.JavaScript.workspaceToCode(workspace);
            // document.getElementById("code")!.innerText = code;

            Game.tileTriggers.clear()
            Game.restart()
            // console.log(Blockly.serialization.workspaces.save(workspace))
            try {
                // eval for now (its slow)
                eval(code);
            } catch(er) {
                console.warn("eval error", er);
            }
        }
    })
    Blockly.serialization.workspaces.load(defaultBlockly, workspace)

    window.addEventListener("newTile", () => {
        const block = workspace.newBlock("on");
        block.setFieldValue(Game.tiles.length - 1, "TileID");
        block.initSvg();
        block.render();

        const turnBlock = workspace.newBlock("turn");
        turnBlock.setFieldValue("Left", "Directions");
        turnBlock.initSvg();
        turnBlock.render();

        // console.log(block.getInput("NAME").connection, turnBlock.previousConnection)
        block.getInput("NAME").connection.connect(turnBlock.previousConnection);

        workspace.render();
    })

    window.addEventListener("keydown", (e: KeyboardEvent) => {
        switch (e.code) {
            case "KeyR":
                Game.restart()
                break;

            case "KeyP":
                Game.paused = !Game.paused
                break;
        }
    })
    window.requestAnimationFrame(frame)
}

export function frame() {
    if (!Game.updateInProgress && !Game.paused) Game.tick();
    renderer.render();

    window.requestAnimationFrame(frame)
}

export function iterate() {
    for (const ant of Game.board.ants) {
        // Move
        const oldPos = ant.position
        Game.onEachIteration(ant)

        const cell = Game.board.getCell(ant.position.x, ant.position.y)
        const func = Game.tileTriggers.get(cell);
        if (func) func(ant);

        Game.board.incrementCell(oldPos.x, oldPos.y)
    }
}