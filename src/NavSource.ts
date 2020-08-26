import xs, {Stream, Listener, Producer} from 'xstream';
import {
  Navigation,
  ComponentDidAppearEvent,
  ComponentDidDisappearEvent,
} from 'react-native-navigation';

type HasListenerHandle = {
  handle?: {
    remove?(): void;
  };
};

export class NavSource {
  public _topBar: Stream<string>;
  public _back: Stream<null>;
  public _didAppear: Stream<null>;
  public _didDisappear: Stream<null>;
  public _globalDidAppear: Stream<ComponentDidAppearEvent>;
  public _globalDidDisappear: Stream<ComponentDidDisappearEvent>;

  constructor() {
    this._topBar = xs.create<string>();
    this._back = xs.create<null>();
    this._didAppear = xs.create<null>();
    this._didDisappear = xs.create<null>();
    this._globalDidAppear = xs.create<ComponentDidAppearEvent>({
      start(listener: Listener<ComponentDidAppearEvent>) {
        this.handle = Navigation.events().registerComponentDidAppearListener(
          (event) => {
            listener.next(event);
          },
        );
      },
      stop() {
        this.handle?.remove?.();
      },
    } as Producer<ComponentDidAppearEvent> & HasListenerHandle);
    this._globalDidDisappear = xs.create<ComponentDidDisappearEvent>({
      start(listener: Listener<ComponentDidDisappearEvent>) {
        this.handle = Navigation.events().registerComponentDidDisappearListener(
          (event) => {
            listener.next(event);
          },
        );
      },
      stop() {
        this.handle?.remove?.();
      },
    } as Producer<ComponentDidDisappearEvent> & HasListenerHandle);
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

  public globalDidAppear(
    componentName?: string,
  ): Stream<ComponentDidAppearEvent> {
    if (componentName) {
      return this._globalDidAppear.filter(
        (ev) => ev.componentName === componentName,
      );
    } else {
      return this._globalDidAppear;
    }
  }

  public globalDidDisappear(
    componentName?: string,
  ): Stream<ComponentDidDisappearEvent> {
    if (componentName) {
      return this._globalDidDisappear.filter(
        (ev) => ev.componentName === componentName,
      );
    } else {
      return this._globalDidDisappear;
    }
  }
}
