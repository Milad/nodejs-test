const {
  countBooks,
  getBookById,
  insertBook,
  searchBooks,
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

const hasOwnProperty = (obj, property) => Object.prototype.hasOwnProperty.call(obj, property) && obj[property]

const findBooks = async ctx => {
  const conditions = {}
  let sortBy = 'id'
  let direction = 'ASC'

  // This is already provided by a dedicated endpoint
  if (hasOwnProperty(ctx.request.query, 'id')) {
    conditions.id = ctx.request.query.id
  }

  if (hasOwnProperty(ctx.request.query, 'title')) {
    conditions.title = ctx.request.query.title
  }

  if (hasOwnProperty(ctx.request.query, 'release_date')) {
    conditions.release_date = ctx.request.query.release_date
  }

  if (hasOwnProperty(ctx.request.query, 'author')) {
    conditions.author = ctx.request.query.author
  }

  // We should allow sorting by certain fields only, and enforce a default value
  // if the client tries to access illegal or non-existing fields
  // Other than security, we want to allow sorting by fields that are optimized for search
  if (hasOwnProperty(ctx.request.query, 'sort_by')) {
    switch (ctx.request.query.sort_by) {
      case 'id':
        sortBy = 'id'
        break
      case 'title':
        sortBy = 'title'
        break
      case 'release_date':
        sortBy = 'release_date'
        break
      case 'author':
        sortBy = 'author'
        break
    }
  }

  if (hasOwnProperty(ctx.request.query, 'direction')) {
    switch (ctx.request.query.direction.toLowerCase()) {
      case 'asc':
        direction = 'ASC'
        break
      case 'desc':
        direction = 'DESC'
        break
    }
  }

  try {
    const count = await countBooks(conditions)

    console.log(count)

    const results = await searchBooks(conditions, sortBy, direction)

    if (results.length) {
      ctx.response.status = HTTP_CODES.OK
      ctx.response.body = results
    } else {
      ctx.response.status = HTTP_CODES.NOT_FOUND
      ctx.response.body = errResponse('No Books Found')
    }
  } catch (e) {
    ctx.response.status = HTTP_CODES.INTERNAL_SERVER_ERROR
    ctx.response.body = errResponse(e.message)
  }
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
      ctx.response.body = errResponse('Book not Found')
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
      ctx.response.body = errResponse('Book not Found')
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
