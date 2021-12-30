import Vue from 'nativescript-vue';
import App from './components/App';
import store from './store';

Vue.registerElement(
  'PullToRefresh',
  () => require('@nstudio/nativescript-pulltorefresh').PullToRefresh
);

//Vue.config.silent = !__DEV__

new Vue({
  store,
  render: (h) => h(App),
}).$start()
