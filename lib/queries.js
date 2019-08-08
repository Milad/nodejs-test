const mysql = require('./mysql')

/*
  This module exports a list of functions that perform queries and return promises.
  This is the only place where we are going to write MySQL queries.
  Other modules should NOT care about how we connect to the database or how we are going to persist data.
*/

const query = (sql, parameters = []) => {
  // The promise resolves to [rows, fields], but we are only interested in the rows for now.
  return mysql.query(sql, parameters)
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

const getAllBooks = () => {
  const sql = 'SELECT * FROM books'

  return query(sql)
}

const getBookById = bookId => {
  const sql = 'SELECT * FROM books WHERE id = ?'

  return query(sql, [bookId])
}

module.exports = {
  insertBook,
  getBookById,
  getAllBooks,
  updateBook
}
