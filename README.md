# Cycle Native Navigation

Cycle.js drivers that wrap `react-native-navigation`, to handle navigation between multiple screens with native support. These drivers build on top of `@cycle/native-screen`, so you're not supposed to directly use the `@cycle/native-screen` driver if you are using this package.

```
npm install cycle-native-navigation
```

Note: `react-native-navigation`, `react-native`, `react` are expected peer dependencies.

**Usage:**

```js
import {run} from '@cycle/run';
import {makeSingleScreenNavDrivers} from 'cycle-native-navigation';

function main(sources) {
  // ... your application ...
}

const {screenVNodeDriver, commandDriver} = makeSingleScreenNavDrivers(
  ['myapp.MainScreen', 'myapp.WelcomeScreen'],
  {
    screen: {
      screen: 'myapp.WelcomeScreen',
    },
  }
);

run(main, {
  screen: screenVNodeDriver,
  navCommand: commandDriver
});
```
