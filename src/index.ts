import { Navigation } from "react-native-navigation";
import xs, { Stream } from "xstream";
import { ReactElement } from "react";
import { ScreenVNode, Command } from "./types";
import { ScreensSource } from "./ScreensSource";
import makeScreenComponent from "./makeScreenComponent";

export { ScreensSource } from "./ScreensSource";
export {
  Command,
  PushCommand,
  DismissAllModalsCommand,
  DismissModalCommand,
  PopCommand,
  PopToRootCommand,
  ResetToCommand,
  ShowModalCommand,
  ScreenVNode
} from "./types";

export type NavDrivers = {
  screenVNodeDriver: (screenVNode$: Stream<ScreenVNode>) => ScreensSource;
  commandDriver: (command$: Stream<Command>) => void;
};

// TODO
function makeTabBasedNavDrivers(
  screenIDs: Array<string>,
  config: any
): NavDrivers {
  throw new Error("Not yet implemented");
}

export function makeSingleScreenNavDrivers(
  screenIDs: Array<string>,
  config: any
): NavDrivers {
  const screenVNodeMimic$ = xs.create<ScreenVNode>();
  const commandMimic$ = xs.create<Command>();
  const navEvent$ = xs.create<any>();
  const latestVNodes = new Map<string, ReactElement<any>>();

  for (let i = 0, n = screenIDs.length; i < n; i++) {
    const screenID = screenIDs[i];
    Navigation.registerComponent(
      screenID,
      makeScreenComponent(
        screenID,
        latestVNodes,
        screenVNodeMimic$,
        commandMimic$,
        navEvent$
      )
    );
  }

  Navigation.startSingleScreenApp(config);

  function screenVNodeDriver(screenVNode$: Stream<ScreenVNode>) {
    screenVNode$.addListener({
      next: s => {
        latestVNodes.set(s.screen, s.vdom);
      }
    });
    screenVNode$._add(screenVNodeMimic$);
    return new ScreensSource();
  }

  function commandDriver(command$: Stream<Command>) {
    command$._add(commandMimic$);
    return navEvent$;
  }

  return { screenVNodeDriver, commandDriver };
}
