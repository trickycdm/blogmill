const fs = require('fs')

exports.setGlobals = async () => {
  try {
    global._root = __dirname
    global._db = require('db')
    global._helpers = require('hbs-helpers').helpers
    const siteThemeRoot = `${_root}/site/themes/${process.env.SITE_THEME}`
    global._sitePages = loadSitePages(`${siteThemeRoot}/pages`, true)
  } catch (err) {
    err.message = `PROBLEM LOADING GLOBAL VARS: ${err.message}`
    console.error(err)
    process.exit(1)
  }
}

function loadSitePages (pagesBaseDir) {
  const pageControllers = {}
  fs.readdirSync(pagesBaseDir).forEach(pageDir => {
    const fullFilePath = `${pagesBaseDir}/${pageDir}`
    fs.readdirSync(fullFilePath).forEach(controller => {
      const ext = controller.split('.').pop()
      // make sure our js files are not our client side partials
      if (ext === 'js' && controller.indexOf('_') === -1) {
        const strippedControllerName = controller.split('.js')[0]
        const fullPath = `${fullFilePath}/${strippedControllerName}`
        pageControllers[strippedControllerName] = require(fullPath)
      }
    })
  })
  return pageControllers
}
