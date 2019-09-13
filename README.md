# Cycle Native Navigation

Integrate your Cycle.js app with `react-native-navigation`, to handle navigation between multiple screens with native support. This library replaces `@cycle/run` and is not a driver, but provides some built-in drivers.

```
npm install cycle-native-navigation
```

Note: `react-native-navigation`, `react-native`, `react` are expected peer dependencies.

- If using React Native 0.60 or higher, choose this library's version 6.0.0+
- If using React Native 0.59 or lower, choose 5.2.0 or lower

**Usage:**

```js
import {run} from 'cycle-native-navigation';

const screens = {
  MainScreen: function main(sources) { /* Your Cycle.js component here... */ },
  ListScreen: function list(sources) { /* ... */ },
  HelpScreen: function help(sources) { /* ... */ },
};

const drivers = {
  // Typical Cycle.js drivers object that is given to run()
};

const layout = {
  // The initial app layout, see react-native-navigation docs about this
};

const defaultNavOptions = {
  // Navigation options for every screen, see react-native-navigation docs
};

run(screens, drivers, layout, defaultNavOptions);
```
