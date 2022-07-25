var db = require("../confiq/connection");
var collection = require("../confiq/collection");
var bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;
var promise = require("promise");
const async = require("hbs/lib/async");
const { resolve, reject } = require("promise");
const { response } = require("express");
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: "rzp_test_IYqnwXk3p7eSL2",
  key_secret: "YGQg37fRzHRIJJKMycxb2Blh",
});
module.exports = {
  doSignup: (userData) => {
    console.log(userData.phoneNumber);
    return new promise(async (resolve, request) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve(data);
        });
    });
  },
  doLogin: (userData) => {
    console.log(userData);
    return new promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });
      if (user) {
        if (!user.userBlock) {
          bcrypt.compare(userData.password, user.password).then((status) => {
            if (status) {
              console.log("login success");
              response.user = user;
              response.status = true;
              resolve(response);
            } else {
              console.log("login failed");
              resolve({ status: false });
            }
          });
        } else {
          resolve(user);
        }
      } else {
        resolve({ status: false });
        console.log("failed");
      }
    });
  },
  imageDetails: (id) => {
    console.log(id);
    return new promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(id) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  checkPhone: (phone) => {
    console.log(phone);
    return new promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ phoneNumber: phone })
        .then((resp) => {
          console.log("hi" + resp);
          resolve(resp);
        });
    });
  },
  doLoginOtp: (phone) => {
    return new promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ phoneNumber: phone });
      console.log(user.email);
      resolve(user);
    });
  },
  emailCheck: (email, phone) => {
    return new promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ $or: [{ email: email }, { phoneNumber: phone }] });
      console.log(user);
      resolve(user);
    });
  },
  categoryView: (categoryview) => {
    return new promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ category: categoryview })
        .toArray();
      resolve(product);
    });
  },
  addToCart: (proId, userId) => {
    console.log(proId);
    console.log(userId);
    let proObj = {
      item: objectId(proId),
      quantity: 1,
    };
    return new promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      console.log(userCart);
      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item == proId
        );
        console.log("houiihg");
        console.log(proExist);
        if (proExist != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(proId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve(response);
          });
      }
    });
  },
  getCartProducts: (userId) => {
    console.log(userId);
    return new promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      console.log("itemsCart");
      console.log(cartItems);
      resolve(cartItems);
    });
  },
  getCarCount: (userId) => {
    let count = 0;
    return new promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
        console.log("ghtg", count);
      }
      resolve(count);
    });
  },
  getwishilistCount: (userId) => {
    let Wcount = 0;
    return new promise(async (resolve, reject) => {
      let wishilist = await db
        .get()
        .collection(collection.WISHILIST_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (wishilist) {
        Wcount = wishilist.products.length;
        console.log("gff", Wcount);
      }
      resolve(Wcount);
    });
  },
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: objectId(details.cart) },
            {
              $pull: { products: { item: objectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: objectId(details.cart),
              "products.item": objectId(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then(() => {
            resolve({ status: true });
          });
      }
    });
  },
  removeCartProduct: (details) => {
    return new promise((resolve, reject) => {
      console.log("detaid");
      console.log(details);
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: objectId(details.cart) },
          {
            $pull: { products: { item: objectId(details.product) } },
          }
        )
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  getTotalAmount: (userId) => {
    return new promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: ["$quantity", { $toInt: "$product.offerPrice" }],
                },
              },
            },
          },
        ])
        .toArray();

      resolve(total[0]?.total);
    });
  },
  placeOrder: (order, products, total, name, method) => {
    console.log("lp", method);
    return new promise((resolve, reject) => {
      let status = order["payment-method"] == "COD" ? "pending" : "pending";
      console.log(status);
      console.log(order);
      console.log(products);
      console.log(total);
      console.log(name);
      var currentdate = new Date();
      var datetime =
        "Date: " +
        currentdate.getDay() +
        "-" +
        currentdate.getMonth() +
        "-" +
        currentdate.getFullYear() +
        " Time:" +
        currentdate.getHours() +
        ":" +
        currentdate.getMinutes() +
        ":" +
        currentdate.getSeconds();
      let orderObj = {
        deliveryDetails: {
          mobile: order.phoneNumber,
          address: order.address,
          pincode: order.pincode,
          state: order.state,
          city: order.city,
          houseNO: order.house,
        },
        userId: objectId(method.userId),
        user: name,
        paymentMethode: method["payment-method"],
        products: products,
        totalAmount: total,
        status: status,
        payment: "pending",
        Date: new Date(),
        date: datetime,
      };
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(method.userId) }).then((response) => {


          })
          resolve(response.insertedId);
        });
    });
  },
  getCartProductList: (userId) => {
    return new promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      resolve(cart?.products);
    });
  },
  getUserOrders: (userId) => {
    return new promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: objectId(userId) })
        .sort({ Date: -1 })
        .toArray();

      resolve(orders);
    });
  },
  getOrderProducts: (orderId) => {
    console.log(orderId);
    return new promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      console.log("hsailkkkkkk");
      console.log(cartItems);

      resolve(cartItems);
    });
  },
  addWishilist: (userId, product) => {
    console.log(product);
    console.log(userId);
    let proObj = {
      item: objectId(product),
    };
    console.log(proObj);
    return new promise(async (resolve, reject) => {
      let wishilistItem = await db
        .get()
        .collection(collection.WISHILIST_COLLECTION)
        .findOne({ user: objectId(userId) });

      console.log(wishilistItem);
      if (wishilistItem) {
        let proExist = wishilistItem.products.findIndex(
          (products) => products.item == product
        );
        console.log(proExist);
        if (proExist != -1) {
          db.get()
            .collection(collection.WISHILIST_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $pull: { products: { item: objectId(product) } },
              }
            )
            .then(() => {
              resolve();
            });
          console.log("remve");
        } else {
          console.log(userId);
          db.get()
            .collection(collection.WISHILIST_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.WISHILIST_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve(response);
          });
      }
    });
  },
  getwishilistProducts: (userId) => {
    console.log(userId);
    return new promise(async (resolve, reject) => {
      let items = await db
        .get()
        .collection(collection.WISHILIST_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();

      console.log(items);
      resolve(items);
    });
  },
  relatedDetails: (categoryId) => {
    return new promise(async (resolve, reject) => {
      let category = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ category: categoryId })
        .toArray();
      resolve(category);
    });
  },
  updateOrder: (orderId) => {
    return new promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              status: "canceled",
              canceled: true,
            },
          }
        )
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  placedUpdate: (oderId) => {
    return new promise((resolve, reject) => {
      console.log("vchgchgchgch");
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(oderId) },
          {
            $set: {
              Delived: true,
              payment: "success",
            },
          }
        )
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  placedUpdatecon: (oderId) => {
    return new promise((resolve, reject) => {
      console.log("vchgchgchgch");
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(oderId) },
          {
            $set: {
              shipped: false,
              order: true,
              Arriving: false,
            },
          }
        )
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  placedUpdateship: (oderId) => {
    return new promise((resolve, reject) => {
      console.log("vchgchgchgch");
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(oderId) },
          {
            $set: {
              shipped: true,
              order: false,
              Arriving: false,
            },
          }
        )
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  placedUpdatesArriv: (oderId) => {
    return new promise((resolve, reject) => {
      console.log("vchgchgchgch");
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(oderId) },
          {
            $set: {
              Arriving: true,
              shipped: false,
              order: false,
            },
          }
        )
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  generateRazorpay: (oderId, total) => {
    console.log(oderId);
    console.log("hi");
    return new promise((resolve, reject) => {
      var options = {
        amount: total * 100,
        currency: "INR",
        receipt: "" + oderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        }
        console.log("new :", order);
        resolve(order);
      });
    });
  },
  verifyPayment: (details) => {
    return new promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "YGQg37fRzHRIJJKMycxb2Blh");
      hmac.update(
        details["payment[razorpay_order_id]"] +
        "|" +
        details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      console.log("dgff" + hmac);
      console.log(details);
      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },
  changePymentStatus: (orderId) => {
    console.log(orderId);
    return new promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              payment: "success",
            },
          }
        )
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  addAddress: (userData) => {
    let address = {
      Useraddress: new objectId(),
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      state: userData.state,
      pincode: userData.pincode,
      house: userData.house,
      city: userData.city,
      home: userData.location,
      address: userData.address,
    };
    return new promise(async (resolve, reject) => {
      console.log(userData.userId);

      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userData.userId) },
          {
            $push: { Address: address },
          }
        )
        .then((response) => {
          console.log(
            "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
          );
          console.log(response.insertedId);
          resolve(response);
        });
    });
  },
  getAddress: (userId) => {
    return new promise(async (resolve, reject) => {
      let address = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(userId) },
          },
          {
            $unwind: "$Address",
          },
        ])
        .toArray();
      console.log("lllllllllllllllllllllllllllllllll");
      console.log(address);
      resolve(address);
    });
  },
  EditAddress: (userId, addId) => {
    return new promise(async (resolve, reject) => {
      let address = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(userId) },
          },
          {
            $unwind: "$Address",
          },
          {
            $match: { "Address.Useraddress": objectId(addId) },
          },
        ])
        .toArray();
      console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz");
      console.log(address);
      resolve(address);
    });
  },
  updateAddress: (userId, addressId, data) => {
    console.log(userId);
    console.log(addressId);
    console.log(data);
    return new promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          {
            _id: objectId(userId),
            "Address.Useraddress": objectId(addressId),
          },
          {
            $set: {
              "Address.$.name": data.name,
              "Address.$.phoneNumber": data.phoneNumber,
              "Address.$.state": data.state,
              "Address.$.pincode": data.pincode,
              "Address.$.house": data.house,
              "Address.$.city": data.city,
              "Address.$.home": data.location,
              "Address.$.address": data.address,
            },
          }
        )
        .then((resp) => {
          console.log(resp);
          resolve(resp);
        });
    });
  },
  deleteAddress: (userID, addId) => {
    return new promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userID) },
          {
            $pull: { Address: { Useraddress: objectId(addId) } },
          }
        )

        .then((resp) => {
          console.log(resp);
          resolve(resp);
        });
    });
  },
  updateUser: (userId, user) => {
    return new promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userId) },
          {
            $set: {
              name: user.name,
              email: user.email,
              phoneNumber: user.phoneNumber,
            },
          }
        )
        .then((response) => {
          console.log("................................................");
          console.log(response);
          resolve(response);
        });
    });
  },
  findUser: (userId) => {
    return new promise(async (resolve, reject) => {
      let address = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(userId) },
          },
          {
            $unwind: "$Address",
          },
        ])
        .toArray();
      console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz");
      console.log(address);
      resolve(address);
    });
  },
  updateprofile: (id) => {
    return new promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(id) },
          {
            $set: {
              profile: true,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  updatepic: (id) => {
    return new promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(id) },
          {
            $set: {
              profile: false,
            },
          }
        )
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  updatephone: (phone, id) => {
    return new promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(id) },
          {
            $set: {
              phoneNumber: phone,
            },
          }
        )
        .then((response) => {
          console.log("add", response);
          resolve(response);
        });
    });
  },
  checkcoupon: (couponId) => {
    console.log("mnnnn");
    return new promise(async (resolve, reject) => {
      let coupon = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({ coupon: couponId });
      resolve(coupon);
    });
  },
  checkuser: (userid, couponId) => {
    console.log(couponId);
    return new promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .findOne({
          coupon: couponId,
          user: {
            $elemMatch: {
              userId: objectId(userid),
            },
          },
        });
      console.log(user);
      resolve(user);
    });
  },
  updatcoupon: (userID, code) => {
    let obj = {
      userId: objectId(userID),
    };
    return new promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .updateOne(
          { coupon: code },
          {
            $push: { user: obj },
          }
        )
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  updatedatef: (date) => {
    console.log(date);
    return new promise((resolve, reject) => {
      db.get()
        .collection(collection.COUPON_COLLECTION)
        .deleteOne({ expiryDate: date })
        .then((response) => {
          resolve(response);
        });
    });
  },
  updatecart: (userId) => {
    console.log("ammen", userId);
    return new promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.CART_COLLECTION)
        .deleteOne({ user: objectId(userId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  checkPassword: (userid, details) => {

    return new promise(async (resolve, reject) => {



      let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userid) })
      if (user) {
        console.log(user);
        console.log(details.oldpassword);
        bcrypt.compare(details.oldpassword, user.password).then(async (status) => {
          console.log("lk");
          console.log(status);

          if (status) {
            let passbcrypt = await bcrypt.hash(details.newpass1, 10)
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userid) },
              {
                $set: {
                  password: passbcrypt
                }
              }).then((response) => {
                console.log(response);
                resolve(response)
              })

          } resolve(status)
        })
      }
    })

  }

};
