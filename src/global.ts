import {Drivers, Engine, Sources} from '@cycle/run';
import {NavSource} from './NavSource';

export const GlobalScreen = Symbol('global component without a screen');

export function runGlobal<D extends Drivers>(
  main: (so: any) => any,
  engine: Engine<D>,
) {
  const sources: Sources<D> & {navigation: NavSource} = {
    ...(engine.sources as object),
    navigation: new NavSource(),
  } as any;
  const sinks = main(sources);
  engine.run(sinks);
}
