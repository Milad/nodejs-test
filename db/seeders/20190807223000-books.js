const { Op } = require('sequelize')

const tableName = 'books'

// Source: https://github.com/benoitvallon/100-best-books/blob/master/books.json
const books = require('./books.json')

const data = books
  .filter(book => book.year > 0)
  .map((book, index) => {
    return {
      id: index + 1,
      title: book.title,
      release_date: `${book.year}-01-01`,
      author: book.author,
      description: book.link,
      image: book.imageLink
    }
  })

module.exports = {
  up: queryInterface => queryInterface.bulkInsert(tableName, data),
  down: queryInterface => queryInterface.bulkDelete(tableName, { id: { [Op.in]: data.map(item => item.id) } })
}
