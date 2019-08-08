const tableName = 'books'

module.exports = {
  up: (queryInterface, sequelize) => {
    return queryInterface.createTable(tableName, {
      id: {
        type: sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: sequelize.STRING(255),
        allowNull: false
      },
      release_date: {
        type: sequelize.DATEONLY,
        allowNull: false
      },
      author: {
        type: sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: sequelize.TEXT,
        defaultValue: null,
        allowNull: true
      },
      image: {
        type: sequelize.STRING(255),
        defaultValue: null,
        allowNull: true
      }
    })
  },
  down: queryInterface => queryInterface.dropTable(tableName)
}
