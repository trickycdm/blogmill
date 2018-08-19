const mysql = require('promise-mysql')
let connection

let self = module.exports = {
  connect: async () => {
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      })
    } catch (err) {
      console.error('error connecting: ' + err.stack) && process.exit(1)
    }
  },
  escape: str => connection.escape(str),
  rawSql: query => connection.query(query),
  find: (tableName, find) => connection.query(`Select * from ${tableName} ${getWhere(find)}`),
  findOne: async (tableName, find) => {
    const results = await connection.query(`Select * from ${tableName} ${getWhere(find)} limit 1`)
    if (results && results[0]) return results[0]
    else return null
  },
  insert: (tableName, obj) => {
    const keys = Object.keys(obj)
    const values = keys.map(key => obj[key]) // Object.values doesn't work in node
    const query = `Insert into ${tableName} (${keys.join(', ')}) values (${values.map(value => connection.escape(value)).join(', ')})`
    return connection.query(query)
  },
  update: (tableName, obj, find) => {
    const keys = Object.keys(obj)
    const updates = keys.map(key => `${key}=${connection.escape(obj[key])}`).join(',')
    const query = `Update ${tableName} set ${updates} ${getWhere(find)}`
    return connection.query(query)
  },
  upsert: async (tableName, obj, find) => {
    if (await self.findOne(tableName, find)) return self.update(tableName, obj, find)
    else return self.insert(tableName, obj)
  },
  delete: (tableName, find) => connection.query(`delete from ${tableName} ${getWhere(find)}`),
  createTable: async (dbName, tableName, fields) => {
    let query = `SELECT * FROM information_schema.tables WHERE table_schema = '${dbName}' AND table_name = '${tableName}' LIMIT 1;`
    const tables = await connection.query(query)
    if (tables.length > 0) return `TABLE ${tableName} ALREADY EXISTS, SKIPPING`
    else {
      connection.query(`create table ${tableName} ${fields}`)
      return `TABLE ${tableName} CREATED`
    }
  },
  updateTableColumn: async (dbName, tableName, column) => {
    if (column.sqlType === false) return `COLUMN: ${column.name} IN TABLE: ${tableName} SET TO FALSE, SKIPPING`
    let query = `SELECT IF(count(*) = 1, 'Exist','Not Exist') AS result FROM information_schema.columns WHERE table_schema = '${dbName}' AND table_name = '${tableName}' AND column_name = '${column.name}';`
    const columnExists = await connection.query(query)
    if (columnExists[0].result === 'Exist') return `COLUMN: ${column.name} ALREADY EXISTS IN TABLE: ${tableName}, SKIPPING`
    else {
      let query = `ALTER TABLE ${tableName} ADD COLUMN ${column.name} ${column.sqlType} ${column.sqlDef}`
      await connection.query(query)
      return `TABLE ${tableName} UPDATED WITH COLUMN ${column.name}`
    }
  }
}

// construct where clause
function getWhere (find) {
  find = find || {}
  let wheres = []
  for (let key in find) {
    if (find[key] === null) wheres.push(`(${key} is null)`)
    else if (find[key] === 'notnull') wheres.push(`(${key} is not null)`)
    else wheres.push(`(${key}=${connection.escape(find[key])})`)
  }
  if (wheres.length) return ' where ' + wheres.join(' and ')
  return ''
}
