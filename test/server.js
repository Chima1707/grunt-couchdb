var spawnPouchdbServer = require('spawn-pouchdb-server')

function startServer (cb) {
  spawnPouchdbServer(function (error, server) {
    if (error) {
      console.log('PouchDB Server faled to start')
      cb(error, null)
    }
    console.log('PouchDB Server started at localhost:5985/_utils')
    return cb(server)
  })
}

function stopServer (server, cb) {
  server.stop(function () {
    console.log('PouchDB Server stopped')
    return cb()
  })
}

module.exports = {start: startServer, stop: stopServer}
