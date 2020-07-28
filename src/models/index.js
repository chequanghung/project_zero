const { Sequelize } = require('sequelize')
const { createProductModel } = require('./product')
const { createUserModel } = require('./user')
const { createFruitModel } = require('./fruit')

// like entities
const createModels = async ({ dbName, dbUser, dbPass, dbHost }) => {
    // establish a connection
    const sequelize = new Sequelize(dbName, dbUser, dbPass, {
        host: dbHost,
        dialect: 'mysql'
    })

    // wait for authentication
    await sequelize.authenticate()

    return {
        Product: createProductModel(sequelize),
        User: createUserModel(sequelize),
        Fruit: createFruitModel(sequelize)
    }
}

module.exports = { createModels }
