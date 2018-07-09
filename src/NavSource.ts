import xs, {Stream} from 'xstream';

export class NavSource {
  public _topBar: Stream<string>;
  public _back: Stream<null>;
  public _didAppear: Stream<null>;
  public _didDisappear: Stream<null>;

  constructor() {
    this._topBar = xs.create<string>();
    this._back = xs.create<null>();
    this._didAppear = xs.create<null>();
    this._didDisappear = xs.create<null>();
  }

  public topBarButtonPress(buttonId?: string) {
    if (buttonId) return this._topBar.filter(id => id === buttonId);
    else return this._topBar;
  }

  public backPress() {
    return this._back;
  }

  public didAppear() {
    return this._didAppear;
  }

  public didDisappear() {
    return this._didAppear;
  }
}
