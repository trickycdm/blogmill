const router = require('express').Router()
const auth = require('auth')
module.exports = router

router.get('/', (req, res, next) => {
  // todo set this dynamicaly
  if (req.cookies[CMS_CONFIG.AUTH_COOKIE_NAME]) return res.redirect(CMS_CONFIG.CMS_HOME)
  let td = {layout: 'pre-login'}
  res.render('login/login', td)
})

router.post('/', async (req, res, next) => {
  try {
    const username = req.body.username
    const pw = req.body.pw
    if (!username || !pw) return sendInvalidResp(res)
    const user = await auth.authenticateLocalUser(username, pw)
    if (!user) return sendInvalidResp(res)
    const jwt = await auth.createJwt(user)
    await auth.setAuthCookie(jwt, res)
    res.json({control: true})
  } catch (err) { next(err) }
})

function sendInvalidResp (res) { res.json({control: false, message: 'Invalid login details'}) }
