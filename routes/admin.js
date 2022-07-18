const { response } = require("express");
var express = require("express");
const async = require("hbs/lib/async");

const productHelpers = require("../helpers/product-helpers");
const { countDaySales } = require("../helpers/product-helpers");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
const userHepers = require("../helpers/user-hepers");

/* GET users listing. */

const cridential = {
  email: "asifsaheer7034@gmail.com",
  password: 1234,
};

const verifylogin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.send({ login: true });
  }
};

router.post("/admin-login", (req, res) => {
  if (
    req.body.email == cridential.email &&
    req.body.password == cridential.password
  ) {
    req.session.admin = true;

    res.send({login: true});
  } else {
    res.send({ login: true, loginadminErr: true });
  }
  loginadminErr = false;
});

router.get("/admin-logout", (req, res) => {
  req.session.admin = false;
  res.redirect("/admin");
});

router.get("/", async function (req, res, next) {
  let Totaloder = await productHelper.TotalOders();
  let Totalusers = await productHelper.Totalusers();
  let Totalsales = await productHelper.Totalsales();
  let Totalprofit = await productHelper.Totalprofit();

  let totalProfit = Totalprofit[0];
  let total = Totaloder[0];
  let totalSales = Totalsales[0];
  let users = Totalusers[0];
  res.send({
    total,
    totalSales,
    totalProfit,
    users,
    admin: true
  });
});
router.get("/products", (req, res) => {
  productHelpers.getAllproducts().then((products) => {
    res.send({ products, admin: true });
  });
});
router.get("/add-product", async (req, res) => {
  let category = await productHelper.getAllcategory();
  console.log("kgggtggvvftv vftr");
  console.log(category);
  res.send({ admin: true, category });
});
router.post("/add-product", (req, res) => {
  productHelper.addproduct(req.body, (id) => {
   console.log("ifffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",id);
 
    let image = req.files.image;
    let image2 = req.files?.image2;
    let image3 = req.files?.image3;
console.log(image,image2,image3, "koiiiiiiiiiiii");
    image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.send({ admin: true });
      } else {
        console.log(err,"errrrrrrrrrr");
      }
    });

    image2.mv("./public/product-images2/" + id + ".jpg", (err, done) => {
    if(err){
      res.send({ success: false });
      
    }
     });
    image3.mv("./public/product-images3/" + id + ".jpg", (ree, done) => { 
      if(ree){
        res.send({ success: false });
      }
    });
    res.send({ success: true });

  });
});

router.get("/edit-product/:id", async (req, res) => {
  let category = await productHelper.getAllcategory();
  let product = await productHelper.getAllproductsDetails(req.params.id);
  console.log(product);
  res.send({ product, admin: true, category });
});
router.post("/edit-product/:id", (req, res) => {
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    let id = req.params.id;
    res.redirect("/admin/");
    if (req.files.image) {
      let image = req.files.image;
      image.mv("./public/product-images/" + id + ".jpg", (err, done) => { });
    }
  });
  req.send({ success: true });
});
router.get("/delete-product/:id", (req, res) => {
  let proId = req.params.id;
  console.log(proId);

  productHelpers.deleteProduct(proId).then((response) => {
    res.send({ success: true });
  });
});
router.get("/view-category", (req, res) => {
  productHelper.getAllcategory().then((category) => {
    console.log(category);
    res.send({ category, admin: true });
  });
});
router.get("/add-category", (req, res) => {
  res.send({ admin: true });
});
router.post("/add-category", (req, res) => {
  productHelper.addcategory(req.body).then((id) => {
    let categoryImage = req.files.image;
    categoryImage.mv("./public/category-image/" + id + ".jpg", (err, done) => {
      if (err) {
        console.log(err);
        res.send({ err });
      } else {
        res.send({ admin: true });
      }
    });
    res.redirect("/admin");
  });
});
router.get("/delete-category/:id", (req, res) => {
  let cateId = req.params.id;
  console.log(cateId);
  productHelper.deleteCategory(cateId).then((response) => {
    res.send({ success: true });
  });
});

router.get("/edit-category/:id", async (req, res) => {
  let category = await productHelper.getAllcategoryDetails(req.params.id);
  res.send({ category, admin: true });

});

router.post("/edit-category/:id", (req, res) => {
  productHelper.updateCategory(req.params.id, req.body).then(() => {
    res.redirect("/admin");
    console.log(response);
    let id = req.params.id;
    let images = req.files.image;
    console.log("bjbbkbkj");
    if (req.files.image) {
      images.mv("./public/category-image/" + id + ".jpg", (err, done) => { });
    }
    res.send({ success: true });
  });
});
router.get("/all-users", (req, res) => {
  productHelper.getAllUsers().then((users) => {
    res.send({ users, admin: true });
  });
});

//admin

router.get("/block-user/:id", (req, res) => {
  let id = req.params.id;
  console.log(id);
  req.session.destroy();
  productHelpers.blockUsers(id).then((resp) => {
    if (resp) {
      res.send({ success: true });
    } else {
      console.log("failed");
      res.send({ success: false });
    }
  });
});
router.get("/unblock-user/:id", (req, res) => {
  const id = req.params.id;
  productHelper.unblockUser(id).then((resp) => {
    if (resp) {
      res.send({ success: true });

      console.log(resp);
    } else {
      console.log("failed");
      res.send({ success: false });
    }
  });
});
router.get("/delete-users/:id", (req, res) => {
  let id = req.params.id;
  productHelper.deleteUsers(id).then((response) => {
    res.send({ success: true });
  });
});
router.get("/all-orders", (req, res) => {
  productHelper.getAllorders().then((orders) => {
    res.send({ orders, admin: true });
  });
});
router.post("/updateStatus", (req, res) => {
  let orderStatus = req.body.status;
  let orderId = req.body.orderId;
  console.log("hgjfhgfhg");
  console.log(orderStatus);

  if (orderStatus == "canceled") {
    productHelper.canceledUpdate(orderId).then((res) => {
      console.log("caancled");
      console.log(res);
    });
  } else if (orderStatus == "Delived") {
    userHepers.placedUpdate(orderId).then((response) => {
      console.log("placed");
    });
  } else if (orderStatus == "order confirmed") {
    userHepers.placedUpdatecon(orderId).then((response) => {
      console.log("placed");
    });
  } else if (orderStatus == "shipped") {
    userHepers.placedUpdateship(orderId).then((response) => {
      console.log("placed");
    });
  } else if (orderStatus == "Arriving") {
    userHepers.placedUpdatesArriv(orderId).then((response) => {
      console.log("placed");
    });
  }
  console.log(orderId);
  productHelper.upadateStatus(orderId, orderStatus).then((response) => {
    console.log(response);
    res.send({ status: true });
  });
});
router.get("/order-product-details/:id", async (req, res) => {
  let orderId = req.params.id;
  let products = await userHepers.getOrderProducts(orderId);
  console.log("bxvxvxvcxc");
  console.log(products);
  res.send({ admin: true, products });
});
router.get("/add-banner", (req, res) => {
  res.send({ admin: true });
});
router.post("/add-banner", (req, res) => {
  productHelper.addBanner(req.body).then((id) => {
    console.log(id);
    let image = req.files.image;
    image.mv("./public/banner-images/" + id + ".jpg", (err, done) => { });
  });
  res.redirect("/admin/");
});
router.get("/view-banner", async (req, res) => {
  let banneer = await productHelper.getAllBanner();
  console.log(banneer);
  res.send({ admin: true, banneer });
});
router.get("/edit-banner/:id", async (req, res) => {
  let id = req.params.id;
  console.log(id);
  let banner = await productHelper.getEditBanner(id);
  console.log(banner);
  res.send({ banner, admin: true });
});
router.post("/edit-banner/:id", (req, res) => {
  let id = req.params.id;
  console.log(req.body);
  productHelper.updateBanner(req.body, id).then((response) => {
    res.redirect("/admin");
    if (req.files.image) {
      let image = req.files.image;
      image.mv("./public/banner-images/" + id + ".jpg", (err, done) => { });
    }
  });
});
router.post("/delete-banner", (req, res) => {
  let id = req.body.bannerId;
  console.log(id);
  productHelper.deletebanner(id).then((response) => {
    res.send({ response });
  });
});
router.get("/getChartDates", async (req, res) => {
  console.log("kgjhgjhfhj");
  let month = await productHelper.countsalemonth();
  console.log("amene");
  let dailySales = await productHelper.countDaySales();
  console.log("amene");
  let yearlySales = await productHelpers.getYearlySale();
  console.log(month, "bhgjhfghjgf");
  res.send({ dailySales, yearlySales, month });
});
router.get("/view-coupon", async (req, res) => {
  let coupon = await productHelper.findcoupon();
  res.send({ admin: true, coupon });
});
router.post("/view-coupon", (req, res) => {
  console.log(req.body);
  productHelper.addcoupon(req.body).then((response) => {
    res.send({ response });
  });
});
router.get('/sales-reports', async (req, res) => {
  let orders = await productHelper.getAllorders()
  res.send({ admin: true, orders })
})
module.exports = router;
