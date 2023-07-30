const fs = require('fs')
const path = require('path')

const Koa = require('koa')
const Router = require('koa-router')
const logger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const consola = require('consola')
const staticAssets = require('koa-static')

const app = new Koa()
const testRouter = new Router({ prefix: '/coi' })

app.use(async (ctx, next) => {
  // 设置 cors，解决跨域接口请求问题
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Methods', 'get,post,put')
  ctx.set('Access-Control-Allow-Headers', 'content-type')

  // tip：注释掉下边2行 ctx.set 代码可看到跨域隔离未被处理的效果！！！
  // 如果项目中启用了 跨域隔离 机制，第三方（serverB）可以通过如下corp配置解决第三方资源在项目中加载不出来的问题
  // 跟项目中资源标签设置 crossorigin 属性达到的效果基本一致！
  ctx.set('Cross-Origin-Resource-Policy', 'cross-origin')

  // 如果是 iframe，还得设置 coep
  ctx.set('Cross-Origin-Embedder-Policy', 'require-corp')

  await next()
})

testRouter.get('/', async (ctx, next) => {
  ctx.body = '<h3>browser-cross-origin-isolate-exploration</h3>'
  await next()
})

testRouter.get('/hello', async (ctx, next) => {
  const { name = 'test', age = 1024 } = ctx.query
  ctx.body = {
    code: '0',
    msg: 'success',
    data: `hello, i am ${name}, i am ${age} years old.`
  }
  await next()
})

testRouter.post('/hello-post', async (ctx, next) => {
  const { name, age } = ctx.request.body
  ctx.body = {
    code: '0',
    msg: 'success',
    data: `hello-post, i am ${name}, i am ${age} years old.`
  }
  await next()
})

/**
 * 静态资源
*/
testRouter.get('/assets/:assetName', async (ctx, next) => {
  const { assetName } = ctx.params

  ctx.set({
    'Access-Control-Expose-Headers': 'Content-Disposition',
    'Content-Disposition': 'attachment; filename' + assetName,
    'Content-Type': 'application/octet-stream; charset=utf-8'
  })

  // 创建文件读取流
  const res = fs.createReadStream(`${__dirname}/dist/assets/${assetName}`)

  ctx.body = res

  await next()
})


app.use(logger())
app.use(bodyParser())
app.use(testRouter.routes())
app.use(testRouter.allowedMethods())
app.use(staticAssets(path.resolve(__dirname, './dist')))

app.listen(3000, () => {
  consola.success('the server-b is running in: http://127.0.0.1:3000')
})
