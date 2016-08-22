var bootstrap = require('./lib/bootstrap.js')
var fixtures = require('./lib/fixtures.js')
var url = require('url')
var config = require('./lib/config.json')

module.exports = function (grunt) {
  grunt.verbose.writeln('Registering couchdb task  now')

  grunt.registerMultiTask('couchdb', function () {
    var done, dbUrl, user, password, baseUrl, target, bootstrapDir, adminParty, fixturesDir

    dbUrl = grunt.config.data.couchdb.url || config.url
    user = grunt.config.data.couchdb.user || config.user
    password = grunt.config.data.couchdb.password || config.password
    adminParty = grunt.config.data.couchdb.adminParty || config.adminParty

    baseUrl = url.parse(dbUrl)
    if (!adminParty && user && password) {
      baseUrl.auth = user + ':' + password
    }
    baseUrl = url.format(baseUrl)
    baseUrl = baseUrl.slice(0, -1)

    target = this.target

    if (!target) {
      grunt.fail.warn('No target specified, ')
    } else if (target === 'bootstrap') {
      grunt.log.ok(target + ' target now running')
      bootstrapDir = this.data.dir || config.bootstrapDir
      done = this.async()
      bootstrap(baseUrl, bootstrapDir, target, done)
    } else if (target === 'fixtures') {
      done = this.async()
      grunt.log.ok(target + ' target now running')
      fixturesDir = this.data.dir || config.fixturesDir
      grunt.log.ok(fixturesDir + ': fixtures ' + ' directory')
      fixtures(baseUrl, fixturesDir, target, done)
    } else {
      grunt.fail.warn('Target: ' + target + ' not recorgnized, please use bootstrap or fixtures ')
    }
  })
}
