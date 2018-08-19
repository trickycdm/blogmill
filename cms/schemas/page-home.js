exports.schema = {
  route: 'page-home',
  table: 'page_home',
  single: true,
  primaryKey: 'id',
  template: 'fields',
  menu: {
    show: true,
    lbl: 'Homepage',
    icon: 'ion-android-home' // http://ionicons.com/cheatsheet.html

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
      rowData: {title: 'Header', subtitle: 'This will be the header for your homepage, and is the first thing customers will see'},
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
      name: 'header_image_1',
      sqlType: 'VARCHAR',
      sqlDef: '(512)',
      uiFieldType: 'image-gallery',
      uiLabel: 'Image One',
      options: {}
    },
    {
      name: 'header_image_2',
      sqlType: 'VARCHAR',
      sqlDef: '(512)',
      uiFieldType: 'image-gallery',
      uiLabel: 'Image Two',
      options: {}
    },
    {
      name: 'header_image_3',
      sqlType: 'VARCHAR',
      sqlDef: '(512)',
      uiFieldType: 'image-gallery',
      uiLabel: 'Image Three',
      options: {}
    },
    {
      name: 'quote_text',
      sqlType: 'TEXT',
      sqlDef: '',
      rowTemplate: 'rows/_row-data',
      rowData: {title: 'Quote Area', subtitle: 'This quote will be boldly presented on your hompeage as a statement of who you are'},
      uiFieldType: 'textarea',
      uiLabel: 'Quote',
      options: {}
    },
    {
      name: 'services_description',
      sqlType: 'TEXT',
      sqlDef: '',
      rowTemplate: 'rows/_row-data',
      rowData: {title: 'Services', subtitle: 'Give an overall description of your services, individual services can be configured under the "globals" menu item'},
      uiFieldType: 'textarea',
      uiLabel: 'Description',
      options: {}
    },
    {
      name: 'in_motion_description',
      sqlType: 'TEXT',
      sqlDef: '',
      rowTemplate: 'rows/_row-data',
      rowData: {title: 'In Motion', subtitle: 'This is a chance to demonstrate your business using dynamic content, the "video" inputs should contain youtube links to your content'},
      uiFieldType: 'textarea',
      uiLabel: 'Description',
      options: {}
    },
    {
      name: 'in_motion_video_1',
      sqlType: 'VARCHAR',
      sqlDef: '(255)',
      uiFieldType: 'html5',
      uiLabel: 'Video One',
      options: {inputType: 'url'}
    },
    {
      name: 'in_motion_video_2',
      sqlType: 'VARCHAR',
      sqlDef: '(255)',
      uiFieldType: 'html5',
      uiLabel: 'Video Two',
      options: {inputType: 'url'}
    }
  ]
}
