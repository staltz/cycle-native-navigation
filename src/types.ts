import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {Layout, Options, LayoutRoot} from 'react-native-navigation';
import {GlobalScreen} from './symbols';
import {NavSource} from './NavSource';

export interface PushCommand {
  type: 'push';
  id?: string;
  layout: Layout;
};

export interface PopCommand {
  type: 'pop';
  id?: string;
  options: Options;
};

export interface PopToCommand {
  type: 'popTo';
  id?: string;
};

export interface PopToRootCommand {
  type: 'popToRoot';
  id?: string;
};

export interface SetStackRootCommand {
  type: 'setStackRoot';
  id?: string;
  layout: Layout;
};

export interface ShowOverlayCommand {
  type: 'showOverlay';
  id?: string;
  layout: Layout;
};

export interface DismissOverlayCommand {
  type: 'dismissOverlay';
  id?: string;
};

export interface ShowModalCommand {
  type: 'showModal';
  id?: string;
  layout: Layout;
};

export interface SetRootCommand {
  type: 'setRoot';
  layout: LayoutRoot;
};

export interface DismissModalCommand {
  type: 'dismissModal';
  id?: string;
};

export interface DismissAllModalsCommand {
  type: 'dismissAllModals';
  id?: string;
};

export interface MergeOptionsCommand {
  type: 'mergeOptions';
  id?: string;
  opts: Options;
};

export type Command =
  | PushCommand
  | PopCommand
  | PopToCommand
  | PopToRootCommand
  | SetRootCommand
  | SetStackRootCommand
  | ShowOverlayCommand
  | DismissOverlayCommand
  | ShowModalCommand
  | DismissModalCommand
  | DismissAllModalsCommand
  | MergeOptionsCommand;

export interface MoreScreenSources {
  screen: ReactSource;
  navigation: NavSource;
};

export interface MoreScreenSinks {
  navigation?: Stream<Command>;
  screen?: Stream<ReactElement<any>>;
  navOptions?: Stream<any>;
};

export interface Screens {
  [screenId: string]: (so: any) => any;
  [GlobalScreen]?: (so: any) => any;
};
