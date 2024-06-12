// core
import { createApp } from "vue"
import App from "@/App.vue"
import store from "@/store"
import router from "@/router"
import "@/router/permission"
import echarts from "@/utils/echart"
// load
import { loadSvg } from "@/icons"
import { loadPlugins } from "@/plugins"
import { loadDirectives } from "@/directives"
// css
import "uno.css"
import "normalize.css"
import "element-plus/dist/index.css"
import "element-plus/theme-chalk/dark/css-vars.css"
import "@/styles/index.scss"

const app = createApp(App)

/** 加载插件 */
loadPlugins(app)
/** 加载全局 SVG */
loadSvg(app)
/** 加载自定义指令 */
loadDirectives(app)

// app.config.globalProperties.$echarts = echarts // vue3的挂载方式（一个用于注册能够被应用内所有组件实例访问到的全局属性的对象。）
app.provide("$echarts", echarts) // vue3采用provide, inject方式使用

app.use(store).use(router)
router.isReady().then(() => {
  app.mount("#app")
})
