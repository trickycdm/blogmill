const router = require('express').Router()
const bm = require('bm')

module.exports = router

router.get('/get-all-images', async (req, res, next) => {
  try {
    let data = {
      media: await bm.getAllMediaItems(),
      basePath: CMS_CONFIG.RELATIVE_IMG_UPLOADS_DIR
    }
    res.json({control: true, data: data})
  } catch (err) {
    console.error(err)
    // set 500 to let the calling side catch the error
    res.status(500)
    res.json({err: err})
  }
})

router.get('/media/:id', async (req, res, next) => {
  try {
    if (!req.params.id) return res.sendFile(`${_root}/${CMS_CONFIG.CMS_ROOT}/${CMS_CONFIG.DEFAULT_IMG_PATH}`)
    const mediaObj = await bm.getMediaObjectById(req.params.id)
    // If nothing is returned, show a default image, if not show the image associated with the requested id
    if (!mediaObj) res.sendFile(`${_root}/${CMS_CONFIG.CMS_ROOT}/${CMS_CONFIG.DEFAULT_IMG_PATH}`)
    else res.sendFile(`${_root}/${CMS_CONFIG.RELATIVE_IMG_UPLOADS_DIR}/${mediaObj.file_name}`)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

router.get('/media', async (req, res, next) => {
  return res.sendFile(`${_root}/${CMS_CONFIG.CMS_ROOT}/${CMS_CONFIG.DEFAULT_IMG_PATH}`)
})
