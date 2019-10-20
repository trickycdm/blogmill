# Blogmill
A Node.js based CMS focused on blog and website data. To get it running first set up all your required schemas then run the command `npm run db:init` this will generate your pages and create a user for you. THIS IS WIP

# Grunt
Both the CMS and site have there own public folders. In order to compile the scss and js correctly simple prefix all partials with an underscore _, grunt will auto detect all files
for js and scss and run all the necessary steps to give you a final main.min.js file and a style.min.css file. You can use es6 syntax in the js and and browser based npm packages.

# CMS
The CMS files live at /cms and are structured as follows:

* components - this is your base partials dir i.e all handlebars includes are served from here, so using {{> some-partial/_some-partial}} will look in components for this file
* layouts - the main layout wrappers, by default it will use main.hbs. This can be overriden by passing a 'layout' prop to any hbs file.
* pages - all pages live here, each page will have its own folder containing the .hbs file an .scss file and a .js file. The JS file should export a router and be added to the main cms router if a new page is created. Grunt will auto detect the .scss file and add it to the style compilation process
* public - all public files live here, i.e css, js and uploaded images and media
* schemas - where your actual page config live, each schema should be linked in the main /cms/schema.js file. This is left manual to give control over the order. More detail on schemas is below. These are the core of the CMS system.
* scss - higher level scss files go here (e.g globals, utilities etc), these are auto detected and added to the style compilation process. Pages and component styles shoudl life in there respective folders. 
* temp - this is where all file uploads go before they are finally saved to there public dir. You should set up a cron job to periodically clear this folder.
* config.json - this contains very basic configs. They can be changed from there default but this feature is untested
* controller.js - this contains the logic for manipulating the schemas. Data passes through here to be processed. 
* pre-loads.js - this will run at app start to set your main configs
* router.js - the main CMS router, you are free to modify this as you see fit. 
* schema.js - this is just a collection of the individual schemas from the schemas folder. You must link them here for them to be loaded. This is left manual to control the order of loading.

## NPM Scripts

* db:init - Will build your initial SQL database, creating all the required tables and columns. It will not create or modify the table if it already exists
* db:update - Will rebuild the tables and columns, this will NOT destroy any existing data.

## Schemas
Each page must be defined in a schema. Is has various mandatory and optional fields.

### Schema Properties
```
route: (String),
table: (String),
primaryKey: (String),
template: (String),
single: (Boolean),
menu: {
    show: (Boolean),
    lbl: (String),
    icon: (String)
},
preSave: (req,res,next)
preFieldsRender: (req,res,next)
validate: (req,res,next)
fields: []
```
* route (mandatory) - the route of the page, i.e route: 'config' would be available at /cms/config
* table (mandatory) - the name of the SQL table. This will be auto created as part of the SQL init function. Remember to use _ underscores in the name e.g my_table NOT my-table
* primaryKey (mandatory) - the id of the field you wish to set as the primary key (see fields for details)
* template (optional: default = 'fields') - the frontend template you wish to use to render the data. By default it will use 'fields'
* single (optional: default = false) - use this flag to create a single page, i.e not table view. By default this will create a single SQL table for the page and index the single entry with an auto generated ID.  
* menu (optional) - if omitted this pages will not be shown in the main menu, can can explicitly define false for show, ans set the display label

### Schema Methods
* preFieldsRender (optional) - this is an express middleware that will take req,res,next. The processed page payload will be available in req.renderData with all value attached fields. You can use this to manipulate the payload any way you wish. If using a custom UI template this will almost
certainly be require in order to manipulate the values yourself. 
* preSave (optional) - this is an express middleware that will take req,res,next. It gives you access to just the the data before it is finally written to the database. Useful if you would like to change or augment it in any way. If there is an error condition it should return res.json({control: false, message: 'Error', error: 'something went wrong'})
* validate (optional) - this is an express middleware that will take req,res,next. It gives you access to just the payload after it has passed through preSave. This gives you a chance to do custom validation on the properties. If there is an error condition it should return res.json({control: false, message: 'Error', error: 'something went wrong'})

### Schema Fields
The fields property in each schema will take an array of field objects.
 
#### Field Properties
```
{
  name: (String),
  sqlType: (String),
  sqlDef: (String),
  rowTemplate: (String),
  uiLabel: (String),
  uiFieldType: (String),
  options: {
    inputType: (String)
    validation: {readonly: true, maxlength: 64, minlength: 8, required: true},
    hash: (Boolean),
    smallText: (String)
  },
  showInTableView: (Boolean),
  preRenderTableCell: (Function: return Promise)
}
```
* name (mandatory) - the name of the field. This is used as the field name for both the SQL column and the ui name attribute
* sqlType (mandatory) - set to false if you would like to exclude the field from the database. Otherwise all standard SQL type are valid here.
* sqlDef (optional, highly recommended if defining an sqlType) - this is the meta description of the field, e.g VARCHAR(255)
* rowTemplate (optional: default = 'rows/_default-row') - this allows you to specify a custom row template to be wrapped around your chosen field. By default this is just another partial, by convention you should put it in the components/rows folder. But it takes a full path from the components root folder so you can use any other folder struc within components
* uiFieldType (optional: default = 'html5', highly recommended) - allows you to specify the handlebars field to use when rendering this field. Fields are in the /cms/views/components/fields dir. You can set to false to omit the render of this field altogether. Handy if the field info is populated elsewhere
* uiLabel (optional: default = null, highly recommended) - set the UI label for this field. Should only be omitted on hidden field types
* options (optional) - used to pass additional data to your chosen field. For example the html5 field type lets you set the input type (text, number, date, color, hidden etc). This data is available in your field under the options prop in handlebars
    * NOTE the validation param of required, can be set to true OR false and it will still apply, this is a quirk of HTML5, to remove it, remove the key altogether
* showInTableView (optional: default = false)

*Note* To make a hidden field set the UIFieldType to hidden, this will automatically use the _hidden.hbs row template.

#### Field Methods
* preRenderTableCell (optional) - Gives you access to the row record id and the cell value before it is assigned. Useful for numerous reasons, for example you may wish to format a date, convert and author id to a real name. etc etc

# Fields
Fields deserve a special mention as they form an important part of the CMS. By default all fields live in there own directory in the main partials dir (components).

You should create all fields in a new directory within /cms/components/fields. Each field needs at least a .hbs file. You can also create an optional controller.js file. Details below.

## HBS file
This will be the HTML that gets rendered as your field, it will receive all the properties specified in the respective schema filed, e.g
```
<input type="{{options.inputType}}" class="form-control" name="{{name}}" id="{{name}}" value="{{value}}" placeholder="{{options.placeholder}}" {{#each options.validation}}{{@key}}="{{this}}"{{/each}}/>
{{#if options.smallText}}
  <small class="form-text text-muted">{{options.smallText}}</small>
{{/if}}
```
The value of each field is automatically attached for you if available. This means all fields are predictable and easy to extend. You can pretty much pass any new props you want in the main field options prop.

## controller.js
This file is WIP but it should export 2 methods:
```
exports.fieldPreSave = async value => {
  console.log('pre save')
  console.log(value)
  return value
}
exports.preFieldRender = (value, req = false) => {
  console.log('pre render')
  console.log(value)
  return value
}
```
The system will auto detect these controller.js files (they must be called controller.js) and load there respective exports.

### preFieldSave
This will run before any other general schema functions. I.e this will receive the field data for manipulation before any other function.

### preFieldRender
This will be passed the individual field data right before it is rendered, i.e it may have passed through other functions before getting here but it is always passed through here before the final render. It is given the optional req object to allow you to extract any info you need for conditional processing on the field. The value prop is what is returned so will be accessible in the hbs under value.

It may be helpful to use the getAnotherFieldInPreFieldRender method in this field func as you may need data from other fields.
