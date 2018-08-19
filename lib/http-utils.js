/**
 * Utils that manipulate the HTTP request/response out side the main flow of Express
 */
const uuidv4 = require('uuid/v4')

module.exports = {
  sendErrorResponse: function (err, res) {
    const supportId = uuidv4()
    console.log(new Date() + ' - ' + supportId + ': ' + err.message)
    // do a raw error log here to make sure we get the full stack trace
    console.error(err)
    return res.status(500).render('errors/500', {
      helpers: _helpers,
      layout: 'error-page',
      message: 'Sorry something went wrong on our side',
      supportId: supportId
    })
  },
  send404Response: function (res) {
    res.status(404)
    res.render('errors/404', {helpers: _helpers, layout: 'error-page'})
  }
}
