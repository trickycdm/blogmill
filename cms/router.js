const router = require('express').Router()
const uuidv4 = require('uuid/v4')
const multer = require('multer')
const path = require('path')
const auth = require('auth')
const tableView = require(`${ROOT}/cms/pages/table/router`)
const cmsController = require(`${ROOT}/cms/controller`)
const fs = require('fs-extra')

module.exports = router

// Set up our CMS view engine
router.use((req, res, next) => {
  try {
    // set up global locals
    res.locals.permalinkBaseUrl = `${req.protocol}://${req.get('host')}/`
    res.locals.sideNav = { mainLinks: CMS_MENU }
    res.locals.CMS_ROOT = CMS_CONFIG.CMS_ROOT
    res.locals.helpers = HBS_HELPERS
    // set the correct layout to avoid handlebars multi name collision
    res.locals.layout = 'cms'
    next()
  } catch (err) { next(err) }
})

// manual routes to each page, lets delegate out the actual page logic to its own controller
router.use('/login', require(`${ROOT}/cms/pages/login/router`))
// add the route of user logout
router.use('/logout', require('auth').logout)
// redirect if hitting the base cms url
router.get('/', (req, res, next) => res.redirect(`${CMS_CONFIG.CMS_ROOT}/${CMS_CONFIG.CMS_HOME}`))

/******************************************************************************************
 * AUTHENTICATED ROUTES - ALL ROUTES AFTER THIS MESSAGE REQUIRED THE USER TO BE LOGGED IN *
 *****************************************************************************************/
/**
 * Handle file uploads.
 *
 * destination point the temp file uploads to the correct dir
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, PUBLIC_UPLOAD_PATH) },
  filename: function (req, file, cb) { cb(null, `${uuidv4()}${path.extname(file.originalname)}`) }
})
const upload = multer({ storage: storage })
router.post('/image-upload', auth.validateJwt, upload.single('file'), async (req, res, next) => {
  const record = await DB.insert('media', {
    name: req.body.name.split('.')[0],
    file_name: req.file.filename,
    alt: ''
  })
  const resp = {
    fileName: req.file.filename,
    originalName: req.body.name,
    previewLocation: `/api/media/${record.insertId}`,
    recordId: record.insertId
  }
  res.json(resp)
})

router.post('/image-upload/:id', auth.validateJwt, upload.single('file'), async (req, res, next) => {
  try {
    const record = await DB.findOne('media', { id: req.params.id })
    await DB.update('media', { file_name: req.file.filename }, { id: req.params.id })
    await fs.remove(`${PUBLIC_UPLOAD_PATH}/${record.file_name}`)
    const resp = {
      fileName: req.file.filename,
      originalName: req.body.name,
      previewLocation: `/api/media/${req.params.id}`,
      recordId: req.params.id
    }
    res.json(resp)
  } catch (err) {
    console.error(err)
    res.json({ control: false, message: 'There was a problem with your request' })
  }
})

/**
 * This route will match on either a table view OR a single page view.
 */
router.get('/:page', auth.validateJwt, cmsController.getCmsPageModel, tableView.controller, cmsController.getFieldsRenderData, async (req, res, next) => {
  try {
    res.render(`${req.pageSchema.template}/${req.pageSchema.template}`, req.renderData)
  } catch (err) { next(err) }
})

/**
 * This will only match in a multiple record page, i.e one that is proceeded by a table view
 */
router.get('/:page/:id', auth.validateJwt, cmsController.getCmsPageModel, cmsController.getFieldsRenderData, async (req, res, next) => {
  try {
    res.render(`${req.pageSchema.template}/${req.pageSchema.template}`, req.renderData)
  } catch (err) { next(err) }
})

/**
 * Handle single page CMS submissions, i.e those not supporting a table view
 */
router.post('/:page', auth.validateJwt, cmsController.getCmsPageModel, cmsController.runFieldPreSave, cmsController.runSchemaPreSave, cmsController.validatePostData, cmsController.savePayload)

/**
 * Handle a regular table view item form submission.
 */
router.post('/:page/:id', auth.validateJwt, cmsController.getCmsPageModel, cmsController.runFieldPreSave, cmsController.runSchemaPreSave, cmsController.validatePostData, cmsController.savePayload)

/**
 * Delete multiple records from the table view page
 */
router.delete('/:page', auth.validateJwt, async (req, res, next) => {
  try {
    for (const record of req.body) await DB.delete(record.tableName, { id: record.id })
    res.json({ control: true, message: 'Record(s) deleted' })
  } catch (err) {
    res.json({ control: false, message: 'Sorry there was a problem with your request' })
  }
})

/******************************************************************************************
 * END AUTHENTICATED ROUTES                                                               *
 *****************************************************************************************/

/**
 * 404 handler. If we get here with no error no route has matched.
 */
router.use(cmsController.send404)

/**
 * ERRORS router error handling middleware MUST come last
 */
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
