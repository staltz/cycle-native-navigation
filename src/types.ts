export type PushCommand = {
  type: 'push';
  id?: string;
  layout: any;
};

export type PopCommand = {
  type: 'pop';
  id?: string;
  options: any;
};

export type PopToCommand = {
  type: 'popTo';
  id?: string;
};

export type PopToRootCommand = {
  type: 'popToRoot';
  id?: string;
};

export type ShowOverlayCommand = {
  type: 'showOverlay';
  id?: string;
  layout: any;
};

export type DismissOverlayCommand = {
  type: 'dismissOverlay';
  id?: string;
};

export type MergeOptionsCommand = {
  type: 'mergeOptions';
  id?: string;
  opts: any;
};

export type Command =
  | PushCommand
  | PopCommand
  | PopToCommand
  | PopToRootCommand
  | ShowOverlayCommand
  | DismissOverlayCommand
  | MergeOptionsCommand;

export type Screens = {
  [screenId: string]: (so: any) => any;
};
