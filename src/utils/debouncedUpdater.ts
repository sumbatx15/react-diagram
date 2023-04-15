import { debounce } from "lodash-es";

export type DebouncedUpdater<TArgs extends any[] = any[]> = {
  update: (...args: TArgs) => void;
};

export const createDebouncedUpdater = <
  TState,
  TCallback extends (state: TState) => void,
  TArgs extends any[] = any[]
>(options: {
  create: () => TState;
  update: (currentState: TState, ...args: TArgs) => TState | Promise<TState>;
  onUpdate: TCallback;
  timeout: number;
}) => {
  let state = options.create();

  const process = debounce(() => {
    options.onUpdate(state);
    state = options.create();
  }, options.timeout);

  const update = async (...args: TArgs) => {
    const newState = await options.update(state, ...args);
    state = newState;
    process();
  };

  return {
    update,
  };
};
