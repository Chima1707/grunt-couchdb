var grunt = require('grunt')
var util = require('util')
var fs = require('fs')
var path = require('path')
var request = require('request')
var async = require('async')

function isJSON (dir, file) {
  var filePath = path.resolve(dir, file)
  return !grunt.file.isDir(filePath) && file.match(/.json$/)
}

function sendRequest (url, docs, callback) {
  request({uri: url, method: 'POST', body: docs, json: true},
    function (err, res, body) {
      if (err) {
        callback(err)
      } else {
        callback(null, body)
      }
    })
}

function fixtures (baseUrl, fixturesDir, target, done) {
  var docs = {}
  var dirPath = path.resolve(process.cwd(), fixturesDir)

  if (!grunt.file.exists(dirPath) || !grunt.file.isDir(dirPath)) {
    grunt.fail.warn('fixtures directory : ' + fixturesDir + ' does not exist')
  }
  fs.readdir(dirPath, function (err, results) {
    if (err) {
      grunt.fail.warn('error reading directory : ' + dirPath + ' ' + err)
    }
    // resolve complete filepath for each file
    async.map(results, function (item, callback) {
      callback(null, path.resolve(dirPath, item))
    }, function (err, results) {
      if (err) {
        grunt.fail.warn('error resolving filepath in directory :  ' + err)
      }
      // filter directories. each directory should be a database
      async.filter(results, function (item, callback) {
        callback(grunt.file.isDir(item))
      }, function (results) {
        // iterate each database directory
        async.each(results, function (item, callback) {
          // try to get exact database directory name
          var rel = path.relative(dirPath, item)
          docs[rel] = {docs: []}
          // read database directory and select only json files
          fs.readdir(item, function (err, files) {
            if (err) {
              return callback(err)
            }

            files = files.filter(isJSON.bind(null, item))
            // for each json file parse read asyncronously and parse and concatenate
            // the content into the docs of the corresponding database name
            async.each(files, function (file, callback) {
              var filePath = path.resolve(item, file)
              fs.readFile(filePath, function (err, content) {
                if (err) {
                  return callback(err)
                } else {
                  try {
                    var json = JSON.parse(content.toString())
                    docs[rel]['docs'] = docs[rel]['docs'].concat(json['docs']) // concatenate docs
                    callback(null)
                  } catch (err) {
                    return callback(err)
                  }
                }
              })
            }, function (err) {
              if (err) {
                grunt.fail.warn('error reading json files :  ' + err)
              }
              callback()
            })
          })
        },
          function (err) {
            if (err) {
              grunt.fail.warn('error reading directory : ' + err)
            }

            async.forEachOf(docs, function (value, key, callback) {
              var databaseUrl
              databaseUrl = baseUrl.concat('/', key, '/_bulk_docs')
              sendRequest(databaseUrl, value, function (err, body) {
                if (err) {
                  return callback(err)
                } else {
                  grunt.log.ok('Request successfully sent to : ' + key)
                  body = util.inspect(body, {
                    depth: null
                  })
                  grunt.log.writeln(body)
                  callback(null)
                }
              })
            }, function (err) {
              if (err) {
                grunt.fail.warn(target + ': error pushing doc contents : ' + err)
              } else {
                grunt.log.ok(target + ' : target successfully executed')
              }
              done()
            })
          })
      })
    })
  })
}

module.exports = fixtures
