import {Navigation, Layout, Options} from 'react-native-navigation';
import {Screens} from './types';
import makeComponent from './makeComponent';
import {setupReusable, Drivers} from '@cycle/run';

export function run<D extends Drivers>(
  screens: Screens,
  drivers: D,
  layout: Layout,
  defaultOpts?: Options,
): void {
  const engine = setupReusable(drivers);
  for (const [id, main] of Object.entries(screens)) {
    Navigation.registerComponent(id, makeComponent(main, engine, id));
  }
  Navigation.events().registerAppLaunchedListener(() => {
    if (defaultOpts) Navigation.setDefaultOptions(defaultOpts);
    Navigation.setRoot({root: layout});
  });
}
