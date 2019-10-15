const bm = require('bm')

exports.schema = {
  route: 'media',
  table: 'media',
  primaryKey: 'id',
  template: 'media',
  menu: {
    show: true,
    lbl: 'Media',
    icon: 'ion-images'
  },
  preFieldsRender: async (req, res, next) => {
    try {
      // only modify the data if this is an existing record
      if (req.renderData.recordId) {
        let fileName = ''
        for (const field of req.renderData.templateFields) if (field.name === 'file_name') fileName = field.value
        for (const field of req.renderData.templateFields) if (field.name === 'image') field.mediaPreview = `${CMS_CONFIG.RELATIVE_IMG_UPLOADS_DIR}/${fileName}`
        for (const field of req.renderData.templateFields) if (field.name === 'id' && field.value) req.renderData.existingRecord = true
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
      uiFieldType: 'html5',
      uiLabel: 'Id',
      options: { validation: { readonly: true }, inputType: 'number' },
      showInTableView: true
    },
    {
      name: 'name',
      sqlType: 'TEXT',
      sqlDef: '',
      uiFieldType: 'html5',
      uiLabel: 'Name',
      options: { inputType: 'text' },
      showInTableView: true
    },
    // this field is not in the DB
    {
      name: 'image',
      sqlType: false,
      sqlDef: '',
      uiFieldType: 'image-upload',
      uiLabel: 'Image',
      options: { inputType: 'text' },
      showInTableView: true,
      preRenderTableCell: async (recordId, value) => {
        const mediaObj = await bm.getMediaObjectById(recordId)
        value = `<img class="table-img-preview table-cell__img" src="${CMS_CONFIG.RELATIVE_IMG_UPLOADS_DIR}/${mediaObj.file_name}" alt="${mediaObj.alt}">`
        return value
      }
    },
    {
      name: 'file_name',
      sqlType: 'TEXT',
      sqlDef: '',
      uiFieldType: 'html5',
      uiLabel: 'Filename',
      options: { validation: { readonly: true }, inputType: 'text' },
      showInTableView: true
    },
    {
      name: 'alt',
      sqlType: 'TEXT',
      sqlDef: '',
      uiFieldType: 'html5',
      uiLabel: 'Alt',
      options: { inputType: 'text' },
      showInTableView: true
    }
  ]
}
