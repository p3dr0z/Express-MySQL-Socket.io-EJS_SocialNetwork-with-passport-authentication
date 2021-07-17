const router = require('express').Router()
const passport = require("passport")
const connect = require('../config/connect')
const bcrypt = require('bcryptjs')
let timer
let noRepeat = 0

router.get('/', isLoggedIn, async (req, res) => {
    try {
        const db = await connect.con
        const user = req.user
        const otherUsers = await db.query(`select * from users where id != ${user.id} order by status desc`)
        res.render('../views/app.ejs', { user: user, users: otherUsers})
        if (noRepeat == 0) {
            noRepeat++
            timer = setTimeout(() => { noRepeat = 0; changeStatus(user.id, 'OFFLINE') }, 120 * 1000)
        }
    } catch (err) {
        console.log(err)
    }
})

router.get('/signin', isNotLoggedIn, (req, res) => {
    res.render('../views/index.ejs')
})

router.get('/signup', isNotLoggedIn, (req, res) => {
    res.render('../views/registo.ejs')
})

router.post('/signin', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash: 'Nick e/ou password errados'
}
))

router.post('/signup', checkData, async (req, res) => {
    try {
        const db = await connect.con
        const password = await bcrypt.hash(req.body.password, 8)
        const nickname = req.body.name
        const post = { nickname: nickname, password: password }
        let sql = 'INSERT INTO users SET ?'
        await db.query(sql, post, (err, rows) => {
            if (!err) {
                req.flash('success', 'Registo efetuado')
                res.redirect('/signin')
            } else {
                console.log(err)
                console.log('Erro no registo')
                res.redirect('/signup')
            }
        })
    } catch (Exception) {
        console.log(Exception)
        res.redirect('/signup')
    }
})

router.delete('/logout', (req, res) => {
    if (noRepeat != 0) {
        noRepeat = 0
        clearTimeout(timer)
        changeStatus(req.user.id, 'OFFLINE')
    }
    req.logOut();
    res.redirect('/signin');
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        changeStatus(req.user.id, 'ONLINE')
        return next();
    } else {
        res.redirect('/signin');
    }
}

function isNotLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return res.redirect('/');
    next();
}

async function checkData(req, res, next) {
    try {
        const db = await connect.con
        const nickname = req.body.name
        const password = req.body.password
        const checkPassword = req.body.checkPassword
        if (password == checkPassword) {
            let sql = 'SELECT * FROM users WHERE nickname = ?'
            await db.query(sql, nickname, (err, rows) => {
                if (err) { console.log(err) }
                else if (rows[0] != null) {
                    req.flash('error', 'Nickname já existe')
                    res.redirect('/signup')
                }
                else {
                    console.log('Check Data Ok'); return next()
                }
            })
        } else {
            req.flash('error', 'Password não corresponde')
            res.redirect('/signup')
        }
    } catch (Exception) {
        console.log(Exception)
        res.redirect('/signup')
    }
}

async function changeStatus(id, status) {
    try {
        const db = await connect.con
        const update = await db.query(`UPDATE users SET status = "${status}" WHERE id = ${id}`)
        if (update == undefined) return
        console.log(`${id}: Status Update --> ${status}`)

    } catch (e) {
    console.log(e)
}
}

module.exports = router