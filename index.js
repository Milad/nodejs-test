// Load environment values
require('dotenv').config() // This is quick, I prefer to use https://www.npmjs.com/package/exp-config

const Koa = require('koa')
const router = require('./lib/router')

const app = new Koa()

// Setup controllers
app.use(router.routes())

// Listen on the specified port and wait for requests
app.listen(process.env.APP_PORT)
