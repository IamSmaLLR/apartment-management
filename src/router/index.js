import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// // 首页
// import Welcome from '../components/Welcome.vue'
// // 用户管理
// import Users from '../components/userManage/Users.vue'
// // 学生管理
// import Students from '../components/userManage/Students.vue'
// // 楼栋管理
// import Building from '../components/buildingManage/Building.vue'
// // 宿舍管理
// import Dormitory from '../components/dormitoryManage/Dormitory.vue'
// // 住宿管理
// import Assign from '../components/lodgingManage/assignLodging.vue'
// import adjustApproval from '../components/lodgingManage/adjustLodgingApproval.vue'
// import reportAdjust from '../components/lodgingManage/applyAdjustLodging.vue'
// // 维修管理
// import repairApproval from '../components/repairManage/repairApproval.vue'
// import reportRepair from '../components/repairManage/reportRepair.vue'
// // 电费管理
// import Power from '../components/powerManage/Power.vue'
// import Pay from '../components/powerManage/payPower.vue'
// import Order from '../components/powerManage/orderList.vue'

// // 租赁管理
// import Rent from '../components/rentManage/Rent.vue'
// import rentApproval from '../components/rentManage/rentApproval.vue'
// import reportRent from '../components/rentManage/reportRent.vue'

// 路由懒加载
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')

const Users = () => import(/* webpackChunkName: "Users_students" */ '../components/userManage/Users.vue')
const Students = () => import(/* webpackChunkName: "Users_students" */ '../components/userManage/Students.vue')

const Building = () => import(/* webpackChunkName: "building" */ '../components/buildingManage/Building.vue')

const Dormitory = () => import(/* webpackChunkName: "dormitory" */ '../components/dormitoryManage/Dormitory.vue')

const Assign = () => import(/* webpackChunkName: "lodging" */ '../components/lodgingManage/assignLodging.vue')
const adjustApproval = () => import(/* webpackChunkName: "lodging" */ '../components/lodgingManage/adjustLodgingApproval.vue')
const reportAdjust = () => import(/* webpackChunkName: "lodging" */ '../components/lodgingManage/applyAdjustLodging.vue')

const repairApproval = () => import(/* webpackChunkName: "repair" */ '../components/repairManage/repairApproval.vue')
const reportRepair = () => import(/* webpackChunkName: "repair" */ '../components/repairManage/reportRepair.vue')

const Power = () => import(/* webpackChunkName: "power" */ '../components/powerManage/Power.vue')
const Pay = () => import(/* webpackChunkName: "power" */ '../components/powerManage/payPower.vue')
const Order = () => import(/* webpackChunkName: "power" */ '../components/powerManage/orderList.vue')

const Rent = () => import(/* webpackChunkName: "rent" */ '../components/rentManage/Rent.vue')
const rentApproval = () => import(/* webpackChunkName: "rent" */ '../components/rentManage/rentApproval.vue')
const reportRent = () => import(/* webpackChunkName: "rent" */ '../components/rentManage/reportRent.vue')

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children:
      [{ path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/students', component: Students },
      { path: '/building', component: Building },
      { path: '/dormitory', component: Dormitory },
      { path: '/assign', component: Assign },
      { path: '/adjustApproval', component: adjustApproval },
      { path: '/reportAdjust', component: reportAdjust },
      { path: '/repairApproval', component: repairApproval },
      { path: '/reportRepair', component: reportRepair },
      { path: '/power', component: Power },
      { path: '/order', component: Order },
      { path: '/pay', component: Pay },
      { path: '/rent', component: Rent },
      { path: '/rentApproval', component: rentApproval },
      { path: '/reportRent', component: reportRent }]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to代表将要访问的路径，from代表从哪个路径跳转而来，next是一个函数，表示放行 next() 放行 next('/login') 强制跳转
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果token不存在，则重定向回login页
  if (!tokenStr) return next('/login')
  // 存在则直接放行跳转home页
  next()
})
export default router
