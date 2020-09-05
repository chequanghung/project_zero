const express = require('express')
const bodyParser = require('body-parser')
const { Sequelize, Op, where } = require('sequelize');
// const timediff = require('timediff');

const createProductRouter = ({ Product, User, Auction, AuctionBid, Address, ProductMedia, Fruit, Affair }) => {
    const router = express.Router()

    // pending
    // get product , product_meida by id
    router.get('/:id', async (req, res) => {
        Product.hasMany(ProductMedia, { foreignKey: 'product_id' })
        ProductMedia.belongsTo(Product, { foreignKey: 'product_id' })

        Fruit.hasOne(Product, { foreignKey: 'fruit_id' })
        Product.belongsTo(Fruit, { foreignKey: 'fruit_id' })

        const product = await Product.findOne({
            where: { id: req.params.id, },
            include: [{
                model: ProductMedia,
                attributes: ['media_url'],
                required: true,
            },
            {
                model: Fruit,
                required: true
            }]
        }
        )
        if (product) {
            res.send(product)
        } else {
            res.sendStatus(404)
        }
    })

    // APPROVED
    // Create Product  cần check
    router.post('/', async (req, res) => {
        const product = {
            user_id: req.body.user_id,
            fruit_id: req.body.fruit_id,
            address_id: req.body.address_id,
            title: req.body.title,
            weight: req.body.weight,
            fruit_pct: req.body.fruit_pct,
            sugar_pct: req.body.sugar_pct,
            weight_avg: req.body.weight_avg,
            diameter_avg: req.body.diameter_avg,
            price_init: req.body.price_init,
            price_step: req.body.price_step,
            product_type: req.body.product_type,
            notes: req.body.notes,
            img_dir: req.body.img_dir
        }

        await Product.create(product)
            .then(data => res.send(data))
            .catch(err => {
                res.status(500).send({
                    message: err.message
                })
            })
    })

    // APPROVED
    // get GetIdProductAndIdUser after create product chưa hoàn thành
    // get user id and product id of the latest post posted by this user
    router.get('/user/latest/:id', async (req, res) => {
        // find by primary key = find by id
        // const product = await 
        Product.findOne(
            {
                where: {
                    user_id: req.params.id
                },
                order: [
                    ['id', 'DESC']
                ],
                attributes: ['id', 'user_id']
            }
        ).then(product => {
            if (!product) {
                res.sendStatus(404)
            } else {
                res.send(product)
            }
        }).catch(error => {
            res.sendStatus(500).json({
                error: error.message
            })
        })

        // if (product) {
        //     res.send(product)
        // } else {
        //     res.sendStatus(404)
        // }
    })

    // get all products
    router.get('/', async (req, res) => {
        // offset: number of records you skip
        const offset = Number.parseInt(req.query.offset) || 0
        // limit: number of records you get
        const limit = Number.parseInt(req.query.limit) || 10

        const products = await Product.findAll({ offset, limit })

        if (products) {
            res.send(products)
        } else {
            res.sendStatus(404)
        }
    })

    // PENDING
    // !! move to admin
    // !! add fruit phải có cả fruit id
    // get post and user by id


    // PENDING
    // Chưa lấy được datediff
    // sequelize is not defined
    // get top 10 post from db (kiêm luôn Get newest post)
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

        const products = await Product.findAll({
            attributes: ['title', 'id', 'price_cur', 'weight'],
            limit: 10,
            include: [{
                model: Auction,
                attributes: ['views', [Sequelize.fn('datediff', Sequelize.col('Auctions.date_closure'), Sequelize.literal('CURRENT_TIMESTAMP')), 'remain']],
                order: [['Auction.remain', 'ASC']],
                required: true,
            },
            {
                model: Address,
                attributes: ['province'],
                required: true
            },
            {
                model: ProductMedia,
                attributes: ['media_url'],
                required: true
            }]
        })
        if (products) {
            res.send(products)
        } else {
            res.sendStatus(404)
        }
    })

    // select all product by fruit_id
    router.get('/fruit/:id', async (req, res) => {

        Fruit.hasMany(Product, { foreignKey: 'fruit_id' })
        Product.belongsTo(Fruit, { foreignKey: 'fruit_id' })

        // offset: number of records you skip
        const offset = Number.parseInt(req.query.offset) || 0
        // limit: number of records you get
        const limit = Number.parseInt(req.query.limit) || 5

        const fruit = await Fruit.findAll({
            where: { id: req.params.id },
            include: [{
                model: Product,
                required: true,
            }]
        })

        if (fruit) {
            res.send(fruit)
        } else {
            res.sendStatus(404)
        }
    })


    // delete Product where product_id = ?
    router.delete('/:id', async (req, res) => {
        await Product.destroy(
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
                    res.status(204).json({
                        "message": "succeeded"
                    });
                }
            }).catch(function (error) {
                res.status(500).send(error);
            });
    })

    // select product với titleP , titleF , username,status_product  where product_id = ?
    router.get('/dashboard/:id', async (req, res) => {

        Fruit.hasMany(Product, { foreignKey: 'fruit_id' })
        Product.belongsTo(Fruit, { foreignKey: 'fruit_id' })

        User.hasMany(Product, { foreignKey: 'user_id' })
        Product.belongsTo(User, { foreignKey: 'user_id' })

        // offset: number of records you skip
        const offset = Number.parseInt(req.query.offset) || 0
        // limit: number of records you get
        const limit = Number.parseInt(req.query.limit) || 5

        const fruit = await Fruit.findAll({
            where: { id: req.params.id },
            attributes: ['title'],
            include: [{
                model: Product,
                attributes: ['title', 'product_status'],
                required: true,
                include: [
                    {
                        model: User,
                        attributes: ['name'],
                        required: true,
                    }]
            }]
        })

        if (fruit) {
            res.send(fruit)
        } else {
            res.sendStatus(404)
        }
    })

    //Lấy các product theo id user (:id) và status (:status)
    router.get('/user/:id/:status', async (req, res) => {

        User.hasMany(Product, { foreignKey: 'user_id' })
        Product.belongsTo(User, { foreignKey: 'user_id' })

        Product.hasMany(ProductMedia, { foreignKey: 'product_id' })
        ProductMedia.belongsTo(Product, { foreignKey: 'product_id' })

        Address.hasMany(Product, { foreignKey: 'address_id' })
        Product.belongsTo(Address, { foreignKey: 'address_id' })

        let status = req.params.status

        if (status <= 2 || status == 9) {
            const fruit = await Product.findAll({
                where: {
                    product_status: req.params.status,
                    user_id: req.params.id
                },
                include: [
                    {
                        model: ProductMedia,
                        attributes: ['media_url'],
                        limit: 1
                    },
                    {
                        model: Address,
                        attributes: ['province'],
                        required: true
                    }
                ],
                order: [['date_created', 'DESC']]
            })

            if (fruit) {
                res.send(fruit)
            } else {
                res.sendStatus(404)
            }
        } else if (status == 3) {
            Product.hasMany(Auction, { foreignKey: 'product_id' })
            Auction.belongsTo(Product, { foreignKey: 'product_id' })

            const fruit = await Product.findAll({
                where: {
                    product_status: req.params.status,
                    user_id: req.params.id
                },
                include: [
                    {
                        model: ProductMedia,
                        attributes: ['media_url'],
                        limit: 1
                    },
                    {
                        model: Address,
                        attributes: ['province'],
                        required: true
                    },
                    {
                        model: Auction,
                        attributes: [
                            'id',
                            'views',
                            [Sequelize.fn('datediff', Sequelize.col('date_closure'), Sequelize.literal('CURRENT_TIMESTAMP')), 'remain_days'],
                            [Sequelize.fn('timediff', Sequelize.col('date_closure'), Sequelize.literal('CURRENT_TIMESTAMP')), 'remain_time'],
                        ],
                        order: [['date_created', 'DESC']],
                        limit: 1,
                        required: true,
                    },
                ],
                order: [['date_created', 'DESC']]
                // required: true
            })

            if (fruit) {
                res.send(fruit)
            } else {
                res.sendStatus(404)
            }
        } else if (status >= 4 && status <= 5) {
            Product.hasMany(Affair, { foreignKey: 'product_id' })
            Affair.belongsTo(Product, { foreignKey: 'product_id' })

            const fruit = await Product.findAll({
                where: {
                    product_status: req.params.status,
                    user_id: req.params.id
                },
                include: [
                    {
                        model: ProductMedia,
                        attributes: ['media_url'],
                        limit: 1
                    },
                    {
                        model: Address,
                        attributes: ['province'],
                        required: true
                    },
                    {
                        model: Affair,
                        attributes: [
                            'id',
                            'date_created',
                            'date_updated',
                        ],
                        as: 'Affairs',
                        order: [['date_created', 'DESC']],
                        limit: 1
                    }
                ],
                order: [['date_created', 'DESC']]
                // required: true
            })

            if (fruit) {
                res.send(fruit)
            } else {
                res.sendStatus(404)
            }
        }
    })

    router.get('/user/bought/:id/:status', async (req, res) => {

        User.hasMany(Product, { foreignKey: 'user_id' })
        Product.belongsTo(User, { foreignKey: 'user_id' })

        Product.hasMany(ProductMedia, { foreignKey: 'product_id' })
        ProductMedia.belongsTo(Product, { foreignKey: 'product_id' })

        Address.hasMany(Product, { foreignKey: 'address_id' })
        Product.belongsTo(Address, { foreignKey: 'address_id' })

        let status = req.params.status

        if (status == 3) {
            Product.hasMany(Auction, { foreignKey: 'product_id' })
            Auction.belongsTo(Product, { foreignKey: 'product_id' })

            Auction.hasMany(AuctionBid, { foreignKey: 'auction_id' })
            AuctionBid.belongsTo(Auction, { foreignKey: 'auction_id' })

            await Auction.findAll({
                where: {
                    auction_status: 1,
                },
                attributes: {
                    include: [
                        [Sequelize.fn('timediff', Sequelize.col('Auction.date_closure'), Sequelize.literal('CURRENT_TIMESTAMP')), 'remain_time'],
                        [Sequelize.fn('datediff', Sequelize.col('Auction.date_closure'), Sequelize.literal('CURRENT_TIMESTAMP')), 'remain'],
                    ]
                },
                include: [
                    {
                        model: AuctionBid,
                        where: {
                            bidder_user_id: req.params.id
                        },
                        attributes: [],
                        required: true,
                    },
                    {
                        model: Product,
                        where: {
                            product_status: 3
                        },
                        required: true,
                        include: [
                            {
                                model: ProductMedia,
                                attributes: ['media_url'],
                                limit: 1,
                                required: true
                            },
                            {
                                model: Address,
                                attributes: ['province'],
                                required: true
                            },
                        ]
                    }
                ],
                order: [['date_created', 'DESC']],
            })
                .then(fruits => {
                    res.send(fruits)
                })
                .catch(error => {
                    res.status(500).send(error)
                })
        } else if (status == 4 || status == 5) {
            Product.hasMany(Affair, { foreignKey: 'product_id' })
            Affair.belongsTo(Product, { foreignKey: 'product_id' })

            await Affair.findAll({
                where: {
                    affair_status: status == 5 ? 2 : { [Op.or]: [0, 1] },
                    buyer_user_id: req.params.id
                },
                include: [
                    {
                        model: Product,
                        required: true,
                        where: {
                            [Op.or]: [
                                { product_status: 4 },
                                { product_status: 5 }
                            ]
                        },
                        include: [
                            {
                                model: ProductMedia,
                                attributes: ['media_url'],
                                limit: 1,
                                required: true
                            },
                            {
                                model: Address,
                                attributes: ['province'],
                                required: true
                            },
                        ]
                    }
                ],
                order: [['date_created', 'DESC']],
            })
                .then(fruits => {
                    res.send(fruits)
                })
            // .catch(error => {
            //     res.status(500).send(error)
            // })
        } else {
            res.status(500).send({
                message: 'Yêu cầu không hợp lệ.'
            })
        }
    })

    // // lấy ra product_status để xem bài viết đã kiểm duyệt chưa chưa thì cho insert new productMedia
    // router.get('/productStatus/:id', async (req, res) => {

    //     Product.hasMany(ProductMedia, { foreignKey: 'product_id' })
    //     ProductMedia.belongsTo(Product, { foreignKey: 'product_id' })

    //     const products = await ProductMedia.findAll({    
    //             attributes: ['product_id'],
    //             include: [{
    //                 model: Product,
    //                 required: true,
    //                 where: {id : req.params.id},
    //                 attributes: ['product_status'],
    //             }],    
    //             group: 'product_id'
    //     })
    //     if (products) {
    //         res.send(products)
    //     } else {
    //         res.sendStatus(404)
    //     }
    // })

    // thêm product_media theo product_id
    router.post('/productMedia', async (req, res) => {
        const productMedia = await ProductMedia.create({
            product_id: req.body.product_id,
            media_url: req.body.media_url,
        })

        if (productMedia) {
            res.send(productMedia)
        } else {
            res.sendStatus(404)
        }
    })

    // sửa product
    router.put('/changeProduct/:id', async (req, res) => {
        const products = await Product.update(
            {
                fruit_id: req.body.fruit_id,
                address_id: req.body.address_id,
                title: req.body.title,
                weight: req.body.weight,
                fruit_pct: req.body.fruit_pct,
                sugar_pct: req.body.sugar_pct,
                weight_avg: req.body.weight_avg,
                diameter_avg: req.body.diameter_avg,
                price_init: req.body.price_init,
                price_step: req.body.price_step,
                price_cur: req.body.price_cur,
                product_type: req.body.product_type,
                product_status: 0
            },
            {
                where: {
                    id: req.params.id
                }
            })
        if (products) {
            res.send(products)
        } else {
            res.sendStatus(404)
        }
    })

    // change status của product khi kiểm duyệt
    router.put('/changeStatus', async (req, res) => {
        await Product.update(
            {
                product_status: req.body.product_status
            },
            {
                where: {
                    id: req.body.id,
                }
            }
        ).then(response => {
            response[0] === 1 ?
                res.send({
                    message: 'Thành công'
                })
                :
                res.status(500).send({
                    message: 'Thất bại'
                })
        }).catch(error => {
            res.status(500).send({
                message: error.message
            })
        })
    })

    return router
}

module.exports = {
    createProductRouter
}
