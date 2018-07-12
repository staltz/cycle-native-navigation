import xs, {Stream, Subscription} from 'xstream';
import {Component, ReactElement, createElement} from 'react';
import {BackHandler} from 'react-native';
import {Navigation} from 'react-native-navigation';
import {Engine, Sources, Sinks} from '@cycle/run';
import {ScopeContext, ReactSource, StreamRenderer} from '@cycle/react';
import {Command} from './types';
import {NavSource} from './NavSource';

export type Props = {
  componentId: string;
};

export type State = {
  source: ReactSource | null;
  sink: Stream<ReactElement<any>> | null;
};

export type MoreSources = {
  screen: ReactSource;
  navigation: NavSource;
};

export type MoreSinks = {
  navigation?: Stream<Command>;
  screen?: Stream<ReactElement<any>>;
  navOptions?: Stream<any>;
};

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
      private latestProps: Props;
      private disposeRun?: () => void;
      private commandSub?: Subscription;
      private navOptionsSub?: Subscription;
      private navSource?: NavSource;
      private backHandler: () => void;
      private latestOpts: any;

      constructor(props: any) {
        super(props);
        this.state = {source: null, sink: null};
        this.latestProps = props;
        this.backHandler = this.onBackPressed.bind(this);
        this.latestOpts = {};
      }

      public componentWillMount() {
        const thisId = this.props.componentId;
        const source = new ReactSource();
        source._props$._n(this.props);
        this.latestProps = this.props;
        const navSource = (this.navSource = new NavSource());
        const sources: So & MoreSources = {
          ...(engine.sources as object),
          screen: source,
          navigation: navSource,
          props: xs
            .of(this.props)
            .compose(neverComplete)
            .remember(),
        } as any;
        const sinks = main(sources);
        this.disposeRun = engine.run(sinks);
        const sink = sinks.screen || this.state.sink;

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
        this.setState({source, sink});
      }

      public componentDidAppear() {
        if (!this.navSource) return;
        this.navSource._didAppear._n(null);
      }

      public render() {
        const {source, sink} = this.state;
        if (!source || !sink) return null;
        return createElement(
          ScopeContext.Provider,
          {value: source._scope},
          createElement(StreamRenderer, {stream: sink}),
        );
      }

      public componentDidUpdate(props: Props) {
        if (!this.state.source) return;
        if (props === this.latestProps) return;
        this.state.source._props$._n(props);
        this.latestProps = props;
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
