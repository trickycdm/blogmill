exports.schema = {
  route: 'services',
  table: 'services',
  primaryKey: 'id',
  template: 'fields',
  menu: {
    show: true,
    lbl: 'Services',
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
      name: 'name',
      sqlType: 'VARCHAR',
      sqlDef: '(255)',
      uiFieldType: 'html5',
      uiLabel: 'Name',
      showInTableView: true,
      options: {inputType: 'string'}
    },
    {
      name: 'description',
      sqlType: 'TEXT',
      sqlDef: '',
      uiFieldType: 'textarea',
      uiLabel: 'Description',
      options: {inputType: 'string'}
    },
    {
      name: 'extract',
      sqlType: 'TEXT',
      sqlDef: '',
      uiFieldType: 'textarea',
      uiLabel: 'Extract',
      showInTableView: true,
      options: {inputType: 'string'}
    },
    {
      name: 'image_wide',
      sqlType: 'VARCHAR',
      sqlDef: '(512)',
      uiFieldType: 'image-gallery',
      uiLabel: 'Wide Image',
      options: {}
    },
    {
      name: 'image_square',
      sqlType: 'VARCHAR',
      sqlDef: '(512)',
      uiFieldType: 'image-gallery',
      uiLabel: 'Square Image',
      options: {}
    }
  ]
}
