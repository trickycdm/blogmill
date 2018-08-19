/**
 * A selection of Blogmill utility functions.
 */
const moment = require('moment')

let self = module.exports = {
  getConfig: async () => _db.findOne('config', {}),
  getPageByPermalinkSlug: async permalinkSlug => _db.findOne('pages', {permalink_slug: permalinkSlug}),
  getPostByPermalinkSlug: async permalinkSlug => _db.findOne('posts', {permalink_slug: permalinkSlug}),
  getContentTypeById: async (type, id) => _db.findOne(type, {id: id}),
  getHomepage: async () => _db.findOne('page_home', {}),
  getPosts: async () => _db.find('posts', {}),
  getAllPosts: async (limit = 0) => {
    try {
      let posts = (await _db.find('posts', {}))
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
  getCategories: async () => _db.find('post_categories', {}),
  getCategoryNameById: async catId => {
    const cat = await _db.findOne('post_categories', {id: catId})
    return cat ? cat.name : 'none'
  },
  getUsers: async () => _db.find('users', {}),
  getUserById: async id => _db.findOne('users', {id: id}),
  getAuthorById: async id => _db.findOne('users', {id: id}),
  isSlugInUse: async (id, slug, table) => {
    let results
    if (id) results = await _db.rawSql(`Select * from ${table} WHERE (permalink_slug=${_db.escape(slug)}) and (id != ${_db.escape(parseInt(id, 10))}) limit 1`)
    else results = await _db.rawSql(`Select * from ${table}  WHERE (permalink_slug='${slug}') limit 1`)
    return results.length > 0
  },
  getAllMediaItems: async () => _db.find('media', {}),
  getMediaObjectById: async id => _db.findOne('media', {id: id}),
  getMediaUrlFromId: async id => {
    const mediaObj = await _db.findOne('media', {id: id})
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
    let users = await self.getUsers()
    return {partial: 'meta-boxes/author/_author', data: {users: users, author: authorId}}
  },
  buildFeatureImageWidget: async featureImageId => {
    const featureImage = await self.getMediaObjectById(featureImageId)
    const featureImagePreview = featureImage ? `${CMS_CONFIG.RELATIVE_IMG_UPLOADS_DIR}/${featureImage.file_name}` : ''
    return {
      partial: 'meta-boxes/feature-image/_feature-image',
      data: {featureImagePreview: featureImagePreview, featureImageId: featureImageId}
    }
  },
  buildCategoryWidget: async selectedCat => {
    let cats = await self.getCategories()
    cats = cats.map(cat => {
      cat.isChecked = cat.id === selectedCat
      return cat
    })
    return {partial: 'meta-boxes/category/_category', data: {cats: cats}}
  },
  buildTagsWidget: async (tags) => {
    tags = tags ? JSON.parse(tags) : []
    return {partial: 'meta-boxes/tags/_tags', data: {tags: tags}}
  }
}
