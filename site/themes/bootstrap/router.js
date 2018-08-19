const router = require('express').Router()
const uuidv4 = require('uuid/v4')
const bm = require('bm')
module.exports = router

// reset our view engine for the site
router.use(function (req, res, next) {
  res.locals.theme = process.env.SITE_THEME
  res.locals.helpers = _helpers
  // set the correct layout file to make sure multi handlebars does not pick the first 'main' it finds
  res.locals.layout = 'site'
  next()
})

router.use(async (req, res, next) => {
  try {
    const config = bm.getConfig()
    res.locals.footer = await _db.findOne('footer', {})
    res.locals.config = config
    req.config = config
    next()
  } catch (err) {
    next(err)
  }
})

// check for maintenance mode
router.use(async (req, res, next) => {
  try {
    if (req.config && req.config.maintenance_mode === 'enabled') return res.render('maintenance/maintenance', {layout: 'error-page'})
    else next()
  } catch (err) {
    next(err)
  }
})

// todo fix the unhandled promise reject when you try to include a partial that does not exist
// the main homepage template will always be used for the root of the site, this expects to see a 'home.js' file in the site themes pages dir
router.get('/', (req, res, next) => {
  try {
    if (_sitePages['home'] && _sitePages['home'].express) _sitePages['home'].express(req, res, next)
    else next(new Error('NO HOMEPAGE TEMPLATE SET'))
  } catch (err) {
    next(err)
  }
})

// the main posts template will always be used at /posts, this expects to see a '/posts/posts.js' file in the site themes pages dir
router.get('/posts', (req, res, next) => {
  if (_sitePages['posts'] && _sitePages['posts'].express) _sitePages['posts'].express(req, res, next)
  else next(new Error('NO POSTS TEMPLATE SET'))
})

// the main posts template will always be used at /posts, this expects to see a '/posts/posts.js' file in the site themes pages dir
router.get('/posts/:permalinkSlug', async (req, res, next) => {
  try {
    const permalinkSlug = req.params.permalinkSlug
    const post = await bm.getPostByPermalinkSlug(permalinkSlug)
    post.authorName = (await bm.getAuthorById(post.author_id)).real_name
    if (post) {
      res.render('post/post', {
        post: post,
        page: await _db.findOne('postpage', {})
      })
    } else next()
  } catch (err) {
    next(err)
  }
})

// bind our dynamic routers to the main router
Object.keys(_sitePages).map(key => {
  if (_sitePages[key].router) router.use(`/${key}`, _sitePages[key].router)
})

// check for dynamic page routing. I.e a site page having its own .js controller file. These can either contain a single express router or a more complex router to handle sub routing.
router.get('/:page', (req, res, next) => {
  const page = req.params.page
  if (_sitePages[page] && _sitePages[page].express) _sitePages[page].express(req, res, next)
  else next()
})

// 404 handler. If we get here with no error no route has matched.
router.use((req, res, next) => {
  console.log(`UNKNOWN ROUTE: ${req.url}`)
  res.status(404)
  res.render('errors/404', {helpers: _helpers, layout: 'error-page'})
})

// ERRORS global error handling middleware MUST come last and MUST have 4 args
router.use((err, req, res, next) => {
  const supportId = uuidv4()
  const date = new Date()
  console.log(`${date} - ${supportId}: ${err.message}`)
  // do a raw error log here to make sure we get the full stack trace
  console.error(err)
  return res.status(500).render('errors/500', {
    helpers: _helpers,
    layout: 'error-page',
    message: 'Sorry something went wrong on our side',
    supportId: supportId
  })
})
