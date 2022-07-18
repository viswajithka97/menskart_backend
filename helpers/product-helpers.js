var db = require('../confiq/connection')
var collection = require('../confiq/collection');
var bcrypt = require('bcrypt');
var objectId = require('mongodb').ObjectId

var promise = require('promise');
const async = require('hbs/lib/async');
const { resolve, reject } = require('promise');
const { response } = require('express');
const userHepers = require('./user-hepers');
module.exports = {
    addproduct: (product, callback) => {
        console.log(product);
        db.get().collection('product').insertOne(product).then(async (data) => {
            console.log(data);
            let products = await db.get().collection(collection.PRODUCT_COLLECTION)
                .find()
                .toArray()
            console.log(products);
            for (i = 0; i < products.length; i++) {
                let OP = parseInt(products[i].orginalPrice);
                let OfP = parseInt(products[i].offerpercentage);

                var offerPrice = OP - (OP * (OfP / 100)).toFixed(0);
                var ids = products[i]._id;
            }
            //  console.log(offerprice);

            db.get()
                .collection(collection.PRODUCT_COLLECTION)
                .findOneAndUpdate(
                    { _id: objectId(ids) },
                    { $set: { offerPrice: offerPrice } }
                );
            console.log(data.insertedId, "ahi asif welcome");
            callback(data.insertedId)
        })

    },
    getAllofferproducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ offerpercentage: { $gt: '50' } }).toArray()
            resolve(products)
        })
    },
    getAllproducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            console.log('jjjjjjjjjjjjjjjjjjjjjjjjjjjjjj');
            console.log(products);
            resolve(products)

        })
    },
    getAllcategory: () => {
        return new promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.PRODUCT_CATEGORY).find().toArray()
            resolve(category)
        })
    },


    deleteProduct: (proid) => {
        return new promise((resolve, reject) => {
            console.log(objectId(proid))
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(proid) }).then((response) => {
                console.log(response);
                resolve(response)
            })
        })
    },
    getAllproductsDetails: (proid) => {
        return new promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proid) }).then((product) => {
                resolve(product)
            })
        })
    },


    updateProduct: (proid, prodetails) => {
        console.log(prodetails);
        return new promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proid) }, {
                $set: {
                    brand: prodetails.brand,
                    description: prodetails.description,
                    category: prodetails.category,
                    orginalPrice: prodetails.orginalPrice,
                    offerPrice: prodetails.offerPrice,
                    offerpercentage: prodetails.offerpercentage

                }
            }).then(async (response) => {
                let products = await db.get().collection(collection.PRODUCT_COLLECTION)
                    .find()
                    .toArray()
                console.log(products);
                for (i = 0; i < products.length; i++) {
                    let OP = parseInt(products[i].orginalPrice);
                    let OfP = parseInt(products[i].offerpercentage);

                    var offerPrice = OP - (OP * (OfP / 100)).toFixed(0);
                    var ids = products[i]._id;
                }
                //  console.log(offerprice);

                db.get()
                    .collection(collection.PRODUCT_COLLECTION)
                    .findOneAndUpdate(
                        { _id: objectId(ids) },
                        { $set: { offerPrice: offerPrice } }
                    );
                resolve(response)
            })

        })

    },

    addcategory: (category) => {

        return new promise((resolve, reject) => {
            db.get().collection('category').insertOne(category).then((data) => {
                resolve(data.insertedId);
            })
        })
    },

    deleteCategory: (cateId) => {
        return new promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_CATEGORY).deleteOne({ _id: objectId(cateId) }).then((response) => {
                console.log(response);
                resolve(response)

            })
        })
    },
    getAllcategoryDetails: (cateId) => {
        return new promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_CATEGORY).findOne({ _id: objectId(cateId) }).then((category) => {
                resolve(category)
            })
        })
    },
    updateCategory: (catId, catDetails) => {
        console.log(catId);
        console.log(catDetails);
        return new promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_CATEGORY).updateOne({ _id: objectId(catId) }, {
                $set: {
                    brand: catDetails.brand,
                    category: catDetails.category
                }
            })
                .then((response) => {

                    resolve(response)

                })
        })
    },
    getAllUsers: () => {
        return new promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    blockUsers: (id) => {
        console.log(id);
        return new promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    userBlock: true
                }
            }).then((data) => {
                resolve(data)
            })
        })
    },
    unblockUser: (id) => {
        return new promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    userBlock: false

                }
            }).then((data) => {
                resolve(data)
            })
        })

    },
    deleteUsers: (id) => {
        return new promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: objectId(id) }).then((response) => {
                resolve(response)
            })
        })
    },
    getAllorders: () => {
        return new promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().
                sort({ Date: -1 })
                .toArray();
            resolve(orders)
            console.log(orders);

        })
    },
    upadateStatus: (orderId, orderStatus) => {
        return new promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    status: orderStatus,

                }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    canceledUpdate: (oderId) => {
        return new promise((resolve, reject) => {
            console.log("vchgchgchgch");
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(oderId) }, {
                $set: {
                    canceled: true
                }
            }).then((response) => {
                console.log(response);
                resolve(response)
            })
        })
    },
    countsalemonth: () => {
        console.log("ammen");
        return new promise(async (resolve, reject) => {
            let dailySale = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        "status": "Delived"
                    }
                },

                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: '$Date' } },
                        totalAmount: { $sum: "$totalAmount" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: -1 }
                },

            ]).toArray()
            console.log(dailySale);
            resolve(dailySale)
        })

    },
    countDaySales: () => {
        return new promise(async (resolve, reject) => {
            let dailySale = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        "status": "Delived"
                    }
                },

                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: '$Date' } },
                        totalAmount: { $sum: "$totalAmount" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: -1 }
                },
                {
                    $limit: 7
                }
            ]).toArray()
            console.log(dailySale);
            resolve(dailySale)
        })
    },
    addBanner: (banner) => {
        return new promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).insertOne(banner).then((data) => {
                console.log(data.insertedId);
                resolve(data.insertedId)
            })
        })
    },
    getAllBanner: () => {
        return new promise(async (resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(banner)
        })
    },
    getEditBanner: (id) => {
        return new promise(async (resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTION).findOne({ _id: objectId(id) })
            console.log(banner);
            resolve(banner)
        })
    },
    updateBanner: (details, id) => {
        return new promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    title: details.title,
                    description: details.description

                }
            }).then((response) => {
                console.log(response);
                resolve(response)
            })
        })
    },
    deletebanner: (id) => {
        console.log(id);
        return new promise(async (resolve, reject) => {
            await db.get().collection(collection.BANNER_COLLECTION).deleteOne({ _id: objectId(id) }).then((response) => {
                resolve(response)
            })
        })
    },
    getYearlySale: () => {

        let curDate = new Date
        let currentYear = curDate.getFullYear();
        currentYear = currentYear + ""

        return new Promise(async (resolve, reject) => {

            let yearlySale = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        status: "Delived"
                    }
                },
                {
                    $project: {
                        Date: { $dateToString: { format: "%Y", date: "$Date" } }, totalAmount: 1
                    }
                },

                {
                    $group: {
                        _id: "$Date",
                        total: { $sum: "$totalAmount" },

                    }
                }


            ]).toArray()
            console.log("year", yearlySale)

            resolve(yearlySale)
        })
    },
    TotalOders: () => {
        return new promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                { $group: { _id: null, count: { $sum: 1 } } },
                { $project: { _id: 0 } }
            ]).toArray()
            console.log(total);
            resolve(total)

        })
    },
    Totalsales: () => {
        return new promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        status: "Delived"
                    }
                },
                { $group: { _id: null, count: { $sum: 1 } } },
                { $project: { _id: 0 } }
            ]).toArray()
            console.log(total);
            resolve(total)

        })

    },
    Totalprofit: () => {
        return new promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        payment: "success"
                    }
                },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
                { $project: { _id: 0 } }
            ]).toArray()
            console.log(total);
            resolve(total)

        })


    },
    Totalusers: () => {
        return new promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.USER_COLLECTION).aggregate([
                { $group: { _id: null, count: { $sum: 1 } } },
                { $project: { _id: 0 } }
            ]).toArray()
            console.log(total);
            resolve(total)

        })

    },
    addcoupon: (coupon) => {
        return new promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon).then((response) => {
                console.log(response.insertedId);
                resolve(response.insertedId)
            })
        })

    },
    findcoupon: () => {
        return new promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupon)
        })
    },
    gettrend: () => {
        return new promise(async (resolve, reject) => {
            let products = await db
                .get()
                .collection(collection.PRODUCT_COLLECTION)
                .find()
                .sort({ _id: -1 })
                .limit(10)
                .toArray();
            console.log("hi", products);
            resolve(products);
        });
    },




}