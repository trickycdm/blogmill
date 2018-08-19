const slug = require('slug')
exports.schema = {
  route: 'post-categories',
  table: 'post_categories',
  primaryKey: 'id',
  template: 'fields',
  preSave: (req, res, next) => {
    try {
      req.body.slug = slug(req.body.name, {lower: true})
      next()
    } catch (err) {
      console.error(err)
      res.json({control: false, message: 'Could not save category at this time.'})
    }
  },
  menu: {
    show: true,
    lbl: 'Post Categories',
    icon: 'ion-ios-pricetags-outline'
  },
  fields: [
    {
      name: 'id',
      sqlType: 'INT',
      sqlDef: 'NOT NULL AUTO_INCREMENT',
      uiFieldType: 'html5',
      uiLabel: 'Id',
      options: {validation: {readonly: true}, inputType: 'number'},
      showInTableView: true
    },
    {
      name: 'name',
      sqlType: 'TEXT',
      sqlDef: '',
      uiFieldType: 'html5',
      uiLabel: 'name',
      options: {},
      showInTableView: true
    },
    {
      name: 'slug',
      sqlType: 'VARCHAR',
      sqlDef: '(255)',
      uiFieldType: 'html5',
      uiLabel: 'Slug',
      options: {validation: {readonly: true}},
      showInTableView: true
    }
  ]
}
