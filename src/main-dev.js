import Vue from 'vue'
import App from './App.vue'
// 导入路由规则
import router from './router'
// 导入element UI
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入axios包
import axios from 'axios'
// 导入表格树形网格插件
import ZkTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器组件
import editor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 导入NProgress包 js和css loading条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 在request拦截器中，展示进度条 NProgress.start()
// axios请求拦截器
axios.interceptors.request.use(config => {
  NProgress.start()
  // 为请求头对象，添加Token验证的Authorization字段，之后带回服务器进行校验
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在response拦截器，隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
// 将包挂载到vue的原型对象上，每个vue组件都可以访问this.$http,进行ajax请求
Vue.prototype.$http = axios
// 阻止现实生产模式的消息
Vue.config.productionTip = false
// 引入树形图表
Vue.component('tree-table', ZkTable)
// 将富文本编辑器注册为全局可用的组件
Vue.use(editor)
// 用过滤器格式化时间
Vue.filter('dateFormat1', function(originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
Vue.filter('dateFormat2', function(originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  return `${y}-${m}-${d}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
