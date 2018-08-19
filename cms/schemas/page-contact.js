exports.schema = {
  route: 'page-contact',
  table: 'page_contact',
  single: true,
  primaryKey: 'id',
  template: 'fields',
  menu: {
    show: true,
    lbl: 'Contact',
    icon: 'ion-android-mail'// http://ionicons.com/cheatsheet.html

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
      name: 'description',
      sqlType: 'TEXT',
      sqlDef: '',
      rowTemplate: 'rows/_row-data',
      rowData: {title: 'Contact', subtitle: 'This is the main section of your contact page'},
      uiFieldType: 'textarea',
      uiLabel: 'Description',
      options: {}
    },
    {
      name: 'header_title',
      sqlType: 'varchar',
      sqlDef: '(255)',
      rowTemplate: 'rows/_row-data',
      rowData: {title: 'Header', subtitle: 'This will be the header for your Contact page, and is the first thing customers will see'},
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
      uiLabel: 'Header Image',
      options: {}
    }
  ]
}
