// Testing framework
var chai = require('chai')
var chaiHttp = require('chai-http')
var should = chai.should()
chai.use(chaiHttp)

// locals
var baseUrl = 'http://localhost:' + process.env.PORT

var creds = require(ROOT + '/test/creds.json').frontendLogin

describe('Login flow: ', function () {
  it('should be allowed to access login page....')
  it('should be allowed to login....')
})
