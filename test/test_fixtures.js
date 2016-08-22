var tap = require('tap')
var fixtures = require('./../tasks/lib/fixtures')
var Helper = require('./helper')
var app = require('./server')
var bootstrap = require('./../tasks/lib/bootstrap')
var testHelper = new Helper('http://127.0.0.1:5985')

tap.test('test couchdb fixtures', function (childTest) {
  var server
  app.start(function (res) {
    server = res

    bootstrap(testHelper.getHost(), 'test/couchdb/bootstrap', 'Bootstrap', function () {
      fixtures(testHelper.getHost(), 'test/couchdb/fixtures', 'Fixtures', function () {
        testHelper.getDocumentFromDB('products-db', 'product_1', function (err, doc) {
          childTest.notOk(err)
          childTest.ok(doc._id)
          app.stop(server, function () {
            childTest.end()
          })
        })
      })
    })
  })
})
