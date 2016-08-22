var grunt = require('grunt')
var util = require('util')
var path = require('path')
var couchBootstrap = require('couchdb-bootstrap')

function bootstrap (baseUrl, bootstrapDir, target, done) {
  bootstrapDir = path.resolve(process.cwd(), bootstrapDir)
  if (!grunt.file.exists(bootstrapDir)) {
    grunt.fail.warn('bootstrap directory : ' + bootstrapDir + ' does not exist')
  }
  if (!grunt.file.isDir(bootstrapDir)) {
    grunt.fail.warn('bootstrap directory : ' + bootstrapDir + ' does not exist')
  }
  couchBootstrap(baseUrl, bootstrapDir, function (err, res) {
    if (err) {
      return done(err)
    }
    res = util.inspect(res, {
      depth: null
    })
    grunt.log.writeln(res)
    grunt.log.ok(target + ' target successfully executed')
    return done()
  })
}
module.exports = bootstrap
