const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const index = require('./routes/index')

const app = express()

const port = 2729

//Allow CORS
app.use(cors({
    origin: '*',
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE'
}))

//Morgan logger
app.use(morgan('dev'))

//View Engine
app.use(express.static(path.join(__dirname, '../client/dist')))
app.set('view engine', 'html')

//Body Parser Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use('/', index)

app.use((req, res, next) => {
    const error = new Error('404 Not Found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    .json({
        error: {
            success: false,
            message: error.message
        }
    })
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})

module.exports = app
