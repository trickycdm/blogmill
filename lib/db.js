const mysql = require('promise-mysql')
const SqlString = require('sqlstring')
const moment = require('moment')
const uuidv4 = require('uuid/v4')

const pool = mysql.createPool({
  connectionLimit: 20,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

let self = module.exports = {
  escape: str => SqlString.escape(str),
  rawSql: query => self.safeQuery(query),
  find: (tableName, find) => self.safeQuery(`Select * from ${tableName} ${getWhere(find)}`),
  findOne: async (tableName, find) => {
    const results = await self.safeQuery(`Select * from ${tableName} ${getWhere(find)} limit 1`)
    if (results && results[0]) return results[0]
    else return null
  },
  insert: (tableName, obj) => {
    const keys = Object.keys(obj)
    const values = keys.map(key => obj[key]) // Object.values doesn't work in node
    const query = `Insert into ${tableName} (${keys.join(', ')}) values (${values.map(value => self.escape(value)).join(', ')})`
    return self.safeQuery(query)
  },
  update: (tableName, obj, find) => {
    const keys = Object.keys(obj)
    const updates = keys.map(key => `${key}=${self.escape(obj[key])}`).join(',')
    const query = `Update ${tableName} set ${updates} ${getWhere(find)}`
    return self.safeQuery(query)
  },
  upsert: async (tableName, obj, find) => {
    if (await self.findOne(tableName, find)) return self.update(tableName, obj, find)
    else return self.insert(tableName, obj)
  },
  delete: (tableName, find) => self.safeQuery(`delete from ${tableName} ${getWhere(find)}`),
  sqlDateFormat: (date = false) => {
    if (date) return moment(date).format('YYYY-MM-DD HH:mm:ss')
    else return moment().format('YYYY-MM-DD HH:mm:ss')
  },
  updateTableColumn: async (dbName, tableName, column) => {
    if (column.sqlType === false) return `COLUMN: ${column.name} IN TABLE: ${tableName} SET TO FALSE, SKIPPING`
    let query = `SELECT IF(count(*) = 1, 'Exist','Not Exist') AS result FROM information_schema.columns WHERE table_schema = '${dbName}' AND table_name = '${tableName}' AND column_name = '${column.name}';`
    const columnExists = await self.safeQuery(query)
    if (columnExists[0].result === 'Exist') return `COLUMN: ${column.name} ALREADY EXISTS IN TABLE: ${tableName}, SKIPPING`
    else {
      let query = `ALTER TABLE ${tableName} ADD COLUMN ${column.name} ${column.sqlType} ${column.sqlDef}`
      await self.safeQuery(query)
      return `TABLE ${tableName} UPDATED WITH COLUMN ${column.name}`
    }
  },
  safeQuery: async query => {
    try {
      const connection = await pool.getConnection()
      const results = await connection.query(query)
      await connection.release()
      return results
    } catch (err) {
      const supportId = uuidv4()
      const timestamp = new Date()
      console.error(`${timestamp} ${supportId} DATABASE ERROR:`)
      console.error(err)
      return {err: true, message: `There was a problem with your database operation. Please quote this support ID ${supportId}`}
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
    else wheres.push(`(${key}=${self.escape(find[key])})`)
  }
  if (wheres.length) return ' where ' + wheres.join(' and ')
  return ''
}
