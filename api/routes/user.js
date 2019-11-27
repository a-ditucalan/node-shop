const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken") //for logintoken

const User = require("../models/user")
router.get("/", (req, res, next) => {
  User.find()
    .exec()
    .then(docs => {
      console.log(docs)
      res.status(200).json(docs)
    })
    .catch(err => {
      res.status(500).json({ error: err })
    })
})

router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed"
        })
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed"
          })
        }

        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h"
            }
          ) //for generating token for user
          return res.status(200).json({
            message: "Auth successful",
            token: token
          })
        }

        res.status(401).json({
          message: "Auth failed"
        })
      })
    })
    .catch(err => {
      res.status(500).json({ error: err })
    })
})

router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "mail exist"
        })
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            })
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            })
            user
              .save()
              .then(result => {
                console.log(result)
                res.status(201).json({
                  message: "User Created",
                  data: result
                })
              })
              .catch(err => {
                console.log(err)
                res.status(500).json({ error: err })
              })
          }
        })
      }
    })
})

router.delete("/:userID", (req, res, next) => {
  const id = req.params.userID

  User.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Product deleted"
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        err: "error"
      })
    })
})

module.exports = router

//localhost:3000/user/signup/
// {
// 	"email": "test@test.com",
// 	"password": "tester"
// }
