// library
const express = require('express')
const { Sequelize, Op, QueryTypes } = require('sequelize')
// middlewares
const auth = require('../../middlewares/auth')
const product = require('../product')
const auction_bid = require('../auction_bid')
const auction = require('../../models/auction')

const createAuctionRouter = ({ Auction, Product, AuctionBid, Address, ProductMedia }) => {
    const router = express.Router()

    // get auction date created
    // chưa rõ chức năng
    router.get('/product/:id', async (req, res) => {
        // find by primary key = find by id
        // Product.hasMany(Auction , {foreignKey: 'product_id'})
        // Auction.belongsTo(Product)
        // TODO: findAll where datediff: 
        const auctions = await models.Auction.findAll(
            {
                where: { product_id: req.params.id, auction_status: 1 },
                attributes: ['date_created'],
            }
        )
        if (auctions) {
            res.send(auctions)
        } else {
            res.sendStatus(404)
        }

    })

    router.get('/latest', async (req, res) => {
        // product 1 - n auction
        Product.hasMany(Auction, { foreignKey: 'product_id' })
        Auction.belongsTo(Product, { foreignKey: 'product_id' })

        // address 1 - n product
        Address.hasMany(Product, { foreignKey: 'address_id' })
        Product.belongsTo(Address, { foreignKey: 'address_id' })

        // product 1 - n product_media
        Product.hasMany(ProductMedia, { foreignKey: 'product_id' })
        ProductMedia.belongsTo(Product, { foreignKey: 'product_id' })

        const auctions = await Auction.findAll({
            attributes: [
                'id',
                [Sequelize.fn('datediff', Sequelize.col('Auction.date_closure'), Sequelize.literal('CURRENT_TIMESTAMP')), 'remain'],
                'price_cur',
                'views'
            ],
            limit: 10,
            order: [['views', 'DESC']],
            include: [
                {
                    model: Product,
                    attributes: ['id', 'title', 'weight'],
                    include: [
                        {
                            model: Address,
                            attributes: ['province'],
                            required: true
                        },
                        {
                            model: ProductMedia,
                            attributes: ['media_url'],
                            order: [['date_created', 'DESC']],
                            // required: true
                        }
                    ],
                    required: true
                }
            ],
        })


        if (auctions) {
            res.send(auctions)
        } else {
            res.sendStatus(404)
        }
    })

    // get all information of auction
    // khi bấm vào 1 auction thì load ra tất cả thông tin của 1 auction và thêm delete auction_bid 
    router.get('/auctionBid', async (req, res) => {

        Auction.hasMany(AuctionBid, { foreignKey: 'auction_id' })
        AuctionBid.belongsTo(Auction, { foreignKey: 'auction_id' })

        const auctions = await Auction.findAll({
            include: [{
                model: AuctionBid,
                required: true,
            }]
        })
        if (auctions) {
            res.send(auctions)
        } else {
            res.sendStatus(404)
        }
    })

    // delete auction where auction_id = ?
    router.delete('/delete/:id', async (req, res) => {
        const auction = await Auction.destroy(
            {
                where: {
                    id: req.params.id
                }
            })
            .then(function (rowsDeleted) {
                if (rowsDeleted == 0) {
                    res.status(404).json({
                        "error": "no todo found with that id"
                    });
                } else {
                    res.status(204).send();
                }
            }).catch(function (e) {
                res.status(500).json(e);
            });
    })

    // add new auction
    //create auction by id 

    // chưa check tại chưa biết sao tạo đc auction
    router.post('/', async (req, res) => {
        const newAuction = {
            product_id: req.body.product_id,
            price_cur: req.body.price_cur,
            views: req.body.views,
            date_closure: req.body.date_closure,
        }

        await Auction.create(newAuction)
            .then(data => res.send(data))
            .catch(err => {
                res.status(500).send({
                    message: err.message
                })
            })
    })

    // vao auction view + 1
    // Update update name , DOB , gender vaos bang user
    router.put('/update/:id', async (req, res) => {
        
        let auction = await Auction.findOne({ where: { product_id: req.params.id } })
        const info = await auction.increment('views', { by: 1 })

        if (auction) {
            res.send(info)
        } else {
            res.sendStatus(error)
        }
    })
    

    return router
}


module.exports = {
    createAuctionRouter,
}