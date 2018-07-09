import xs, {Stream, Subscription} from 'xstream';
import {Component, PureComponent, ReactElement, createElement} from 'react';
import {BackHandler} from 'react-native';
import {Navigation} from 'react-native-navigation';
import {Engine, Sources, Sinks} from '@cycle/run';
import {ScreenSource} from '@cycle/native-screen';
import {HandlersContext} from '@cycle/native-screen/lib/cjs/context';
import {Command} from './types';
import {NavSource} from './NavSource';

export type Props = {
  componentId: string;
};

export type State = {
  reactElem: ReactElement<any> | null;
};

export type MoreSources = {
  screen: ScreenSource;
  navigation: NavSource;
  props: Stream<Props>;
};

export type MoreSinks = {
  navigation?: Stream<Command>;
  screen?: Stream<ReactElement<any>>;
  navOptions?: Stream<any>;
};

type ViewStreamProps = {
  stream: Stream<ReactElement<any>>;
};

type ViewStreamState = {
  reactElem: ReactElement<any> | null;
};

class ViewStream extends PureComponent<ViewStreamProps, ViewStreamState> {
  private reactElemSub?: Subscription;

  constructor(props: ViewStreamProps) {
    super(props);
    this.state = {reactElem: null};
  }

  public componentWillMount() {
    this.reactElemSub = this.props.stream.subscribe({
      next: (elem: ReactElement<any>) => {
        this.setState(() => ({reactElem: elem}));
      },
    });
  }

  public render() {
    return this.state.reactElem;
  }

  public componentWillUnmount() {
    if (this.reactElemSub) this.reactElemSub.unsubscribe();
    this.reactElemSub = undefined;
  }
}

function neverComplete(stream: Stream<any>): Stream<any> {
  return xs.merge(stream, xs.never());
}

export default function makeComponent<So extends Sources, Si extends Sinks>(
  main: (so: So & MoreSources) => Si & MoreSinks,
  engine: Engine<So, Si>,
  screenId: string,
): any {
  return () => {
    class NavComponent extends Component<Props, State> {
      private disposeRun?: () => void;
      private commandSub?: Subscription;
      private navOptionsSub?: Subscription;
      private screenSource?: ScreenSource;
      private navSource?: NavSource;
      private backHandler: () => void;
      private evHandlers: object;
      private screenSink: Stream<ReactElement<any>>;
      private latestOpts: any;

      constructor(props: any) {
        super(props);
        this.state = {reactElem: null};
        this.backHandler = this.onBackPressed.bind(this);
        this.evHandlers = {};
        this.screenSink = xs.never();
        this.latestOpts = {};
      }

      public componentWillMount() {
        const thisId = this.props.componentId;
        const screensSource = (this.screenSource = new ScreenSource(this
          .evHandlers as any));
        const navSource = (this.navSource = new NavSource());
        const sources: So & MoreSources = {
          ...(engine.sources as object),
          screen: screensSource,
          navigation: navSource,
          props: xs
            .of(this.props)
            .compose(neverComplete)
            .remember(),
        } as any;
        const sinks = main(sources);
        this.disposeRun = engine.run(sinks);
        this.screenSink = sinks.screen || this.screenSink;

        if (sinks.navigation) {
          this.commandSub = sinks.navigation.subscribe({
            next: (cmd: Command) => {
              const id = cmd.id || thisId;
              if (cmd.type === 'push') Navigation.push(id, cmd.layout);
              if (cmd.type === 'pop') Navigation.pop(id, cmd.options);
              if (cmd.type === 'popTo') Navigation.popTo(id);
              if (cmd.type === 'popToRoot') Navigation.popToRoot(id);
              if (cmd.type === 'showOverlay') {
                Navigation.showOverlay(cmd.layout);
              }
              if (cmd.type === 'dismissOverlay') {
                Navigation.dismissOverlay(id);
              }
              if (cmd.type === 'mergeOptions') {
                Navigation.mergeOptions(id, {...this.latestOpts, ...cmd.opts});
              }
            },
          });
        }

        if (sinks.navOptions) {
          this.navOptionsSub = sinks.navOptions.subscribe({
            next: (opts: any) => {
              this.latestOpts = {...this.latestOpts, ...opts};
              Navigation.mergeOptions(thisId, this.latestOpts);
            },
          });
        }

        BackHandler.addEventListener('hardwareBackPress', this.backHandler);
      }

      public componentDidAppear() {
        if (!this.navSource) return;
        this.navSource._didAppear._n(null);
      }

      public render() {
        return createElement(
          HandlersContext.Provider,
          {value: this.evHandlers},
          createElement(ViewStream, {stream: this.screenSink}),
        );
      }

      public onBackPressed() {
        if (!this.navSource) return false;
        if ((this.navSource._back as any)._ils.length === 0) return false;
        this.navSource._back._n(null);
        return true;
      }

      public onNavigationButtonPressed(buttonId: string) {
        if (!this.navSource) return;
        this.navSource._topBar._n(buttonId);
      }

      public componentDidDisappear() {
        if (!this.navSource) return;
        this.navSource._didDisappear._n(null);
      }

      public componentWillUnmount() {
        if (this.disposeRun) this.disposeRun();
        if (this.commandSub) this.commandSub.unsubscribe();
        if (this.navOptionsSub) this.navOptionsSub.unsubscribe();
        BackHandler.removeEventListener('hardwareBackPress', this.backHandler);
        this.disposeRun = undefined;
        this.latestOpts = undefined;
      }
    }
    return NavComponent;
  };
}
