const mysql = require('./mysql')

/*
  This module exports a list of functions that perform queries and return promises.
  This is the only place where we are going to write MySQL queries.
  Other modules should NOT care about how we connect to the database or how we are going to persist data.
*/

const query = (sql, params = []) => {
  // The promise resolves to [rows, fields], but we are only interested in the rows for now.
  return mysql.query(sql, params)
    .then(([rows]) => rows)
}

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

  return [sql, params]
}

const countBooks = conditions => {
  let sql = 'SELECT COUNT(*) AS total FROM books'

  const [where, params] = generateWhereClause(conditions)

  if (where) {
    sql += where
  }

  return query(sql, params)
    .then(rows => rows[0].total)
}

const searchBooks = (conditions = {}, sortBy = 'id', direction = 'ASC') => {
  let sql = 'SELECT * FROM books'

  const [where, params] = generateWhereClause(conditions)

  if (where) {
    sql += where
  }

  sql += ` ORDER BY ${sortBy} ${direction}`

  console.log(sql, params)

  return query(sql, params)
}

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
