var request = require('request')
var url = require('url')

module.exports = Helper

function Helper (host) {
  this.host = host
  this.baseUrl = getBaseURL(this.host)
}

Helper.prototype.getBaseURL = getBaseURL
Helper.prototype.checkIfDBExists = checkIfDBExists
Helper.prototype.deleteDB = deleteDB
Helper.prototype.getDocumentFromDB = getDocumentFromDB
Helper.prototype.getHost = getHost

function getBaseURL (host) {
  var baseUrl = url.parse(host)
  baseUrl = url.format(baseUrl)
  baseUrl = baseUrl.slice(0, -1)
  return baseUrl
}

function getHost () {
  return this.baseUrl
}

function checkIfDBExists (dbName, callback) {
  function checkForDb (dbName, body) {
    body = body.filter(function (db) {
      return dbName === db
    })
    return body.length > 0
  }

  var endPoint = this.baseUrl.concat('/_all_dbs')
  request({uri: endPoint, method: 'GET', json: true},
    function (err, res, body) {
      if (err) {
        throw new Error(err)
      } else {
        callback(checkForDb(dbName, body))
      }
    })
}

function deleteDB (dbName, callback) {
  var that = this
  callback = callback.bind(null, dbName)

  checkIfDBExists.bind(that)(dbName, function (exists) {
    if (exists) {
      console.log('database ' + dbName + ' exists already, will delete now')

      var endPoint = that.baseUrl.concat('/').concat(dbName)

      request({uri: endPoint, method: 'DELETE', json: true},
        function (err, res, body) {
          if (err) {
            callback(err)
          } else {
            callback(null, body.ok)
          }
        })
    } else {
      console.log('database ' + dbName + ' not found, cool')
      callback()
    }
  })
}

function getDocumentFromDB (dbName, docId, callback) {
  var endPoint = this.baseUrl.concat('/' + dbName).concat('/' + docId)
  request({uri: endPoint, method: 'GET', json: true},
    function (err, res, body) {
      if (err) {
        callback(err)
      } else {
        callback(null, body)
      }
    })
}
