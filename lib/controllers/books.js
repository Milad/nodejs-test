const pagination = require('pagination-logic')
const {
  countBooks,
  getBookById,
  insertBook,
  searchBooks,
  updateBook
} = require('../queries')
const { bookSchema } = require('../validation')
const {
  HTTP_CODES,
  PAGINATION
} = require('../constants')

/**
 * Unifies the way we format errors in our responses
 * @param {string} msg
 * @return {{error_description: *, error: string}}
 */
const errResponse = msg => {
  return {
    error: 'Error!',
    error_description: msg
  }
}

/**
 * Controller for adding a new book
 * @param {Object} ctx
 * @return {Promise<void>}
 */
const addBook = async ctx => {
  // Validate User input and act accordingly
  const result = bookSchema.validate(ctx.request.body)

  if (result.error) {
    ctx.response.status = HTTP_CODES.BAD_REQUEST
    ctx.response.body = errResponse(result.error.message)
  } else {
    // No errors detected, we will insert a row to the table
    try {
      const row = await insertBook(ctx.request.body)

      ctx.response.status = HTTP_CODES.CREATED
      ctx.response.body = {
        id: row.insertId,
        ...ctx.request.body
      }
    } catch (e) {
      ctx.response.status = HTTP_CODES.INTERNAL_SERVER_ERROR
      ctx.response.body = errResponse(e.message)
    }
  }
}

/**
 * Checks if the object has the property and it's not empty
 * @param {Object} obj
 * @param {string} property
 * @return {boolean}
 */
const hasOwnProperty = (obj, property) => Object.prototype.hasOwnProperty.call(obj, property) && obj[property]

/**
 * Calculate all the necessary information about pagination.
 * @param {Object} ctx
 * @param {number} total
 * @return {{perPage: number, offset: number, _links: {context: string, self: *, base: *}}}
 */
const preparePagination = (ctx, total) => {
  const requestedPage = parseInt(ctx.request.query.page, 10) || 1
  let perPage = parseInt(ctx.request.query.per_page, 10) || PAGINATION.DEFAULT_PER_PAGE

  if (perPage > PAGINATION.MAX_PER_PAGE) {
    perPage = PAGINATION.MAX_PER_PAGE
  }

  const pageObject = {
    total,
    single: perPage,
    pageSize: 4,
    currentPage: requestedPage,
    pageLinkRule: pageNumber => {
      const url = new URL(ctx.request.href)

      url.searchParams.set('page', pageNumber)

      return url.toString().replace(ctx.request.origin, '')
    }
  }

  const paginationResult = pagination(pageObject)

  const _links = {
    base: ctx.request.origin,
    context: '',
    self: ctx.request.href
  }

  if (paginationResult.hasPrevious) {
    _links.prev = paginationResult.previousPage.link
  }

  if (paginationResult.hasNext) {
    _links.next = paginationResult.nextPage.link
  }

  let offset = (paginationResult.currentPage - 1) * perPage

  if (offset < 0) {
    offset = 0
  }

  return {
    _links,
    offset,
    perPage
  }
}

/**
 * Controller that searches for books, sorts them and responds with the results in a paginated way.
 * @param {Object} ctx
 * @return {Promise<void>}
 */
const findBooks = async ctx => {
  /* FILTERING */
  const conditions = {}
  // This is already provided by a dedicated endpoint
  if (hasOwnProperty(ctx.request.query, 'id') && ctx.request.query.id) {
    conditions.id = ctx.request.query.id
  }

  if (hasOwnProperty(ctx.request.query, 'title') && ctx.request.query.title) {
    conditions.title = ctx.request.query.title
  }

  if (hasOwnProperty(ctx.request.query, 'release_date') && ctx.request.query.release_date) {
    conditions.release_date = ctx.request.query.release_date
  }

  if (hasOwnProperty(ctx.request.query, 'author') && ctx.request.query.author) {
    conditions.author = ctx.request.query.author
  }

  /* SORTING */
  let sortBy = 'id'
  let direction = 'ASC'
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
    /* PAGINATION */
    const total = await countBooks(conditions)

    const { _links, offset, perPage } = preparePagination(ctx, total)

    const results = await searchBooks(conditions, sortBy, direction, offset, perPage)

    if (results.length) {
      ctx.response.status = HTTP_CODES.OK
      ctx.response.body = {
        _links,
        results
      }
    } else {
      ctx.response.status = HTTP_CODES.NOT_FOUND
      ctx.response.body = errResponse('No Books Found')
    }
  } catch (e) {
    ctx.response.status = HTTP_CODES.INTERNAL_SERVER_ERROR
    ctx.response.body = errResponse(e.message)
  }
}

/**
 * Controller that finds one book and responds with it.
 * @param {Object} ctx
 * @return {Promise<void>}
 */
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

/**
 * Controller that handles updating the info of books.
 * @param {Object} ctx
 * @return {Promise<void>}
 */
const modifyBook = async ctx => {
  try {
    const bookId = parseInt(ctx.params.id, 10)

    const oldBookData = await getBookById(bookId)

    if (oldBookData.length) {
      // We will overwrite the DB book data with the incoming patch
      const newBookData = Object.assign({}, oldBookData[0], ctx.request.body)

      // Make sure the previous line didn't overwrite the id!
      newBookData.id = bookId

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
