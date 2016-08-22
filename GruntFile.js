/*
 * grunt-injector
 * https://github.com/klei-dev/grunt-injector
 *
 * Copyright (c) 2013 Joakim Bengtson
 * Licensed under the MIT license.
 */

'use strict'

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    // Configuration to be run (and then tested).
    couchdb: {
      url: 'http://127.0.0.1:5985',
      adminParty: true,
      bootstrap: {
        dir: 'test/couchdb/bootstrap'
      },
      fixtures: {
        dir: 'test/couchdb/fixtures'
      }
    }

  })

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks')

  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt)

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'couchdb:bootstrap', 'couchdb:fixtures'])

  // By default, lint and run all tests.
  grunt.registerTask('default', ['test'])
}
