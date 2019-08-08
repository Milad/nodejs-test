const {
  getBookById,
  insertBook,
  updateBook
} = require('../queries')
const { bookSchema } = require('../validation')
const { HTTP_CODES } = require('../constants')

const errResponse = msg => {
  return {
    error: 'Error!',
    error_description: msg
  }
}

const addBook = async ctx => {
  // Validate User input and act accordingly
  const result = bookSchema.validate(ctx.request.body)

  if (result.error) {
    ctx.response.status = HTTP_CODES.BAD_REQUEST
    ctx.response.body = errResponse(result.error.message)
  } else {
    // No errors detected, we will insert a row to the table
    try {
      const ddd = await insertBook(ctx.request.body)

      ctx.response.status = HTTP_CODES.CREATED
      ctx.response.body = {
        id: ddd.insertId,
        ...ctx.request.body
      }
    } catch (e) {
      ctx.response.status = HTTP_CODES.INTERNAL_SERVER_ERROR
      ctx.response.body = errResponse(e.message)
    }
  }
}

const findBooks = ctx => {
  ctx.body = 'Hello World'
}

const findOneBook = async ctx => {
  const bookId = parseInt(ctx.params.id, 10)

  try {
    const oldBookData = await getBookById(bookId)

    if (oldBookData.length) {
      ctx.response.status = HTTP_CODES.OK
      ctx.response.body = oldBookData[0]
    } else {
      ctx.response.status = HTTP_CODES.NOT_FOUND
      ctx.response.body = errResponse('Book not found')
    }
  } catch (e) {
    ctx.response.status = HTTP_CODES.INTERNAL_SERVER_ERROR
    ctx.response.body = errResponse(e.message)
  }
}

const modifyBook = async ctx => {
  try {
    const bookId = parseInt(ctx.params.id, 10)

    const oldBookData = await getBookById(bookId)

    if (oldBookData.length) {
      // We will overwrite the DB book data with the incoming patch
      const newBookData = Object.assign({}, oldBookData[0], ctx.request.body)

      // Then we are going to validate normally
      const result = bookSchema.validate(newBookData)

      if (result.error) {
        ctx.response.status = HTTP_CODES.BAD_REQUEST
        ctx.response.body = errResponse(result.error.message)
      } else {
        // No errors detected, we will update the row in the table
        await updateBook(newBookData)

        ctx.response.status = HTTP_CODES.OK
        ctx.response.body = newBookData
      }
    } else {
      ctx.response.status = HTTP_CODES.NOT_FOUND
      ctx.response.body = errResponse('Book not found')
    }
  } catch (e) {
    ctx.response.status = HTTP_CODES.INTERNAL_SERVER_ERROR
    ctx.response.body = errResponse(e.message)
  }
}

module.exports = {
  addBook,
  findBooks,
  findOneBook,
  modifyBook
}
