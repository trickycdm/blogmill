/**
 * Get all the data required to populate the table view
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
exports.controller = async (req, res, next) => {
  try {
    // check for single pages that do not require the table view
    if (req.pageSchema.single) return next()
    const tableData = await DB.find(req.pageSchema.table, {})
    // only include table columns flagged for inclusion
    req.pageSchema.tableColumns = req.pageSchema.fields.filter(field => field.showInTableView) // TODO: Validate schema's that have no table columns defined
    const rows = []
    for (const tableRow of tableData) rows.push(await populateTableRow(tableRow, req.pageSchema))
    req.pageSchema.rows = rows
    return res.render('table/table', req.pageSchema)
  } catch (err) {
    next(err)
  }
}

async function populateTableRow (record, pageSchema) {
  const row = { id: record.id, data: {} }
  for (const column of pageSchema.tableColumns) {
    const columnName = column.name
    let value = record[columnName]
    if (column.preRenderTableCell) value = await column.preRenderTableCell(record.id, value)
    row.data[columnName] = { value: value, link: `${CMS_CONFIG.CMS_ROOT}/${pageSchema.route}/${record.id}` }
  }
  return row
}
