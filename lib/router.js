const Router = require('koa-router')
const bodyParser = require('koa-body')
const books = require('./controllers/books')

const router = new Router()

router.post('/books', bodyParser(), books.addBook)
router.get('/books', books.findBooks)
router.get('/books/:id', books.findOneBook)
router.put('/books/:id', bodyParser(), books.modifyBook)

module.exports = router
