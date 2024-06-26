export type EffectCallback = () => unknown | Promise<unknown>;
export type Terminate = void | EffectCallback;
export type Terminater = Terminate | Promise<Terminate>;