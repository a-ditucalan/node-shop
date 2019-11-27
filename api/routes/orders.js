const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")

const Order = require("../models/order")
const Product = require("../models/product")

router.get("/", (req, res, next) => {
  // res.status(200).json(result => {
  //   result.status(200).json({
  //     data: result,
  //     message: "Orders were fecthed"
  //   })
  // })

  Order.find()
    .select("product quantity _id")
    .populate("product", "name price") //para mag merge or makuha yung data ng product parang innerjoin\
    .exec()
    .then(docs => {
      console.log(docs)
      const response = {
        count: docs.length,
        orders: docs.map(doc => {
          return {
            product: doc.product,
            quantity: doc.quantity,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/order/" + doc._id
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
})

router.post("/", (req, res, next) => {
  Product.findById(req.body.productId)
    .then(product => {
      if (!product) {
        return res.status(404).json({ message: "product not found" })
      }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        product: req.body.productId,
        quantity: req.body.quantity
      })
      order
        .save()
        .then(result => {
          res.status(200).json({
            message: "Order stored",
            createdOrder: {
              id: result.id,
              product: result.product,
              quantity: result.quantity
            },
            request: {
              type: "GET",
              url: "htpp://localhost:3000/orders/" + result._id
            }
          })
        })
        .catch(err => {
          res.status(500).json({
            error: err
          })
        })
    })
    .catch(err => {
      res.status(500).json({
        message: "Product not found",
        error: err
      })
    })
})

router.get("/:orderID", (req, res, next) => {
  Order.findById(req.params.orderID)
    .exec()
    .then(order => {
      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        })
      }
      res.status(200).json({
        order: order,
        request: {
          type: "GET",
          url: "http://localhost:300/orders"
        }
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
  // res.status(200).json({
  //   message: "Order Details",
  //   orderID: req.params.orderID
  // })
})

router.delete("/:orderID", (req, res, next) => {
  Order.remove({ _id: req.params.orderID })
    .exec()
    .then(result => {
      res
        .status(200)
        .json({
          message: "Order Deleted",
          request: {
            type: "POST",
            url: "http://localhost:300/orders",
            body: {
              productID: "ID",
              quantity: "Number"
            }
          }
        })
        .catch(err => {
          res.status(500).json({
            message: "error in delete"
          })
        })
      // res.status(200).json({
      //   message: "Order deleted",
      //   orderID: req.params.orderID
      // })
    })
})

module.exports = router
