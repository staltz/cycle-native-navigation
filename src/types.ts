import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {Layout, Options} from 'react-native-navigation';
import {GlobalScreen} from './symbols';
import {NavSource} from './NavSource';

export type PushCommand = {
  type: 'push';
  id?: string;
  layout: Layout;
};

export type PopCommand = {
  type: 'pop';
  id?: string;
  options: Options;
};

export type PopToCommand = {
  type: 'popTo';
  id?: string;
};

export type PopToRootCommand = {
  type: 'popToRoot';
  id?: string;
};

export type SetStackRootCommand = {
  type: 'setStackRoot';
  id?: string;
  layout: Layout;
};

export type ShowOverlayCommand = {
  type: 'showOverlay';
  id?: string;
  layout: Layout;
};

export type DismissOverlayCommand = {
  type: 'dismissOverlay';
  id?: string;
};

export type ShowModalCommand = {
  type: 'showModal';
  id?: string;
  layout: Layout;
};

export type DismissModalCommand = {
  type: 'dismissModal';
  id?: string;
};

export type DismissAllModalsCommand = {
  type: 'dismissAllModals';
  id?: string;
};

export type MergeOptionsCommand = {
  type: 'mergeOptions';
  id?: string;
  opts: Options;
};

export type Command =
  | PushCommand
  | PopCommand
  | PopToCommand
  | PopToRootCommand
  | SetStackRootCommand
  | ShowOverlayCommand
  | DismissOverlayCommand
  | ShowModalCommand
  | DismissModalCommand
  | DismissAllModalsCommand
  | MergeOptionsCommand;

export type MoreScreenSources = {
  screen: ReactSource;
  navigation: NavSource;
};

export type MoreScreenSinks = {
  navigation?: Stream<Command>;
  screen?: Stream<ReactElement<any>>;
  navOptions?: Stream<any>;
};

export type Screens = {
  [screenId: string]: (so: any) => any;
  [GlobalScreen]?: (so: any) => any;
};
