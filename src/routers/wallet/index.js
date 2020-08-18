// library
const express = require('express')
const { Sequelize, Op, QueryTypes } = require('sequelize')

// middlewares
const auth = require('../../middlewares/auth')

const createWalletRouter = ({ Wallet, User, Product, Affair, Auction }) => {
    const router = express.Router()

    //get wallet_amount by user_id
    router.get('/user/:id', async (req, res) => {
        // find by primary key = find by id
        Wallet.belongsTo(User, { foreignKey: 'user_id' })
        User.hasOne(Wallet)
        const wallets = await Wallet.findOne({
            attributes: ['amount'],
            where: { user_id: req.params.id },
        }
        ).then(wallets => {
            if (wallets) {
                res.send(wallets)
            } else {
                res.sendStatus(404)
            }
        });
    })

    // update wallet_amount by user_id
    router.put('/topUp/:id', async (req, res) => {
        // find by primary key = find by id
        Wallet.belongsTo(User, { foreignKey: 'user_id' })
        User.hasOne(Wallet)
        const wallets = await Wallet.update(
            { amount: req.body.amount },
            { where: { user_id: req.params.id } }
        ).then(wallets => {
            if (wallets) {
                res.send(wallets)
            } else {
                res.sendStatus(404)
            }
        });
    })


    return router
}

module.exports = {
    createWalletRouter,
}