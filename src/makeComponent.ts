import xs, {Stream, Subscription} from 'xstream';
import {Component, ComponentClass, ReactElement, createElement} from 'react';
import {BackHandler} from 'react-native';
import {Navigation} from 'react-native-navigation';
import {Engine, MatchingMain, Drivers, Sources} from '@cycle/run';
import {ScopeContext, ReactSource, StreamRenderer} from '@cycle/react';
import {Command, MoreScreenSources, MoreScreenSinks} from './types';
import {NavSource} from './NavSource';

export type Props = {
  componentId: string;
};

export type State = {
  source: ReactSource | null;
  sink: Stream<ReactElement<any>> | null;
};

type NavSubscription = {
  remove(): void;
};

function neverComplete(stream: Stream<any>): Stream<any> {
  return xs.merge(stream, xs.never());
}

export default function makeComponent<
  D extends Drivers,
  M extends MatchingMain<D, M>,
>(
  main: MatchingMain<D, M>, // (so: So & MoreSources) => Si & MoreSinks,
  engine: Engine<D>,
  screenId: string,
): () => ComponentClass<Props> {
  return () => {
    class NavComponent extends Component<Props, State> {
      private disposeRun?: () => void;
      private commandSub?: Subscription;
      private navOptionsSub?: Subscription;
      private navSource?: NavSource;
      private navEventsSub: NavSubscription;
      private backHandler: () => void;
      private latestOpts: any;

      constructor(props: any) {
        super(props);
        this.state = {source: null, sink: null};
        this.backHandler = this.onBackPressed.bind(this);
        this.latestOpts = {};
        this.navEventsSub = Navigation.events().bindComponent(this);
      }

      public componentDidMount() {
        const thisId = this.props.componentId;
        const source = new ReactSource();
        source._props$._n(this.props);
        const navSource = (this.navSource = new NavSource());
        const sources: Sources<D> & MoreScreenSources = {
          ...(engine.sources as object),
          screen: source,
          navigation: navSource,
          props: xs.of(this.props).compose(neverComplete).remember(),
        } as any;
        const sinks: MoreScreenSinks = main(sources);
        this.disposeRun = engine.run(sinks);
        const sink = sinks.screen ?? this.state.sink;

        if (sinks.navigation) {
          this.commandSub = sinks.navigation.subscribe({
            next: (cmd: Command) => {
              if (cmd.type === 'setRoot') {
                Navigation.setRoot(cmd.layout);
                return;
              }
              const id = cmd.id ?? thisId;

              switch (cmd.type) {
                case 'push':
                  Navigation.push(id, cmd.layout);
                  break;
                case 'pop':
                  Navigation.pop(id, cmd.options);
                  break;
                case 'popTo':
                  Navigation.popTo(id);
                  break;
                case 'popToRoot':
                  Navigation.popToRoot(id);
                  break;
                case 'showModal':
                  Navigation.showModal(cmd.layout);
                  break;
                case 'dismissModal':
                  Navigation.dismissModal(id);
                  break;
                case 'dismissAllModals':
                  Navigation.dismissAllModals();
                  break;
                case 'setStackRoot':
                  Navigation.setStackRoot(id, cmd.layout);
                  break;
                case 'showOverlay':
                  Navigation.showOverlay(cmd.layout);
                  break;
                case 'dismissOverlay':
                  Navigation.dismissOverlay(id);
                  break;
                case 'mergeOptions':
                  Navigation.mergeOptions(id, {
                    ...this.latestOpts,
                    ...cmd.opts,
                  });
                  break;
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

      public componentDidUpdate(prevProps: Props) {
        if (!this.state.source) return;
        if (this.props === prevProps) return;
        this.state.source._props$._n(this.props);
      }

      public onBackPressed() {
        if (!this.navSource) return false;
        if ((this.navSource._back as any)._ils.length === 0) return false;
        this.navSource._back._n(null);
        return true;
      }

      public navigationButtonPressed({buttonId}: {buttonId: string}) {
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
        this.navEventsSub.remove();
        BackHandler.removeEventListener('hardwareBackPress', this.backHandler);
        this.disposeRun = undefined;
        this.latestOpts = undefined;
      }
    }
    return NavComponent;
  };
}
