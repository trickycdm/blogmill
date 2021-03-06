exports.schema = {
  route: 'page-posts',
  table: 'page_posts',
  single: true,
  primaryKey: 'id',
  template: 'fields',
  menu: {
    show: true,
    lbl: 'Posts',
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
      rowData: { title: 'Header', subtitle: 'This will be the header for your posts page, and is the first thing customers will see' },
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
    }
  ]
}
