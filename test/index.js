// env variables
require('dotenv').config()
process.env.PORT = process.env.TEST_NODE_PORT

// Testing framework
var chai = require('chai')
var chaiHttp = require('chai-http')
var should = chai.should()
chai.use(chaiHttp)

// Start app here to get access to it globals
var app = require('../core/main')
app.startApp()

// Local variables
const controllerPath = _root + '/test/controllers/'
var baseUrl = 'http://localhost:' + process.env.PORT

describe('Starting our app', function () {
  it('should give 200 response when started', function (done) {
    chai.request(baseUrl)
      .get('/')
      .end(function (err, res) {
        should.not.exist(err)
        res.should.have.status(200)
        done()
      })
  })
})

/**
 * Controllers
 */
require(controllerPath + 'login')
