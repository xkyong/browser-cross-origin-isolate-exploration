const path = require('path')

const Koa = require('koa')
const staticAssets = require('koa-static')
const consola = require('consola')

const app = new Koa()

app.use(async (ctx, next) => {
  // 特定组件标识，不启用跨域隔离
  if (/^\/sub/.test(ctx.path)) {
    ctx.set({
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none'
    })
  } else {
    ctx.set({
      // 启用跨域隔离
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',

      // 以下2个标头只会产生跨域隔离报告，不会对项目有任何影响
      // 'Cross-Origin-Embedder-Policy-Report-Only': 'require-corp',
      // 'Cross-Origin-Opener-Policy-Report-Only': 'same-origin',
    })
  }

  await next()
})

app.use(staticAssets(path.resolve(__dirname, './dist')))

app.listen(8999, () => {
  consola.success('the server-a is running in: http://127.0.0.1:8999')
})