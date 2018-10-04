const dataUtils = require('data-utils')
const bm = require('bm')
const moment = require('moment')
const slug = require('slug')

exports.schema = {
  route: 'posts',
  table: 'posts',
  primaryKey: 'id',
  template: 'post',
  menu: {
    show: true,
    lbl: 'Posts',
    icon: 'ion-ios-chatboxes-outline'
  },
  preSave: async (req, res, next) => {
    try {
      // check to see if this is a new page and set the publish date
      if (req.body.id === '') req.body.publish_date = new Date()
      req.body.last_modified_date = new Date()
      // generate our slug for this post
      req.body.permalink_slug = slug(req.body.title, {lower: true})
      req.body.tags = req.body.tags ? JSON.stringify(req.body.tags) : ''
      next()
    } catch (err) {
      console.error(err)
      res.json({control: false, message: 'There was a problem with your request'})
    }
  },
  validate: async (req, res, next) => {
    try {
      if (!req.body.title) return res.json({control: false, message: 'Not title', error: 'Please add at least a title'})
      if (await bm.isSlugInUse(req.body.id, req.body.permalink_slug, 'posts')) return res.json({control: false, message: 'Title in use', error: 'Please use another title'})
      else next()
    } catch (err) {
      console.error(err)
      return res.json({control: false, message: 'Sorry', error: 'Something went wrong on our side. Please try again or get in touch directly.'})
    }
  },
  preFieldsRender: async (req, res, next) => {
    try {
      let fields = dataUtils.customKeyArray2Object(req.renderData.templateFields, 'name')
      let isNewPage = !fields.title.value // if this value exists it is not a new page
      let author = fields.author_id.value ? await bm.getAuthorById(fields.author_id.value) : false
      fields.status.value = fields.status.value || 'new'
      req.renderData.status = fields.status.value
      req.renderData.pageTitle = isNewPage ? 'New Post' : 'Edit post'
      req.renderData.sidebar = {
        widgets: [
          bm.buildMetaInfoWidget(isNewPage, fields.status.value, fields.publish_date.value, fields.last_modified_date.value, author),
          await bm.buildFeatureImageWidget(fields.feature_image.value),
          await bm.buildCategoryWidget(fields.category.value),
          // await bm.buildTagsWidget(fields.tags.value),
          await bm.buildAuthorWidget(fields.author_id.value)
        ]
      }
      next()
    } catch (err) {
      next(err)
    }
  },
  fields: [
    {
      name: 'id',
      sqlType: 'INT',
      sqlDef: 'NOT NULL AUTO_INCREMENT',
      uiFieldType: 'hidden',
      uiLabel: '',
      options: {inputType: 'number'},
      showInTableView: true
    },
    {
      name: 'title',
      sqlType: 'TEXT',
      sqlDef: '',
      rowTemplate: 'rows/_full-width',
      uiFieldType: 'html5',
      uiLabel: 'Title',
      options: {validation: {required: true}},
      showInTableView: true
    },
    {
      name: 'permalink_slug',
      sqlType: 'VARCHAR',
      sqlDef: '(255)',
      rowTemplate: 'rows/_hidden',
      uiFieldType: 'permalink',
      uiLabel: 'Permalink',
      options: {}
    },
    {
      name: 'content',
      sqlType: 'LONGTEXT',
      sqlDef: '',
      rowTemplate: 'rows/_full-width',
      uiFieldType: 'tinymce',
      uiLabel: 'Content',
      options: {}
    },
    {
      name: 'excerpt',
      sqlType: 'LONGTEXT',
      sqlDef: '',
      rowTemplate: 'rows/_full-width',
      uiFieldType: 'textarea',
      uiLabel: 'Excerpt',
      options: {}
    },
    {
      name: 'og_title',
      sqlType: 'TEXT',
      sqlDef: '',
      rowTemplate: 'rows/_row-data',
      rowData: {title: 'Open Graph Metadata', subtitle: 'Check https://developers.facebook.com/tools/debug/ to debug these options'},
      uiFieldType: 'html5',
      uiLabel: 'Title',
      options: {inputType: 'string'}
    },
    {
      name: 'og_desc',
      sqlType: 'TEXT',
      sqlDef: '',
      uiFieldType: 'html5',
      uiLabel: 'Description',
      options: {inputType: 'string'}
    },
    {
      name: 'og_image',
      sqlType: 'TEXT',
      sqlDef: '',
      uiFieldType: 'image-gallery',
      uiLabel: 'Default image',
      options: {inputType: 'string', smallText: 'Must be 1200x630 pixels'}
    },
    {
      name: 'category',
      sqlType: 'INT',
      sqlDef: '',
      uiFieldType: false,
      uiLabel: 'Category',
      options: {},
      showInTableView: true,
      preRenderTableCell: async (recordId, value) => bm.getCategoryNameById(value)
    },
    {
      name: 'author_id',
      sqlType: 'BIGINT',
      sqlDef: '',
      uiFieldType: false,
      uiLabel: 'Author',
      options: {},
      showInTableView: true,
      preRenderTableCell: async (recordId, value) => {
        let author = await bm.getAuthorById(value)
        return author ? author.real_name : 'No Author'
      }
    },
    {
      name: 'tags',
      sqlType: 'TEXT',
      sqlDef: '',
      uiFieldType: false,
      options: {}
    },
    {
      name: 'last_modified_date',
      sqlType: 'DATETIME',
      sqlDef: '',
      uiFieldType: false,
      options: {inputType: 'date'}
    },
    {
      name: 'publish_date',
      sqlType: 'DATETIME',
      sqlDef: '',
      uiFieldType: false,
      uiLabel: 'Publish Date',
      options: {inputType: 'date'},
      showInTableView: true,
      preRenderTableCell: (recordId, value) => moment(value).format('DD/MM/YYYY')
    },
    {
      name: 'status',
      sqlType: 'text',
      sqlDef: '',
      uiFieldType: 'hidden',
      uiLabel: 'Status',
      options: {},
      showInTableView: true
    },
    {
      name: 'feature_image',
      sqlType: 'INT',
      sqlDef: '',
      uiFieldType: false,
      uiLabel: 'Feature Image',
      options: {},
      showInTableView: true,
      preRenderTableCell: async (recordId, value) => {
        // Not all cell will have on image set
        if (value) {
          const mediaObj = await bm.getMediaObjectById(value)
          if (mediaObj && 'file_name' in mediaObj) return `<img src="${CMS_CONFIG.RELATIVE_IMG_UPLOADS_DIR}/${mediaObj.file_name}" class="table-cell__img">`
          else return 'No Image Set'
        }
        return 'No Image Set'
      }
    }
  ]
}
