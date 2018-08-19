exports.schema = {
  route: 'page-services',
  table: 'page_services',
  single: true,
  primaryKey: 'id',
  template: 'fields',
  menu: {
    show: true,
    lbl: 'Services',
    icon: 'ion-information' // http://ionicons.com/cheatsheet.html

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
      name: 'header_title',
      sqlType: 'varchar',
      sqlDef: '(255)',
      rowTemplate: 'rows/_row-data',
      rowData: {title: 'Header', subtitle: 'This will be the header for your services page, and is the first thing customers will see'},
      uiFieldType: 'html5',
      uiLabel: 'Title',
      options: {}
    },
    {
      name: 'header_subtitle',
      sqlType: 'varchar',
      sqlDef: '(255)',
      uiFieldType: 'html5',
      uiLabel: 'Subtitle',
      options: {}
    },
    {
      name: 'header_image',
      sqlType: 'VARCHAR',
      sqlDef: '(512)',
      uiFieldType: 'image-gallery',
      uiLabel: 'Image',
      options: {}
    },
    {
      name: 'description',
      sqlType: 'TEXT',
      sqlDef: '',
      rowTemplate: 'rows/_row-data',
      rowData: {title: 'Services', subtitle: 'This is the main section of your page, individual services can be created under the "global" menu item'},
      uiFieldType: 'textarea',
      uiLabel: 'Description',
      options: {}
    }
  ]
}
