import xs, {Stream, Listener} from 'xstream';
import {Navigation} from 'react-native-navigation';

export type DisappearEvent = {componentId: string; componentName: string};

export class NavSource {
  public _topBar: Stream<string>;
  public _back: Stream<null>;
  public _didAppear: Stream<null>;
  public _didDisappear: Stream<null>;
  public _globalDidDisappear: Stream<DisappearEvent>;

  constructor() {
    this._topBar = xs.create<string>();
    this._back = xs.create<null>();
    this._didAppear = xs.create<null>();
    this._didDisappear = xs.create<null>();
    this._globalDidDisappear = xs.create<DisappearEvent>({
      start(listener: Listener<DisappearEvent>) {
        Navigation.events().registerComponentDidDisappearListener(
          (event: any) => {
            listener.next(event);
          },
        );
      },
      stop() {},
    });
  }

  public topBarButtonPress(buttonId?: string) {
    if (buttonId) return this._topBar.filter((id) => id === buttonId);
    else return this._topBar;
  }

  public backPress() {
    return this._back;
  }

  public didAppear() {
    return this._didAppear;
  }

  public didDisappear() {
    return this._didDisappear;
  }

  public globalDidDisappear(componentName?: string): Stream<DisappearEvent> {
    if (componentName) {
      return this._globalDidDisappear.filter(
        (ev) => ev.componentName === componentName,
      );
    } else {
      return this._globalDidDisappear;
    }
  }
}
