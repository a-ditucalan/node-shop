const express = require("express")
const router = express.Router()
const mongoose = require("mongoose") //for mongodb extension
const multer = require("multer") //for starage
const checkAuth = require("../middleware/check-auth")

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/")
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  //reject file
  if (file.mimetype === " image/jpeg" || file.mimetype === "image/png") {
    cb(null, true) //store the file
  } else {
    cb(null, false)
    // cb(new Error('message', false))
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
})

const Product = require("../models/product")

router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id productImage")
    .exec()
    .then(docs => {
      console.log(docs)
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            _id: doc._id,
            productImage: doc.productImage,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/" + doc._id
            }
          }
        })
      }
      res.status(200).json(response)
      // res.status(200).json(docs)
    })
    .catch(err => {
      res.status(500).json({ error: err })
    })
  // Product.find().where({name: "anuar"})
  // Product.find().limit()
  // res.status(200).json({
  //   message: "handling Get request to /products"
  // find({ occupation: /host/ }).
  // where('name.last').equals('Ghost').
  // where('age').gt(17).lt(66).
  // where('likes').in(['vaporizing', 'talking']).
  // limit(10).
  // sort('-occupation').
  // select('name occupation').
  // exec(callback);
  // })
})

router.post("/", upload.single("productImage"), checkAuth, (req, res, next) => {
  //verify muna yung token bago maexecute yung susunod na parameter
  // kailangan pangalawa yung checkAuth kase sa bodyparse urlencoeded at json lang kase at formdata ginagamit sa upload
  // const product = {
  //   name: req.body.name,
  //   price: req.body.price
  // }
  console.log(req.file)
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  })
  product
    .save()
    .then(result => {
      console.log(result)
      // res.status(201).json({
      //   message: "handling Get request to /products",
      //   createProduct: result
      // })

      res.status(201).json({
        message: "Created product successfully",
        createProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/products" + result._id
          }
        }
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({ error: err })
    })
})

router.get("/:productID", (req, res, next) => {
  const id = req.params.productID

  Product.findById(id)
    .exec()
    .then(doc => {
      console.log(doc)
      if (doc) {
        res.status(200).json(doc)
      } else {
        res
          .status(404)
          .json({ message: "no valid entry found for provided ID" })
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({ error: err })
    })

  // if (id === "special") {
  //   res.status(200).json({
  //     message: "You discovered the special ID",
  //     id: id
  //   })
  // } else {
  //   res.status(200).json({
  //     message: "You passed an ID"
  //   })
  // }
})

router.patch("/:productID", (req, res, next) => {
  const id = req.params.productID
  const updateOps = {}

  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value
  }

  Product.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      // res.status(200).json(result)
      result.status(200).json({
        message: "Product Updated",
        request: {
          type: "PATCH_PRODUCT",
          url: "http://localhost:3000/product/" + id
        }
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({ error: err })
    })
})
// router.patch("/:productID", (req, res, next) => {
//   const id = req.params.productID
//   const updateOps = {}
//   //[{"propName": "name", "value": "harry"}]
//   for (const ops of req.body) {
//     updateOps[ops.propName] = ops.value
//   } //para maging dynamic kung ano lang gusto mong ibahin

//   // Product.update(
//   //   { _id: id },
//   //   { $set: { name: req.body.newName, price: req.body.newPrice } }
//   // )
//   Product.update({ _id: id }, { $set: updateOps })
//     .exec()
//     .then(res => {
//       console.loog(updateOps)
//       res.status(200).json(res)
//     })
//     .catch(err => {
//       console.log(err)
//       console.loog(updateOps)
//       res.status(500).json({
//         err: "error"
//       })
//     })
//   // res.status(200).json({
//   //   message: "Updated product!"
//   // })
// })

router.delete("/:productID", (req, res, next) => {
  const id = req.params.productID

  Product.remove({ _id: id })
    .exec()
    .then(res => {
      res.status(200).json({
        message: "Product deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/products",
          body: { name: "String", price: "Number" }
        }
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        err: "error"
      })
    })
  // res.status(200).json({
  //   message: "deleted product!"
  // })
})
module.exports = router
