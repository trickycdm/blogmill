const bm = require('bm')

exports.fieldPreSave = async value => {
  return value
}
exports.preFieldRender = async value => { return {mediaId: value, mediaPreview: await bm.getMediaUrlFromId(value)} }
