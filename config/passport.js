const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const connect = require('./connect');

function initialize(passport) {
    async function authenticateUser(nickname, password, done) {
        try {
            const db = await connect.con
            let sql = "SELECT * FROM users WHERE nickname=?"
            const response = await db.query(sql, nickname)
            const user = response[0]

            if (user == []) {
                return done(null, false)
            }

            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false)
            }
        } catch (e) {
            return done(e)
        }
    }
    passport.use(new LocalStrategy(
        {
            usernameField: 'nickname',
            passwordField: 'password'
        },
        authenticateUser))
    passport.serializeUser((user, done) => { done(null, user); console.log("serialized") })
    passport.deserializeUser((user, done) => {
        if (user.id) {
            done(null, user);
            console.log("deserialized")
        } else {
            console.log("Erro deserialized")
            done(user.errors, null)
        }
    })
}

module.exports = initialize