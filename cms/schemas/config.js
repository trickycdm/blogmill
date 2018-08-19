exports.schema = {
  route: 'config',
  table: 'config',
  single: true,
  primaryKey: 'id',
  template: 'fields',
  menu: {
    show: true,
    lbl: 'Config',
    icon: 'ion-gear-a'

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
      name: 'maintenance_mode',
      sqlType: 'VARCHAR',
      sqlDef: '(255)',
      uiFieldType: 'select',
      uiLabel: 'Maintenance Mode',
      options: {selectOptions: [{value: 'enabled', label: 'Enabled'}, {value: 'disabled', label: 'Disabled'}]}
    },
    {
      name: 'site_name',
      sqlType: 'VARCHAR',
      sqlDef: '(255)',
      uiFieldType: 'html5',
      uiLabel: 'Site name',
      options: {inputType: 'string'}
    },
    {
      name: 'meta_description',
      sqlType: 'TEXT',
      sqlDef: '',
      uiFieldType: 'textarea',
      uiLabel: 'Meta description',
      options: {}
    },
    {
      name: 'site_logo',
      sqlType: 'VARCHAR',
      sqlDef: '(512)',
      uiFieldType: 'image-gallery',
      uiLabel: 'Site logo',
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
    }
  ]
}
