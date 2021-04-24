import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/css/global.css';
import './assets/fonts/iconfont.css';
import axios from 'axios';

axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/';
Vue.prototype.$http = axios;
// 在 request 拦截器中，展示进度条 NProgress.start()
axios.interceptors.request.use(config => {
  console.log(config)
  // NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})

Vue.config.productionTip = false;
Vue.use(ElementUI);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
