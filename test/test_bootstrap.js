var tap = require('tap')
var bootstrap = require('./../tasks/lib/bootstrap')
var Helper = require('./helper')
var app = require('./server')
var testHelper = new Helper('http://127.0.0.1:5985')

tap.test('test couchdb bootstrap', function (childTest) {
  var server
  app.start(function (res) {
    server = res

    testHelper.deleteDB('products-db', function () {
      bootstrap(testHelper.getHost(), 'test/couchdb/bootstrap', 'Bootstrap', function () {
        testHelper.checkIfDBExists('products-db', function (exists) {
          childTest.ok(exists)
          app.stop(server, function () {
            childTest.end()
          })
        })
      })
    })
  })
})
