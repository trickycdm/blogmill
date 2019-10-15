// pull all our env confs here. Required to make things MUCH easier to manage
require('dotenv').config()
require('dotenv-safe').config()

// add our custom module paths first so we can use a nicer require
require('app-module-path').addPath(`${__dirname}/lib`)
const exphbs = require('express-handlebars-multi')

;(async function main () {
  try {
    // Pre-loading any pages and api libraries rather than searching for them at runtime
    await require('./globals').setGlobals()
    // express init
    const express = require('express')
    const app = express()
    app.set('port', process.env.NODE_PORT || 3000)

    const SITE_THEME = process.env.SITE_THEME
    // Handlebars engine, with multiple source dirs. Ensure you name the primary layout files with uniques names and set them before rendering for site and cms.
    const hbsOptions = {
      ext: '.hbs',
      helpers: require('hbs-helpers').helpers,
      defaultLayout: 'main',
      layoutDirs: [`${_root}/cms/layouts/`, `${_root}/site/themes/${SITE_THEME}/layouts/`],
      partialDirs: [`${_root}/cms/components/`, `${_root}/site/themes/${SITE_THEME}/components/`]
    }
    app.engine('.hbs', exphbs(hbsOptions))
    app.set('view engine', '.hbs')
    app.set('views', [`${_root}/cms/pages/`, `${_root}/site/themes/${SITE_THEME}/pages/`])

    const bodyParser = require('body-parser')
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    // Cookies and session. CMS user details are stored in JWT token
    app.use(require('cookie-parser')(process.env.SALT))
    app.use(require('express-session')({ secret: process.env.SALT, resave: true, saveUninitialized: true }))

    // mount our api
    app.use('/api', require(`${_root}/api/router`))

    // Load the CMS and set the correct public prefix for all CMS resources.
    require('./cms/pre-loads')()
    app.use('/cms', express.static(`${_root}/cms`))
    app.use('/cms', require('./cms/router'))

    // Load the site and set the correct site public prefix, this will ensure all public files request at /site/public come form the correct theme
    app.use('/site', express.static(`${_root}/site/themes/${SITE_THEME}`))
    app.use('/', require(`./site/themes/${SITE_THEME}/router`))

    if (process.env.INIT_SQL) require('init-sql').initDb()
    if (process.env.UPDATE_COLUMNS) require('init-sql').updateColumns()

    // Start our node server
    app.listen(app.get('port'), () => console.log(`Server started on http://localhost:${app.get('port')} press Ctrl-C to terminate.`))

    // we should never need this but helpful if there is a rouge unhandled rejection
    process.on('unhandledRejection', err => {
      err.message += 'UNHANDLED PROMISE REJECTION: ' + err.message
      console.error(err)
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()
