const express = require("express")
const app = express()
const morgan = require("morgan")
const bodyParser = require("body-parser")

const productRoutes = require("./api/routes/products")
const orderRoutes = require("./api/routes/orders")
const userRoutes = require("./api/routes/user")
const mongoose = require("mongoose")

mongoose.connect(
  "mongodb+srv://anuarditucalan:" +
    process.env.MONGO_ATLAS_PW +
    "@node-rest-shop-tt8w2.mongodb.net/test?retryWrites=true&w=majority",
  {
    // useMongoClient: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
mongoose.set("useCreateIndex", true)
mongoose.Promise = global.Promise

app.use(express.static("uploads")) // para maging public
app.use(morgan("dev"))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use((req, res, next) => {
  res.header("Access-Control-allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  )

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET")
    return res.status(200).json({})
  }

  next()
})

app.use("/products", productRoutes)
app.use("/orders", orderRoutes)
app.use("/user", userRoutes)

app.use((req, res, next) => {
  const error = new Error("Not found")
  error.status(404)
  next(error)
})

app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message
    }
  })
})

module.exports = app
