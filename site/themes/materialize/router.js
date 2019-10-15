const router = require('express').Router()
const uuidv4 = require('uuid/v4')
const bm = require('bm')
module.exports = router

// reset our view engine for the site
router.use(function (req, res, next) {
  res.locals.theme = process.env.SITE_THEME
  res.locals.helpers = HBS_HELPERS
  // set the correct layout file to make sure multi handlebars does not pick the first 'main' it finds
  res.locals.layout = 'site'
  res.locals.menu = {
    links: [
      { href: 'news', lbl: 'News' }
    ]
  }
  next()
})

router.use(async (req, res, next) => {
  try {
    const config = bm.getConfig()
    res.locals.footer = await DB.findOne('footer', {})
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
    if (req.config && req.config.maintenance_mode === 'enabled') return res.render('maintenance/maintenance', { layout: 'error-page' })
    else next()
  } catch (err) {
    next(err)
  }
})

// todo fix the unhandled promise reject when you try to include a partial that does not exist
// the main homepage template will always be used for the root of the site, this expects to see a 'home.js' file in the site themes pages dir
router.get('/', (req, res, next) => {
  try {
    if (SITE_PAGES.home && SITE_PAGES.home.express) SITE_PAGES.home.express(req, res, next)
    else next(new Error('NO HOMEPAGE TEMPLATE SET'))
  } catch (err) {
    next(err)
  }
})

// the main posts template will always be used at /posts, this expects to see a '/posts/posts.js' file in the site themes pages dir
router.get('/posts', (req, res, next) => {
  if (SITE_PAGES.posts && SITE_PAGES.posts.express) SITE_PAGES.posts.express(req, res, next)
  else next(new Error('NO POSTS TEMPLATE SET'))
})

router.get('/posts/:permalinkSlug', async (req, res, next) => {
  try {
    const permalinkSlug = req.params.permalinkSlug
    const post = await bm.getPostByPermalinkSlug(permalinkSlug)
    if (post) {
      post.authorName = await bm.getAuthorById(post.author_id).real_name
      res.render('post/post', {
        post: post,
        page: await DB.findOne('postpage', {})
      })
    } else next()
  } catch (err) {
    next(err)
  }
})

// bind our dynamic routers to the main router
Object.keys(SITE_PAGES).map(key => {
  if (SITE_PAGES[key].router) router.use(`/${key}`, SITE_PAGES[key].router)
})

// check for dynamic page routing. I.e a site page having its own .js controller file. These can either contain a single express router or a more complex router to handle sub routing.
router.get('/:page', (req, res, next) => {
  const page = req.params.page
  if (SITE_PAGES[page] && SITE_PAGES[page].express) SITE_PAGES[page].express(req, res, next)
  else next()
})

// 404 handler. If we get here with no error no route has matched.
router.use((req, res, next) => {
  console.log(`UNKNOWN ROUTE: ${req.url}`)
  res.status(404)
  res.render('errors/404', { helpers: HBS_HELPERS, layout: 'error-page' })
})

// ERRORS global error handling middleware MUST come last and MUST have 4 args
router.use((err, req, res, next) => {
  const supportId = uuidv4()
  const date = new Date()
  err.message = `${date} - ${supportId}: ${err.message}`
  console.error(err)
  return res.status(500).render('errors/500', {
    helpers: HBS_HELPERS,
    layout: 'error-page',
    message: 'Sorry something went wrong on our side',
    supportId: supportId
  })
})
