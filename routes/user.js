const { response } = require("express");
var express = require("express");
const async = require("hbs/lib/async");
const { Db } = require("mongodb");
const { payment } = require("paypal-node-sdk");
var router = express.Router();
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-hepers");

const serviceSsid = "VA98b9df7b42468c8f8da13751cdc6a0a0";
const AccountSsid = "AC2728becad37498ecfe6a709051743861";
const token = "8105f59fb2fb7ebb5701c2d987a6b56f";
const client = require("twilio")(AccountSsid, token);
var paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AUKYIgWGpZjaKGGT_tmQSPD3Jv8H_vvzPuXrKyRJbjT600ZolfUeznoLO0yfsNoQXZkSiSIphEzJ8hB-",
  client_secret:
    "EGfQMX-V6lOvdavJPhPRfMOgNaX0uLv4t7SBX5WjifiRCFYA1dkHrE4qUDs0DrQleLw0L8-NknNikDep",
});

/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  console.log(user);
  req.session.discount = 0;
  cartCount = null;
  wishilistCount = null;
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  today = yyyy + "-" + mm + "-" + dd;
  console.log("aaa", today);

  userHelpers.updatedatef(today).then((response) => { });
  if (req.session.user) {
    var cartCount = await userHelpers.getCarCount(req.session.user._id);
    var wishilistCount = await userHelpers.getwishilistCount(
      req.session.user._id
    );
  }
  let trendingProducts = await productHelpers.gettrend();
  productHelpers.getAllBanner().then((banner) => {
    productHelpers.getAllofferproducts().then((products) => {
      productHelpers.getAllcategory().then((category) => {

        console.log("fgdffffffffffffffffffffdd");
        console.log(banner);

        res.send({
          products,
          banner,
          user,
          category,
          trendingProducts,
          cartCount,
          userId: req.session.user?._id,
          wishilistCount,

        });
      });
    });
  });
});
router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.send({ loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});
router.get("/signup", (req, res) => {
  res.render("user/signup");
});

router.post("/signup", (req, res) => {
  let email = req.body.email;
  let phone = req.body.phoneNumber;
  console.log(email);
  console.log(phone);
  userHelpers.emailCheck(email, phone).then((resolve) => {
    if (resolve) {
      if (resolve.phoneNumber == phone) {
        res.send({ phone: true, phoneAll: "phone invaid" });
        phoneAll = false;
      } else {
        res.send({ email: true });
        email = false;
      }
    } else {
      userHelpers.doSignup(req.body).then((response) => {
        console.log(response);
        req.send({ response })
        // res.redirect("/login");
      });
    }
  });
});

router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    console.log(response.userBlock);
    if (response.userBlock) {
      res.send({ userBlock: true });
    } else {
      if (response.status) {
        req.session.loggedIn = true;
        req.session.user = response.user;
        console.log(req.session.user._id);
        // res.redirect("/");
        res.send({ response })
      } else {
        req.session.loginErr = true;
        res.redirect("/login");
        res.send({ "error": true })
      }
    }
  });
});
router.get("/logout", (req, res) => {
  req.session.destroy();
  // res.redirect("/");
  res.send({ logOut: true })
});

//cart routes
router.get("/cart/:id", async (req, res) => {

  const userId = req.params.id;
  console.log(
    "userId", userId
  );
  let products = await userHelpers.getCartProducts(userId);
  let totalValue = await userHelpers.getTotalAmount(userId);
  req.session.total = totalValue - req.session.discount;
  // console.log("ammen", req.session.total, totalValue, req.session.discount);

  let total = req.session.total;
  cartCount = null;
  if (userId) {
    var cartCount = await userHelpers.getCarCount(userId);
    var wishilistCount = await userHelpers.getwishilistCount(
      userId
    );
  }
  if (cartCount == 0) {
    res.send({
      products,
      cartCount,
      total,
      wishilistCount,
    });
  } else {
    res.send({
      products,
      cartCount,
      total,
      wishilistCount,
    });
  }
});
router.post("/add-to-cart/", (req, res) => {
  let userId = req.body.userId;
  let productId = req.body.productId;
  console.log("id           ", userId, productId);

  userHelpers.addToCart(productId, userId).then(() => {
    res.send({ status: true });
  });
});

router.get("/view-image/:id", async (req, res) => {
  var imgId = req.params.id;
  let product = await userHelpers.imageDetails(imgId);

  let relProduct = product.category;
  let relatedProduct = await userHelpers.relatedDetails(relProduct);

  res.send({
    product,
    wishilistCount,
    cartCount,
    // user: req.session.user,
    relatedProduct,
    // userId: req.session.user?._id,
  });
});

//otp verfication

router.get("/verify-phone", (req, res) => {
  res.render("user/verify-phone");
});
router.post("/verify-phone", (req, res) => {
  let phone = req.body.phoneVerify;
  userHelpers.checkPhone(phone).then((number) => {
    // console.log(number);
    // console.log(number.userBlock)

    if (number) {
      if (number.userBlock) {
        res.send({ userBlock: true });
      } else {
        if (number) {
          let phone = number.phoneNumber;
          console.log(phone);
          client.verify
            .services(serviceSsid)
            .verifications.create({ to: `+91${phone}`, channel: "sms" })
            .then((resp) => {
              console.log(resp);
            });
          console.log("nmbmnvnb");
          res.send({ phone });
        } else {
          res.send({ number: true });
          number = false;
        }
      }
    } else {
      res.send({ number: true });
      number = false;
    }
  });
});

router.post("/verify-otp/:phone", (req, res) => {
  let phone = req.params.phone;
  let otp = req.body.phoneVerify;
  console.log(phone);

  client.verify
    .services(serviceSsid)
    .verificationChecks.create({
      to: `+91${phone}`,
      code: otp,
    })
    .then((resp) => {
      console.log("otp res", resp);
      const user = resp.valid;

      if (user) {
        userHelpers.doLoginOtp(phone).then((response) => {
          if (response) {
            console.log(response.name);
            req.session.loggedIn = true;
            req.session.user = response;
            res.redirect("/");
          } else {
            req.session.loginErr = true;
            res.redirect("/login");
          }
        });
        console.log("success");
        req.session.loggedIn = true;
        req.session.user = response.user;
      } else {
        console.log("failed");

        res.send({ phone, number: true });
        number = false;
      }
    });
});

router.get("/resent-otp/:phone", (req, res) => {
  let phone = req.params.phone;
  console.log("my" + phone);
  client.verify
    .services(serviceSsid)
    .verifications.create({ to: `+91${phone}`, channel: "sms" })
    .then((resp) => {
      console.log(resp);
    });
  res.send({ phone });
});

//category view
router.get("/category-view/:id", async (req, res) => {
  // if (req.session.user) {
  //   var cartCount = await userHelpers.getCarCount(req.session.user._id);
  //   var wishilistCount = await userHelpers.getwishilistCount(
  //     req.session.user._id
  //   );
  // }
  let category = req.params.id;
  userHelpers.categoryView(category).then((products) => {
    console.log(products);
    res.send({
      products,
      // wishilistCount,
      // cartCount,
      // user: req.session.user,
      // userId: req.session.user._id,
    });
  });
});

// quantity
router.post("/change-product-quantity", async (req, res, next) => {
  console.log(req.body);
  console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP");
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    let price = await userHelpers.getTotalAmount(req.body.user);
    req.session.total = price - req.session.discount;
    response.total = req.session.total;
    res.send({ response });
  });
});
router.post("/remove-product-cart", (req, res) => {
  // const prodId = req.body;
  userHelpers.removeCartProduct(req.body).then((response) => {
    res.send({ response });
  });
});

//product orders

router.get("/place-order/:id", async (req, res) => {
  const userId = req.params.id;
  let total = await userHelpers.getTotalAmount(userId);
  req.session.total = total - req.session.discount;
  let price = req.session.total;
  let discount = req.session.discount;
  // if (userId) {
  //   var cartCount = await userHelpers.getCarCount(userId);
  //   var wishilistCount = await userHelpers.getwishilistCount(
  //     req.session.user._id
  //   );
  // }
  let user = userId;
  let address = await userHelpers.getAddress(userId);
  console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
  console.log(address);
  let selectAddress = address[0];
  if (!selectAddress) {
    res.send({
      price: req.session.total,
      // cartCount,
      // wishilistCount,
      // userId,
      user,
      discount,
    });
  } else {
    res.send({
      price: req.session.total,
      user: userId,
      // cartCount,
      // wishilistCount,
      address,
      discount,
    });
  }
});
router.post("/place-order/:id", async (req, res) => {
  const userId = req.params.id;

  console.log(req.body, "hggggggggggggggggggggggggggggggggggggggggggg");
  let products = await userHelpers.getCartProductList(userId);
  let totalPrice = await userHelpers.getTotalAmount(userId);
  let total = totalPrice - req.session.discount;
  let userName = req.session.user.name;
  let address = await userHelpers.EditAddress(
    userId,
    req.body.checkoutAddress
  );
  let deliveryAddress = address[0].Address;

  userHelpers
    .placeOrder(deliveryAddress, products, total, userName, req.body)
    .then((oderId) => {
      if (req.body["payment-method"] == "COD") {
        res.send({ codSuccess: true });
      } else if (req.body["payment-method"] == "ONLINE") {
        console.log("razorpay");
        console.log(oderId);
        userHelpers
          .generateRazorpay(oderId, req.session.total)
          .then((response) => {
            console.log("djjd" + response);
            res.send({ response });
          });
      } else {
        console.log("entered to paypal");
        val = total / 74;
        totalPrice = val.toFixed(2);
        let totals = totalPrice.toString();
        req.session.total = totals;
        var create_payment_json = {
          intent: "sale",
          payer: {
            payment_method: "paypal",
          },
          redirect_urls: {
            return_url: "http://localhost:3000/order-success",
            cancel_url: "http://localhost:3000/cancel",
          },
          transactions: [
            {
              item_list: {
                items: [
                  {
                    name: "item",
                    sku: "001",
                    price: totals,
                    currency: "USD",
                    quantity: 1,
                  },
                ],
              },
              amount: {
                currency: "USD",
                total: totals,
              },
              description: "This is the payment description.",
            },
          ],
        };
        paypal.payment.create(create_payment_json, function (error, payment) {
          if (error) {
            throw error;
          } else {
            console.log("Create Payment Response");
            console.log(payment);
            for (var i = 0; i < payment.links.length; i++) {
              console.log("1111");
              if (payment.links[i].rel === "approval_url") {
                console.log("2222");
                let link = payment.links[i].href;
                link = link.toString();

                res.send({ paypal: true, url: link });
              }
            }
          }
        });
      }
    });

  router.get("/order-success/:id", async (req, res) => {
    const userId = req.params.id;
    req.session.discount = 0;
    if (userId) {
      var cartCount = await userHelpers.getCarCount(userId);
      var wishilistCount = await userHelpers.getwishilistCount(
        userId
      );
    }
    var wishilistCount = await userHelpers.getwishilistCount(
      userId
    );
    res.send({
      user: userId,
      cartCount,
      wishilistCount,
    });
  });
  console.log(req.body);
});

router.get("/orders/:id", async (req, res) => {
  const userId = req.params.id;
  if (userId) {
    var cartCount = await userHelpers.getCarCount(userId);
    var wishilistCount = await userHelpers.getwishilistCount(
      userId
    );
  }
  console.log(req.session.user?._id);
  let orders = await userHelpers.getUserOrders(userId);

  res.send({
    user: userId,
    orders,
    cartCount,
    wishilistCount,
  });
});
router.get("/view-order-products/:id", async (req, res) => {
  const userId = req.params.id;
  console.log("Arshu", req.params.id);
  if (userId) {
    var cartCount = await userHelpers.getCarCount(userId);
    var wishilistCount = await userHelpers.getwishilistCount(
      ruserId
    );
  }
  let products = await userHelpers.getOrderProducts(userId);
  console.log(products);
  res.send({
    user: userId,
    products,
    wishilistCount,
    cartCount,
  });
});

// add wishilist

router.post("/add-wishilist/", (req, res) => {
  console.log(req.body);
  let user = req.body.userId;
  let poroduct = req.body.proId;
  console.log("uhgfh");
  console.log(user);
  userHelpers.addWishilist(user, poroduct).then((response) => {
    console.log(response);
    res.send({ status: true });
  });
});

router.get("/wishilist-view/:id", async (req, res) => {
  const userId = req.params.id;
  if (userId) {
    var cartCount = await userHelpers.getCarCount(userId);
    var wishilistCount = await userHelpers.getwishilistCount(
      userId
    );
  }

  console.log(req.session.user?._id);
  let wishilistItems = await userHelpers.getwishilistProducts(
    userId
  );
  console.log(wishilistItems);
  if (wishilistCount == 0) {
    res.send({
      wishilistItems,
      userId: userId,
      // user: req.session.user,
      cartCount,
      wishilistCount,
    });
  } else {
    res.send({
      wishilistItems,
      userId: userId,
      // user: req.session.user,
      cartCount,
      wishilistCount,
    });
  }
});
router.post("/cancel-orders", (req, res) => {
  console.log("gjhghgfhj");
  let oderId = req.body.orderId;
  console.log(oderId);
  userHelpers.updateOrder(oderId).then((response) => {
    res.send({ status: true });
  });
});

router.post("/verify-payment", (req, res) => {
  let body = req.body;

  userHelpers
    .verifyPayment(req.body)
    .then(() => {
      console.log(body);
      userHelpers.changePymentStatus(req.body["order[receipt]"]).then(() => {
        console.log("suceess");
        res.send({ status: true });
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ status: "Payment failed" });
    });
});
router.get("/user-profile/:id", async (req, res) => {
  const userId = req.params.id;
  if (userId) {
    var cartCount = await userHelpers.getCarCount(req.session.user._id);
    var wishilistCount = await userHelpers.getwishilistCount(
      req.session.user._id
    );
  }
  // let userId = req.session.user._id;
  let address = await userHelpers.getAddress(userId);
  console.log("hjvhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
  console.log(req.session.user);
  let profile = address[0]?.profile;

  res.send({
    user: req.session.user,
    address,
    cartCount,
    wishilistCount,
  });
});
router.get("/add-address/:id", async (req, res) => {
  if (userId) {
    var cartCount = await userHelpers.getCarCount(userId);
    var wishilistCount = await userHelpers.getwishilistCount(
      userId
    );
  }
  // let userId = req.session.user._id;
  let user = req.session.user;
  res.send({
    userId: userId,
    wishilistCount,
    cartCount,
    user,
  });
});
router.post("/add-address", (req, res) => {
  console.log(req.body);
  userHelpers.addAddress(req.body).then((response) => {
    console.log(response);
  });
  res.redirect("/user-profile");
});
router.get("/edit-address/:id", async (req, res) => {
  let addressId = req.params.id;
  console.log(addressId);
  let userId = req.body.userId;
  let address = await userHelpers.EditAddress(userId, addressId);
  console.log("jjjjjjjjjjjjjjjjjjjjjjjjjj");
  res.send({ address });
});
router.post("/edit-address/:id", (req, res) => {
  let addressId = req.params.id;
  let userId = req.body.userId;
  let data = req.body;
  console.log(addressId);
  console.log(req.body);
  console.log(userId);
  userHelpers.updateAddress(userId, addressId, data).then((resp) => {
    res.redirect("/user-profile");
  });
});
router.get("/delete-address/:id", (req, res) => {
  let addressId = req.params.id;
  let userID = req.body.userId;
  userHelpers.deleteAddress(userID, addressId).then((resp) => {
    console.log(resp);
    res.redirect("/user-profile");
  });
});
router.post("/edit-profile/:id", (req, res) => {
  let userId = req.params.id;
  let user = req.body;
  console.log(userId);
  console.log(user);

  req.session.user.name = user.name;
  req.session.user.email = user.email;
  req.session.user.phoneNumber = user.phoneNumber;
  userHelpers.updateUser(userId, user).then((resp) => {
    res.redirect("/");
  });
});
router.get("/add-new-address/:id", async (req, res) => {
  let userId = req.params.id;
  let total = await userHelpers.getTotalAmount(userId);
  let discount = req.session.discount;
  req.session.total = total - req.session.discount;
  let price = req.session.total;
  if (req.session.user) {
    var cartCount = await userHelpers.getCarCount(userId);
    var wishilistCount = await userHelpers.getwishilistCount(
      req.session.user._id
    );
  }
  // let userId = req.session.user._id;
  let user = req.session.user;
  res.send({
    price,
    cartCount,
    wishilistCount,
    userId,
    user,
    discount,
  });
});
router.post("/add-new-address", async (req, res) => {
  userHelpers.addAddress(req.body).then((response) => { });
  console.log(req.body);
  let products = await userHelpers.getCartProductList(req.body.userId);

  totalPrice = req.session.total;
  let userName = req.session.user.name;
  let address = await userHelpers.findUser(req.body.userId);
  let deliveryAddress = req.body;

  userHelpers
    .placeOrder(deliveryAddress, products, totalPrice, userName, req.body)
    .then((oderId) => {
      if (req.body["payment-method"] == "COD") {
        console.log("cod");
        res.send({ codSuccess: true });
      } else if (req.body["payment-method"] == "ONLINE") {
        console.log("razorpay");
        console.log(oderId);
        console.log(totalPrice);
        userHelpers.generateRazorpay(oderId, totalPrice).then((response) => {
          console.log("djjd" + response);
          res.send({ response });
        });
      } else {
        console.log("paypal");
        console.log(req.session.total);
        const create_payment_json = {
          intent: "sale",
          payer: {
            payment_method: "paypal",
          },
          redirect_urls: {
            return_url: "http://localhost:3000/order-success",
            cancel_url: "http://localhost:3000/order-fialed",
          },
          transactions: [
            {
              item_list: {
                items: [
                  {
                    name: "MENS CART",
                    sku: "item",
                    price: req.session.total,
                    currency: "USD",
                    quantity: 1,
                  },
                ],
              },
              amount: {
                currency: "USD",
                total: req.session.total,
              },
              description: "This is the payment description.",
            },
          ],
        };
        paypal.payment.create(create_payment_json, function (error, payment) {
          if (error) {
            throw error;
          } else {
            console.log(payment);
            for (let i = 0; i < payment.links.length; i++) {
              if (payment.links[i].rel === "approval_url") {
                res.redirect(payment.links[i].href);
              }
            }
          }
        });
      }
    });
});
router.get("/order-success", async (req, res) => {
  if (req.session.user) {
    var cartCount = await userHelpers.getCarCount(req.session.user._id);
    var wishilistCount = await userHelpers.getwishilistCount(
      req.session.user._id
    );
  }
  var wishilistCount = await userHelpers.getwishilistCount(
    req.session.user._id
  );
  res.send({
    user: req.session.user,
    cartCount,
    wishilistCount,
  });
});
router.get("/asif", async (req, res) => {
  if (req.session.user) {
    var cartCount = await userHelpers.getCarCount(req.session.user._id);
    var wishilistCount = await userHelpers.getwishilistCount(
      req.session.user._id
    );
  }
  console.log(req.session.user?._id);
  let orders = await userHelpers.getUserOrders(req.session.user?._id);
  console.log(orders[0]?._id, "nhfngfghnfghf");

  let product = await userHelpers.getOrderProducts(orders[0]?._id);
  console.log("..", product);
  res.send({
    user: req.session.user,
    orders,
    cartCount,
    wishilistCount,
    product,
  });
});
router.post("/edit-profilepic", (req, res) => {
  let user = req.session.user._id;
  console.log(user, "asif");
  if (req.files.image) {
    let image = req.files.image;
    image.mv("./public/profile-pic/" + user + ".jpg", (err, done) => {
      req.session.user.profile = true;
      userHelpers.updateprofile(user).then((response) => {
        res.redirect("/user-profile");
      });
    });
  }
});
router.get("/update-profilepic", (req, res) => {
  let userid = req.session.user._id;
  req.session.user.profile = false;
  userHelpers.updatepic(userid).then((response) => {
    res.send({ response });
  });
});
router.post("/change-Phonenumber", (req, res) => {
  console.log("hi i");
  console.log(req.body);
  let phone = req.body.phonenumber;
  req.session.phoneNumber = phone;
  console.log(phone, "gh");
  client.verify
    .services(serviceSsid)
    .verifications.create({ to: `+91${phone}`, channel: "sms" })
    .then((resp) => {
      console.log(resp);
      res.send({ phone });
    });
});
router.post("/verify-otpprofile", (req, res) => {
  let phone = req.session.phoneNumber;
  let userid = req.session.user._id;
  console.log(userid);
  console.log(phone);
  let otp = req.body.phoneVerify;
  console.log(otp);

  client.verify
    .services(serviceSsid)
    .verificationChecks.create({
      to: `+91${phone}`,
      code: otp,
    })
    .then((resp) => {
      console.log("otp res", resp);
      var user = resp.valid;
      console.log(user);
      if (user == true) {
        req.session.user.phoneNumber = phone;
        console.log("asif");
        userHelpers.updatephone(phone, userid).then((response) => {
          res.redirect("/user-profile");
        });
      } else {
        console.log("ammen");
        res.send({ phone, number: true });
      }
    });
});
router.post("/applycoupon", async (req, res) => {
  let userId = req.session.user._id;
  let amount = req.session.total;
  let code = req.body.code;
  let coupon = await userHelpers.checkcoupon(code);
  if (coupon) {
    console.log(coupon);
    let check = await userHelpers.checkuser(userId, code);
    if (check) {
      res.send({ user: true });
    } else {
      userHelpers.updatcoupon(userId, code).then((response) => {
        let discountVal = ((amount * coupon.discount) / 100).toFixed();
        req.session.discount = discountVal;
        let offerprice = amount - discountVal;
        req.session.total = offerprice;
        console.log(offerprice);
        res.send({ offerprice });
      });
    }
  } else {
    res.send({ response });
  }
});
router.post("/change-Password", (req, res) => {
  let userID = req.session.user._id;
  console.log(req.body);
  console.log(userID);
  userHelpers.checkPassword(userID, req.body).then((response) => {
    console.log(response);
    res.send({ response });
  });
});

module.exports = router;
