const db = require('./db')
const auth = require('./auth')
const schema = require(`${ROOT}/cms/schema`)
const tables = []

for (const page of schema.pages) {
  const table = { db: process.env.DB_NAME, name: page.table }
  const fields = []
  for (const field of page.fields) {
    // only add fields that have a definition, not all fields will be required in the DB. e.g image upload files.
    if (field.sqlType !== false) {
      // add a space if there is a sqlDef otherwise we end up with odd syntax, not essential, only include this if you want nicer SQL
      field.sqlDef = field.sqlDef ? ` ${field.sqlDef}` : ''
      fields.push(`${field.name} ${field.sqlType}${field.sqlDef}`)
    }
  }
  table.rawFields = page.fields
  table.fields = `(${fields.join(', ')}, PRIMARY KEY (${page.primaryKey}))`
  tables.push(table)
}

module.exports = {
  initDb: async () => {
    await createTables()
    await addTempCmsUser()
    console.log('SQL database initialised. You can now run your app normally.')
    process.exit()
  },
  updateColumns: async () => {
    try {
      for (const table of tables) {
        for (const column of table.rawFields) console.log(await db.updateTableColumn(table.db, table.name, column))
      }
      console.log('SQL database updated with new columns. You can now run your app normally.')
      process.exit()
    } catch (err) {
      console.error(err)
    }
  }
}

async function createTables () {
  await Promise.all(tables.map(async (table) => {
    try {
      console.log(await db.createTable(table.db, table.name, table.fields))
    } catch (err) {
      console.error(err)
    }
  }))
}

async function addTempCmsUser () {
  try {
    // const tempPw = auth.randString();
    const tempPw = 'password'
    const hashedPw = await auth.hash(tempPw)
    const admin = { real_name: 'Admin', username: 'admin', pw: hashedPw }
    await db.upsert('users', admin, { username: 'admin' })
    console.log(`TEMP CMS USER CREATED - USERNAME: admin, password: ${tempPw}`)
  } catch (err) {
    console.error(err)
  }
}
