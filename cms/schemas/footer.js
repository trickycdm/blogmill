exports.schema = {
  route: 'footer',
  table: 'footer',
  single: true,
  primaryKey: 'id',
  template: 'fields',
  menu: {
    show: true,
    lbl: 'Footer',
    icon: 'ion-arrow-down-b' // http://ionicons.com/cheatsheet.html

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
      rowTemplate: 'rows/_row-data',
      rowData: { title: 'Footer', subtitle: 'This section should be filled with your contact details, and will be displayed at the bottom of every page' },
      uiFieldType: 'html5',
      uiLabel: 'Name',
      options: { inputType: 'string' }
    },
    {
      name: 'description',
      sqlType: 'VARCHAR',
      sqlDef: '(255)',
      uiFieldType: 'html5',
      uiLabel: 'Description',
      options: { inputType: 'string' }
    },
    {
      name: 'tel',
      sqlType: 'VARCHAR',
      sqlDef: '(255)',
      uiFieldType: 'html5',
      uiLabel: 'Telephone',
      options: { inputType: 'string' }
    },
    {
      name: 'email',
      sqlType: 'VARCHAR',
      sqlDef: '(255)',
      uiFieldType: 'html5',
      uiLabel: 'Email',
      options: { inputType: 'string' }
    },
    {
      name: 'background_image',
      sqlType: 'VARCHAR',
      sqlDef: '(512)',
      uiFieldType: 'image-gallery',
      uiLabel: 'Background Image',
      options: {}
    }
  ]
}
