// TODO: Don't like how this is in its own file...
export type SimulationInitMessage = {
    type: "init";
    code: string;
    tileCount: number;
};

export type SimulationStepMessage = {
    type: "step";
    iterations: number;
    snapshot: ArrayBuffer;
};

export type SimulationRequest = SimulationInitMessage | SimulationStepMessage;

export type SimulationError = {
    name: string;
    message: string;
    stack?: string;
};

export type SimulationFrameMessage = {
    type: "frame";
    cells: ArrayBuffer;
    duration: number;
    iterations: number;
    error?: SimulationError;
};

export type SimulationResponse = SimulationFrameMessage;
