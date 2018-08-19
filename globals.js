const fs = require('fs')

exports.setGlobals = async () => {
  try {
    global._root = __dirname
    global._db = require(process.env.DB_TYPE)
    await _db.connect()
    global._helpers = require('hbs-helpers').helpers

    const siteThemeRoot = `${_root}/site/themes/${process.env.SITE_THEME}`
    global._sitePages = loadSitePages(`${siteThemeRoot}/pages`, true)
  } catch (err) { console.error(new Error(`PROBLEM LOADING GLOBAL VARS: ${err}`)) }
}

function loadSitePages (pagesBaseDir) {
  let pageControllers = {}
  fs.readdirSync(pagesBaseDir).forEach(pageDir => {
    let fullFilePath = `${pagesBaseDir}/${pageDir}`
    fs.readdirSync(fullFilePath).forEach(controller => {
      const ext = controller.split('.').pop()
      if (ext === 'js') {
        const strippedControllerName = controller.split('.js')[0]
        const fullPath = `${fullFilePath}/${strippedControllerName}`
        pageControllers[strippedControllerName] = require(fullPath)
      }
    })
  })
  return pageControllers
}
