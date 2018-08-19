const auth = require('auth')

exports.schema = {
  route: 'users',
  table: 'users',
  primaryKey: 'id',
  menu: {
    show: true,
    lbl: 'Users',
    icon: 'ion-ios-people-outline'
  },
  preFieldsRender: async (req, res, next) => {
    try {
      // set the pw value to a default value we can check for later to figure out if it has been changed
      req.renderData.templateFields = req.renderData.templateFields.map(field => {
        if (field.name === 'pw') field.value = 'redacted-pw'
        return field
      })
      next()
    } catch (err) {
      next(err)
    }
  },
  preSave: async (req, res, next) => {
    try {
      if (req.body.pw === 'redacted-pw') delete req.body.pw
      else if (req.body.pw) req.body.pw = await auth.hash(req.body.pw)
      next()
    } catch (err) {
      console.error(err)
      res.json({control: false, message: 'There was a problem with your request'})
    }
  },
  fields: [
    {
      name: 'id',
      sqlType: 'int',
      sqlDef: 'NOT NULL AUTO_INCREMENT',
      uiFieldType: 'html5',
      uiLabel: 'Id',
      options: {inputType: 'number', validation: {readonly: true}},
      showInTableView: true
    },
    {
      name: 'username',
      sqlType: 'VARCHAR',
      sqlDef: '(255)',
      uiFieldType: 'html5',
      uiLabel: 'Username',
      options: {validation: {required: true}},
      showInTableView: true
    },
    {
      name: 'real_name',
      sqlType: 'VARCHAR',
      sqlDef: '(255)',
      uiFieldType: 'html5',
      uiLabel: 'Real name',
      options: {validation: {required: true}},
      showInTableView: true
    },
    {
      name: 'pw',
      sqlType: 'VARCHAR',
      sqlDef: '(255)',
      uiFieldType: 'password',
      uiLabel: 'Password',
      options: {inputType: 'password', smallText: 'Leave unless changing', validation: {required: true, minlength: 8}},
      showInTableView: false
    },
    {
      name: 'avatar',
      sqlType: 'VARCHAR',
      sqlDef: '(512)',
      uiFieldType: 'image-gallery',
      uiLabel: 'Avatar',
      options: {}
    }
  ]
}
