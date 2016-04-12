module.exports = function(grunt) {
  grunt.initConfig(
    {
     couchdb:
     {
     url :'http://127.0.0.1:5984',
     user : 'super',
     password : 'super',
     bootstrap: 
     {
     dir : 'couchdb/bootstrap'
     },
     fixtures : {
     
     }
     }
    });
    
   grunt.loadTasks('./src')
  
};