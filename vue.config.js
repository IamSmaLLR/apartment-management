module.exports = {
    chainWebpack: config => {
      // 发布模式
      config.when(process.env.NODE_ENV === 'production', config => {
        config
          .entry('app')
          .clear()
          .add('./src/main-prod.js')
        // 配置externals节点 就不打包这些 去windows全局去查找对应的包
        config.set('externals', {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          axios: 'axios',
          lodash: '_',
          echarts: 'echarts',
          nprogress: 'NProgress',
          'vue-quill-editor': 'editor'
        })
        config.plugin('html').tap(args => {
          args[0].isProd = true
          return args
        })
      })

      // 开发模式
      config.when(process.env.NODE_ENV === 'development', config => {
        config
          .entry('app')
          .clear()
          .add('./src/main-dev.js')

        config.plugin('html').tap(args => {
          args[0].isProd = false
          return args
        })
      })
    }
  }
