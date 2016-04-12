var ensure = require('couchdb-ensure')
var bootstrap = require('couchdb-bootstrap')
var util = require('util')
var url = require('url')
var fs = require('fs')
var path = require('path')
var request = require('request');
var config = require('./lib/config.json')
var grunt = require('grunt')
var async = require('async')

function isJSON(file) {
  return file.match(/.json$/);
}

function filterDirectories(file){
  return grunt.file.isDir(file)
}

function sendRequest (url, docs, callback) {
  
  request({uri : url, method : 'POST',body : docs, json : true},
   function (err, res, body) {
    if(err){
      callback(err)
    }
    else {
      callback(null, body)
    }
  })
  
}

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
    
    if(!target){
      grunt.fail.warn('No target specified, ')
    }
    else 
    if(target === 'bootstrap')
    {
      grunt.log.ok(target+ ' target now running')
      bootstrapDir = this.data.dir || config.bootstrapDir
      
      if(!grunt.file.exists(bootstrapDir)){
         grunt.fail.warn('bootstrap directory : '+bootstrapDir+' does not exist')
      }
       if(!grunt.file.isDir(bootstrapDir)){
         grunt.fail.warn('bootstrap directory : '+bootstrapDir+' does not exist')
      }
      
      done = this.async()	
      bootstrap(baseUrl, bootstrapDir, function (err, res) {
         if (err) {
            done(err)
          }
         res = util.inspect(res, {
         depth: null
         })
        grunt.log.writeln(res)
        grunt.log.ok(target+ ' target successfully executed')
        done()
  })
      
   }
    else 
    if(target ==='fixtures'){
       done = this.async()	
       grunt.log.ok(target+ ' target now running')
       fixturesDir = this.data.dir || config.fixturesDir
       grunt.log.ok(fixturesDir+ ': fixtures '+' directory')
       
       if(!grunt.file.exists(fixturesDir)){
         grunt.fail.warn('fixtures directory : '+fixturesDir+' does not exist')
      }
       if(!grunt.file.isDir(fixturesDir)){
         grunt.fail.warn('fixtures directory : '+fixturesDir+' does not exist')
      }
      
      var docs = {}
      var dirPath = path.resolve(process.cwd(), fixturesDir)
      
       fs.readdir(dirPath, function (err, results){
         if(err) {
            grunt.fail.warn('error reading directory : '+dirPath+ ' '+err)
         }
         async.map(results, function (item, callback){
           callback(null, path.resolve(dirPath, item))
         }, function (err, results){
           if(err) {
            grunt.fail.warn('error resolving files in directory :  '+err)
         }
          async.filter(results, function (item, callback) {
            callback(grunt.file.isDir(item))
          }, function (results) {
            
          async.each(results, function (item, callback) {
             var rel = path.relative(dirPath, item)
             docs[rel] = {docs : []}
             fs.readdir(item, function (err, files){
               if(err){
                 callback(err)
               }
               files = files.filter(isJSON)
               
               async.each(files, function (file, callback) {
                 var filePath = path.resolve(item, file)
                  fs.readFile(filePath, function (err, content) {
                if(err){
                  callback(err)
                 }
               else{
                 var json = JSON.parse(content.toString())
                 docs[rel]['docs'] = docs[rel]['docs'].concat(json['docs'])
                 callback(null)   
                }
              
               })
               }, function (err) {
                  if(err) {
                 grunt.fail.warn('error reading json file :  '+err)
                  }
                  
                async.forEachOf(docs, function (value, key, callback) {
                 var databaseUrl
                 databaseUrl = baseUrl.concat('/', key, '/_bulk_docs')
                 sendRequest(databaseUrl, value, function (err, body){
                if(err){
                callback(err)
               }
              else{           
              grunt.log.ok('Request successfully sent to : '+ key)   
              body = util.inspect(body, {
                    depth: null
                   })
                 grunt.log.writeln(body)
                 callback(null)
               }
                })
               }, function (err) {
                if(err){
                grunt.fail.warn('error pushing doc content : '+err) 
               } 
              grunt.log.ok(target+ ' : target successfully executed')
              done()
               })
                  
               })
        
          })  
          },   
          function (err) {
           if(err){
                grunt.fail.warn('error reading directory : '+err) 
               }                                        
              
          })
          })
         })
       })
       
     
    }
    
    else {
       grunt.fail.warn('Target: '+target+' not recorgnized, please use bootstrap or fixtures ')
    }
	
	
	})
}