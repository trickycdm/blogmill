const fs = require('fs-extra')
module.exports = async () => {
  try {
    /**
     * Load our config and set defaults for those not defined
     * @type {*}
     */
    global.CMS_CONFIG = require('./config.json')

    /**
     * Set our path for temp file uploads and there final destination
     * @type {string}
     */
    global.TEMP_FILE_PATH = `${_root}/${CMS_CONFIG.TEMP_FILE_DIR}`
    // this is the relative path to serve images via the browser
    CMS_CONFIG.RELATIVE_IMG_UPLOADS_DIR = `${CMS_CONFIG.CMS_ROOT}/${CMS_CONFIG.RELATIVE_IMG_UPLOADS_DIR}`
    // this is the full file system path to manipulate files o the server
    global.PUBLIC_UPLOAD_PATH = `${_root}/${CMS_CONFIG.RELATIVE_IMG_UPLOADS_DIR}`

    /**
     * Set up all the CMS pages and options.
     * 1. Check for the main CMS controller files. These are used to create standard nodemill pages that will run through the table and detail view.
     * 2. Load the client side CSS and JS for the CMS
     * 3. Check for any bolt on CMS modules, These are fully self contained parts that are loaded before the standard nodemill routes.
     * 4. Check for individual CMS pages defined in the site theme. This allows an individual site page to create an ad hoc CMS page, these are loaded before everything as they are the most specific.
     */
    global.CMS_SCHEMA = `${_root}/cms/schema`
    const cmsData = loadCmsPages(CMS_SCHEMA)
    global.CMS_ROUTES = cmsData.routes
    // global.CMS_MENU = cmsData.menu
    global.CMS_MENU = require('./menu.json')
    // check for any field controller.js files
    global.FIELD_CONTROLLERS = await loadFieldControllers()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

/**
 * This will only construct valid CMS routes and attach the full path to the correct schema, it does not load the schema to this point, that is done per request.
 * @param schemaPath
 * @returns {{routes: {}, menu: Array}}
 */
function loadCmsPages (schemaPath) {
  const schema = require(schemaPath)
  const cmsData = { routes: {}, menu: [] }
  for (const page of schema.pages) {
    cmsData.routes[page.route] = schemaPath
    if (page.menu && page.menu.show) cmsData.menu.push({ lbl: page.menu.lbl, href: page.route, icon: page.menu.icon })
  }
  return cmsData
}

async function loadFieldControllers () {
  try {
    const fieldsBaseDir = _root + '/cms/components/fields'
    const fields = await fs.readdir(fieldsBaseDir)
    const fieldControllers = {}
    fields
      .filter(field => fs.existsSync(`${fieldsBaseDir}/${field}/controller.js`))
      .forEach(field => { fieldControllers[field] = require(`${fieldsBaseDir}/${field}/controller`) })
    return fieldControllers
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
