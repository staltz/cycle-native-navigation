import {Navigation} from 'react-native-navigation';
import {Drivers, Engine, Sources} from '@cycle/run';
import {NavSource} from './NavSource';
import {Command} from './types';

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

  if (sinks.navigation) {
    let latestId: string | undefined;
    Navigation.events().registerComponentDidAppearListener(({componentId}) => {
      latestId = componentId;
    });
    sinks.navigation.subscribe({
      next: (cmd: Command) => {
        if (cmd.type === 'setRoot') {
          Navigation.setRoot(cmd.layout);
          return;
        }
        const id = cmd.id ?? latestId;
        if (!id) {
          console.error(
            'The global screen component cannot apply a ' +
              'navigation command if an "id" is not provided',
          );
          return;
        }
        if (cmd.type === 'push') Navigation.push(id, cmd.layout);
        if (cmd.type === 'pop') Navigation.pop(id, cmd.options);
        if (cmd.type === 'popTo') Navigation.popTo(id);
        if (cmd.type === 'popToRoot') Navigation.popToRoot(id);
        if (cmd.type === 'showModal') Navigation.showModal(cmd.layout);
        if (cmd.type === 'dismissModal') Navigation.dismissModal(id);
        if (cmd.type === 'dismissAllModals') Navigation.dismissAllModals();
        if (cmd.type === 'setStackRoot') {
          Navigation.setStackRoot(id, cmd.layout);
        }
        if (cmd.type === 'showOverlay') {
          Navigation.showOverlay(cmd.layout);
        }
        if (cmd.type === 'dismissOverlay') {
          Navigation.dismissOverlay(id);
        }
        if (cmd.type === 'mergeOptions') {
          Navigation.mergeOptions(id, cmd.opts);
        }
      },
    });
  }
}
