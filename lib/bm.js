/**
 * A selection of Blogmill utility functions.
 */
const moment = require('moment')
const rp = require('request-promise')
const self = module.exports = {
  getConfig: async () => DB.findOne('config', {}),
  getPageByPermalinkSlug: async permalinkSlug => DB.findOne('pages', { permalink_slug: permalinkSlug }),
  getPostByPermalinkSlug: async permalinkSlug => DB.findOne('posts', { permalink_slug: permalinkSlug }),
  getContentTypeById: async (type, id) => DB.findOne(type, { id: id }),
  getHomepage: async () => DB.findOne('page_home', {}),
  getPosts: async () => DB.find('posts', {}),
  getAllPosts: async (limit = 0) => {
    try {
      const posts = (await DB.find('posts', {}))
        .filter(post => post.status === 'published')
        .sort((a, b) => {
          a = new Date(a.publish_date)
          b = new Date(b.publish_date)
          return a > b ? -1 : a < b ? 1 : 0
        })
      return (limit === 0) ? posts : posts.slice(0, limit)
    } catch (err) {
      console.log(err)
      return {}
    }
  },
  getCategories: async () => DB.find('post_categories', {}),
  getCategoryNameById: async catId => {
    const cat = await DB.findOne('post_categories', { id: catId })
    return cat ? cat.name : 'none'
  },
  getUsers: async () => DB.find('users', {}),
  getUserById: async id => DB.findOne('users', { id: id }),
  getAuthorById: async id => DB.findOne('users', { id: id }),
  isSlugInUse: async (id, slug, table) => {
    let results
    if (id) results = await DB.rawSql(`Select * from ${table} WHERE (permalink_slug=${DB.escape(slug)}) and (id != ${DB.escape(parseInt(id, 10))}) limit 1`)
    else results = await DB.rawSql(`Select * from ${table}  WHERE (permalink_slug='${slug}') limit 1`)
    return results.length > 0
  },
  getAllMediaItems: async () => DB.find('media', {}),
  getMediaObjectById: async id => DB.findOne('media', { id: id }),
  getMediaUrlFromId: async id => {
    const mediaObj = await DB.findOne('media', { id: id })
    if (mediaObj && 'file_name' in mediaObj) return `${CMS_CONFIG.RELATIVE_IMG_UPLOADS_DIR}/${mediaObj.file_name}`
    else return null
  },
  buildMetaInfoWidget: (isNewPage, status, publishDate, lastModified) => {
    return {
      partial: 'meta-boxes/content-info/_content-info',
      data: {
        contentInfo: {
          status: status,
          publish_date: publishDate ? moment(publishDate).format('DD/MM/YY, HH:mm') : false,
          last_modified_date: lastModified ? moment(lastModified).format('DD/MM/YY, HH:mm') : false,
          submitBtnLbl: isNewPage ? 'Publish' : 'Update',
          draftBtnLbl: 'Save draft'
        }
      }
    }
  },
  buildAuthorWidget: async authorId => {
    const users = await self.getUsers()
    return { partial: 'meta-boxes/author/_author', data: { users, author: authorId } }
  },
  buildFeatureImageWidget: async featureImageId => {
    const featureImage = await self.getMediaObjectById(featureImageId)
    const featureImagePreview = featureImage ? `${CMS_CONFIG.RELATIVE_IMG_UPLOADS_DIR}/${featureImage.file_name}` : ''
    return {
      partial: 'meta-boxes/feature-image/_feature-image',
      data: { featureImagePreview: featureImagePreview, featureImageId: featureImageId }
    }
  },
  buildCategoryWidget: async selectedCat => {
    let cats = await self.getCategories()
    cats = cats.map(cat => {
      cat.isChecked = cat.id === selectedCat
      return cat
    })
    return { partial: 'meta-boxes/category/_category', data: { cats: cats } }
  },
  buildTagsWidget: async (tags) => {
    tags = tags ? JSON.parse(tags) : []
    return { partial: 'meta-boxes/tags/_tags', data: { tags: tags } }
  },
  /**
   * Send a request to Google to verify our recaptcha. NOTE this must be sent with the query string in the URL, it does not work sending the params as a standard post request.
   * @param value
   * @returns {Promise<*>}
   */
  reCaptchaVerify: async value => {
    try {
      const options = {
        method: 'POST',
        uri: `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${value}`,
        json: true
      }
      const resp = await rp(options)
      return resp.success
    } catch (err) {
      console.log(err)
      return false
    }
  }
}
