exports.schema = {
  route: 'testimonials',
  table: 'testimonials',
  primaryKey: 'id',
  template: 'fields',
  menu: {
    show: true,
    lbl: 'Testimonies',
    icon: 'ion-briefcase' // http://ionicons.com/cheatsheet.html

  },
  preFieldsRender: false,
  preSave: false,
  fields: [
    {
      name: 'id',
      sqlType: 'int',
      sqlDef: 'NOT NULL AUTO_INCREMENT',
      uiFieldType: 'hidden',
      uiLabel: 'Id',
      options: {}
    },
    {
      name: 'logo',
      sqlType: 'VARCHAR',
      sqlDef: '(512)',
      uiFieldType: 'image-gallery',
      uiLabel: 'Logo',
      options: {}
    },
    {
      name: 'quote',
      sqlType: 'TEXT',
      sqlDef: '',
      uiFieldType: 'textarea',
      uiLabel: 'Quote',
      showInTableView: true,
      options: {}
    }
  ]
}
