const bcrypt = require('bcryptjs')
const saltRounds = 10
const jwt = require('jsonwebtoken')
const moment = require('moment')
const bm = require('bm')

const auth = {
  hash: async what => bcrypt.hash(what, saltRounds),
  validateHash: async (pw, fullHash) => bcrypt.compare(pw, fullHash),
  authenticateLocalUser: async (userName, pw) => {
    const user = await DB.findOne('users', { username: userName })
    if (!user) return false
    const validPw = await auth.validateHash(pw, user.pw)
    if (validPw) return user
    else return false
  },
  createJwt: (user) => jwt.sign({ user: { id: user.id } }, process.env.SALT),
  setAuthCookie: (jwtToken, res) => res.cookie(CMS_CONFIG.AUTH_COOKIE_NAME, jwtToken, { maxAge: 7 * 24 * 3600 * 1000 }),
  validateJwt: async (req, res, next) => {
    try {
      const cookie = req.cookies[CMS_CONFIG.AUTH_COOKIE_NAME]
      if (!cookie) return auth.logout(req, res)
      const validJwt = jwt.verify(cookie, process.env.SALT)
      if (!validJwt) return auth.logout(req, res)
      else {
        const expiryTime = moment.unix(validJwt.exp)
        const now = moment()
        // check for expired token
        if (expiryTime.isBefore(now)) return auth.logout(req, res)
        // valid user attach there details to the req and res object for further processing
        const user = await bm.getUserById(validJwt.user.id)
        if (!user) return auth.logout(req, res)
        delete user.pw
        req.user = user
        res.locals.user = user
        next()
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') auth.logout(req, res)
      // This occasionally happens when you switch between blogmill instances and have token with the same name but different salt, in this case just log the user out.
      if (err.message === 'invalid signature') auth.logout(req, res)
      console.error(err)
      next(err)
    }
  },
  // this requires both req and res to act as a regular middleware function
  logout: (req, res) => {
    res.clearCookie(CMS_CONFIG.AUTH_COOKIE_NAME)
    // todo set this base root dynamically
    res.redirect(303, '/cms/login')
  }
}
module.exports = auth
