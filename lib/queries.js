const mysql = require('./mysql')
const { PAGINATION } = require('./constants')

/*
  This module exports a list of functions that perform queries and return promises.
  This is the only place where we are going to write MySQL queries.
  Other modules should NOT care about how we connect to the database or how we are going to persist data.
*/

/**
 * Generic query function
 * @param {string} sql
 * @param {Array} params
 * @return {*|void|PromiseLike<T | never>|Promise<T | never>}
 */
const query = (sql, params = []) => {
  // The promise resolves to [rows, fields], but we are only interested in the rows for now.
  return mysql.query(sql, params)
    .then(([rows]) => rows)
}

/**
 * Inserts a new book to the database
 * @param {Object} book
 * @return {*|void|PromiseLike<T | never>|Promise<T | never>}
 */
const insertBook = book => {
  const sql = 'INSERT INTO `books` (title, release_date, author, description, image) VALUES (?, ?, ?, ?, ?)'

  const params = [
    book.title,
    book.release_date,
    book.author,
    book.description,
    book.image
  ]

  return query(sql, params)
}

/**
 * Updates a new book in the database
 * @param {Object} book
 * @return {*|void|PromiseLike<T | never>|Promise<T | never>}
 */
const updateBook = book => {
  const sql = 'UPDATE `books` SET title = ?, release_date = ?, author = ?, description = ?, image  = ? WHERE id = ?'

  const params = [
    book.title,
    book.release_date,
    book.author,
    book.description,
    book.image,
    book.id
  ]

  return query(sql, params)
}

/**
 * Generates the where clause from the search conditions
 * @param {Object} conditions
 * @return {{where: string, params: Array}}
 */
const generateWhereClause = (conditions) => {
  let sql = ''

  const where = []
  const params = []

  Object.keys(conditions)
    .forEach(condition => {
      where.push(`${condition} = ?`)
      params.push(conditions[condition])
    })

  if (where.length) {
    sql += ` WHERE ${where.join(' AND ')}`
  }

  return {
    where: sql,
    params
  }
}

/**
 * Counts the books that satisfy the search conditions
 * @param {Object} conditions
 * @return {*|void|PromiseLike<number | PaymentItem | never>|Promise<number | PaymentItem | never>}
 */
const countBooks = conditions => {
  let sql = 'SELECT COUNT(*) AS total FROM books'

  const { where, params } = generateWhereClause(conditions)

  if (where) {
    sql += where
  }

  return query(sql, params)
    .then(rows => rows[0].total)
}

/**
 * Searches the books table for books defined by the search conditions.
 * @see README.md
 * @param {Object} conditions
 * @param {string} sortBy
 * @param {string} direction
 * @param {number} offset
 * @param {number} perPage
 * @return {*|void|PromiseLike<T | never>|Promise<T | never>}
 */
const searchBooks = (conditions = {}, sortBy = 'id', direction = 'ASC', offset = 0, perPage = PAGINATION.DEFAULT_PER_PAGE) => {
  let sql = 'SELECT * FROM books'

  const { where, params } = generateWhereClause(conditions)

  if (where) {
    sql += where
  }

  sql += ` ORDER BY ${sortBy} ${direction}`
  sql += ` LIMIT ${offset}, ${perPage}`

  return query(sql, params)
}

/**
 * Retrieves one book by its ID
 * @param {number} bookId
 * @return {*|void|PromiseLike<T | never>|Promise<T | never>}
 */
const getBookById = bookId => {
  const sql = 'SELECT * FROM books WHERE id = ?'

  return query(sql, [bookId])
}

module.exports = {
  countBooks,
  getBookById,
  insertBook,
  searchBooks,
  updateBook
}
