import { Stream, Listener } from "xstream";
import { Component, ReactElement, createElement } from "react";
import { View, Text } from "react-native";
import { Command, ScreenVNode } from "./types";

export default function makeScreenComponent(
  screenID: string,
  latestVNodes: Map<string, ReactElement<any>>,
  vdom$: Stream<ScreenVNode>,
  command$: Stream<Command>
) {
  return () =>
    class extends Component<any, { vdom: ReactElement<any> }> {
      vdomListener: Partial<Listener<ScreenVNode>>;
      commandListener: Partial<Listener<Command>>;

      constructor(props: any) {
        super(props);

        if (this.props.navigator) {
          this.props.navigator.setOnNavigatorEvent(
            this.onNavigatorEvent.bind(this)
          );
        }

        this.vdomListener = {
          next: (x: ScreenVNode) => {
            if (x.screen === screenID) {
              this.setState(() => ({ vdom: x.vdom }));
            }
          }
        };

        this.commandListener = {
          next: (command: Command) => {
            if (this.props.navigator) {
              this.props.navigator[command.type](command);
            }
          }
        };

        if (latestVNodes.has(screenID)) {
          this.state = {
            vdom: latestVNodes.get(screenID) as ReactElement<any>
          };
        } else {
          this.state = {
            vdom: createElement(View, {}, createElement(Text, {}, screenID))
          };
        }
      }

      componentWillMount() {
        vdom$.addListener(this.vdomListener);
      }

      componentWillUnmount() {
        vdom$.removeListener(this.vdomListener);
      }

      onNavigatorEvent(event: any) {
        switch (event.id) {
          case "willAppear":
            command$.addListener(this.commandListener);
            break;
          case "didAppear":
            break;
          case "willDisappear":
            command$.removeListener(this.commandListener);
            break;
          case "didDisappear":
            break;
        }
      }

      public render() {
        return this.state.vdom;
      }
    };
}
