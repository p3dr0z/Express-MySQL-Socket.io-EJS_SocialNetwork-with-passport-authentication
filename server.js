require('dotenv').config()

const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const host = process.env.HOST || '127.0.0.1'

const cors = require('cors')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const expressLayout = require('express-ejs-layouts')

const http = require('http')
const server = http.createServer(app)
const socket = require('socket.io')
const io = socket(server)

app.use(cors())


app.use(bodyParser.json(), bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayout)
app.use(express.static(path.join(__dirname + '/public')))

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 120*1000,
        httpOnly: true,
    }
}))
app.use(flash())
app.use(function(req, res, next) {
    res.locals.alerts = req.flash();
    next();
  });
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);
app.use(methodOverride('_method'));

io.on('connection', socket => {
    socket.on('send-chat-message', (message, user) => {
        socket.broadcast.emit('chat-message', {message: message, user: user})
    })
})
const router = require('./routes/auth')
app.use('/', router)

server.listen(port, () => console.log(`Server running on http://${host}:${port}`))