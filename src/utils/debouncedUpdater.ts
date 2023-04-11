// import { debounce } from "lodash-es";

// class DebouncedUpdater<
//   TState,
//   TStateUpdater extends (state: TState, ...args: any[]) => any,
//   TCreateNewState extends () => TState,
//   TCallback extends (state: TState) => void
// > {
//   private state: TState;
//   private updateState: TStateUpdater;
//   private processQueue: (cb: TCallback) => void;

//   constructor(
//     private create: TCreateNewState,
//     private updater: TStateUpdater,
//     private cb: TCallback,
//     private timeout = 0
//   ) {
//     this.state = this.create();

//     this.processQueue = debounce(() => {
//       this.cb(this.state);
//       this.state = this.create();
//     }, 0);

//     this.updateState = (...args) => {
//       this.updater(this.state, ...args);
//       this.processQueue(this.cb);
//     };
//   }
// }

// const debouncedUpdater = new DebouncedUpdater(
//   () => ({}), // this is a new state
//   (state, { id, element }) => {
//     // this is the state updater
//     state[id] = element;
//   },
//   (state) => {
//     // this is the callback
//     // do something with the built state
//   }
// );
