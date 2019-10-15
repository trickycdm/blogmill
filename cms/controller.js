const dataUtils = require('data-utils')

/**
 * Validate the CMS page router and fetch the CMS page form the schema and load its config into a transient variable. This ensures we do not pass global state CMS pages around and keeps the schema immutable
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
exports.getCmsPageModel = async (req, res, next) => {
  try {
    if (CMS_ROUTES[req.params.page]) {
      const cmsPage = getCmsPageFromSchema(req.params.page)
      req.pageSchema = await processPageSchema(cmsPage)
      next()
    } else send404(req, res, next)
  } catch (err) {
    console.error(err)
    next(err)
  }
}

/**
 * Our main CMS page render. This is used to attach all the values to our schema fields. By default this will pass all data to the 'fields' view unless an override has been specified on the schema 'template' prop
 * req.pageSchema - the main page options as defined in the page controller
 * req.params.id - if this is an edit render this will be the unique id to match the DB entry
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
exports.getFieldsRenderData = async (req, res, next) => {
  try {
    const recordId = req.params.id || false
    const pageData = await getPageRecord(recordId, req.pageSchema.table)
    const valueAttachedFields = pageData ? await attachFieldValues(req, req.pageSchema, pageData) : req.pageSchema.fields
    const templateFields = await setHbsTemplateDetails(valueAttachedFields)
    req.renderData = {
      recordId: recordId,
      templateFields: templateFields
    }
    // check for a pre render function before we construct the html rows. This gives the pre render a chance to manipulate the data before the rows are generated
    if (req.pageSchema.preFieldsRender) req.pageSchema.preFieldsRender(req, res, next)
    else next()
  } catch (err) {
    next(err)
  }
}

/**
 * Look for individual field defined preSave funcs and run them right before the data is passed to the general schema preSave func
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
exports.runFieldPreSave = async (req, res, next) => {
  try {
    const fields = dataUtils.customKeyArray2Object(req.pageSchema.fields, 'name')
    // check to see if there are any field specific preSave functions
    for (const inputName of Object.keys(req.body)) {
      if (fields[inputName]) {
        const fieldType = fields[inputName].uiFieldType
        if (FIELD_CONTROLLERS[fieldType]) req.body[inputName] = await FIELD_CONTROLLERS[fieldType].fieldPreSave(req.body[inputName])
      }
    }
    next()
  } catch (err) {
    console.error(err)
    next()
  }
}

/**
 * Checks to see if there is a user defined preSave function and modifies the payload accordingly to pass ot the validate function
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
exports.runSchemaPreSave = async (req, res, next) => {
  try {
    // check to see if we have a user defined preSave function, if not just use the original payload
    if (req.pageSchema.preSave) req.pageSchema.preSave(req, res, next)
    else next()
  } catch (err) {
    console.error(err)
    res.json({ control: false, message: 'There was a problem with your request' })
  }
}

/**
 * Checks for a user defined validate function. The validator should reject with a custom error object. See main docs for info.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
exports.validatePostData = async (req, res, next) => {
  try {
    // now run any custom validator, this happens after preSave to ensure you validate your final state data
    if (req.pageSchema.validate) req.pageSchema.validate(req, res, next)
    else next()
  } catch (err) {
    console.error(err)
    res.json({ control: false, message: 'There was a problem validating your request' })
  }
}

/**
 * Save the final processed and validated payload.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
exports.savePayload = async (req, res, next) => {
  try {
    let record
    // new record has no id
    if (req.body.id === '') {
      // TODO: potential refactor - questionable approach to fixing bug
      // delete id from request body in order for insert to work
      delete req.body.id
      record = await DB.insert(req.pageSchema.table, req.body)
    } else await DB.update(req.pageSchema.table, req.body, { id: req.body.id })
    // pass a redirect here so new posts can then be redirected to the edit page with the correct details
    res.json({ control: true, message: 'Record updated', redirect: `${CMS_CONFIG.CMS_ROOT}/${req.pageSchema.route}/${(req.body.id || record.insertId)}` })
  } catch (err) {
    console.error(new Error('PROBLEM UPSERTNG DB RECORD: ' + err))
    res.json({ control: false, message: 'There was a problem with your saving your data' })
  }
}
exports.send404 = send404

function send404 (req, res, next) { res.render('errors/404', { helpers: HBS_HELPERS, layout: 'error-page' }) }

/**
 * Parse out the correct schema from the global schema object
 * @param route
 * @returns {*}
 */
function getCmsPageFromSchema (route) {
  const schema = require(CMS_SCHEMA)
  const pages = dataUtils.customKeyArray2Object(schema.pages, 'route')
  return pages[route]
}

/**
 * Pass our schema through here to filter out table columns for our table view and reset any values that may have been previously set. This will also set any default props not explicitly set up in the schema
 * @param page
 * @returns {Promise<any>}
 */
async function processPageSchema (page) {
  // default the optional template prop to fields, our standard cms view
  page.template = page.template || 'fields'
  page.aboveEdit = page.aboveEdit || null
  page.belowEdit = page.belowEdit || null
  // reset any values that may have been set on this global page object, these are set in later steps. TODO make sure we dont use global page state
  for (const field of page.fields) { field.value = '' }
  return page
}

/**
 * Get the db record for the requested page. Used to populate the field values.
 *
 * There are 3 possibilities here:
 * 1. It is a new record in a page that supports multiple records, in this case send back an empty payload as we have no values.
 * 2. It is a single page, i.e no table view, in this case we send bakc the first record from the table that store the single page
 * 3. It is a record from a multiple record table view page, we send back the data which matches the id of that particular item
 * @param pageId
 * @param pageName
 * @returns {Promise}
 */
// TODO make the page return a 404 if the id does not return a value, e.g posts/1183794932 returns the new post page, this should be a 404
async function getPageRecord (pageId, pageName) {
  if (pageId === 'new') return false
  else if (pageId === false) return DB.findOne(pageName, {})
  else return DB.findOne(pageName, { id: pageId })
}

/**
 * Loop each field and attach its value.
 *
 * This will check for empty data, indicating a new single page view and set the ID accordingly.
 * @param req
 * @param pageDetails
 * @param pageData
 * @returns {Promise}
 */
async function attachFieldValues (req, pageDetails, pageData) {
  for (const field of pageDetails.fields) {
    field.value = pageData[field.name] || ''
    // check for any field pre render funcs
    if (FIELD_CONTROLLERS[field.uiFieldType] && FIELD_CONTROLLERS[field.uiFieldType].preFieldRender) field.value = await FIELD_CONTROLLERS[field.uiFieldType].preFieldRender(field.value, req)
  }
  return pageDetails.fields
}

/**
 * Look for a custom row template and construct the field data to be passed to the row and the field. This will default to _default-row, or hidden if uiFieldType is set to 'hidden'
 * @param fields
 * @returns {Promise<*>}
 */
async function setHbsTemplateDetails (fields) {
  for (const field of fields) {
    if (!field.rowTemplate) field.rowTemplate = 'rows/_default-row'
    if (field.uiFieldType === 'hidden') field.rowTemplate = 'rows/_hidden'
    field.partial = `fields/${field.uiFieldType}/${field.uiFieldType}`
  }
  return fields
}
