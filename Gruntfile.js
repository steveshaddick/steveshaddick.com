'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('steveshaddick.com.jquery.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    
    compass: {
      d: {
        options: {
          sassDir: 'src/scss/',
          cssDir: 'www/css',
          imagesDir: 'www/images',
          outputStyle: 'compressed',
          environment: 'production'
        }
      }
    },

    uglify: {
        dev: {
          options: {
            preserveComments: 'some',
            beautify: true
          },
          files: {
            'www/js/plugins.min.js' : [
              "src/js/swfaddress/swfaddress.js",
              "src/js/jquery/jquery.mousewheel.min.js",
              "src/js/jquery/jquery.fullscreen.js",
              "src/js/jquery/jquery.cookie.min.js",
              "src/js/lightbox/lightbox.js",
              "src/js/simplevideo/SimpleVideo.js"
            ],
            'www/js/plugins-phone.min.js' : [
              "src/js/swfaddress/swfaddress.js",
              "src/js/jquery/jquery.cookie.min.js",
              "src/js/iscroll/iscroll.js",
              "src/js/lightbox/lightbox.js",
              "src/js/simplevideo/SimpleVideo.js"
            ],
            'www/js/Main.min.js': [
              'src/js/ss.com/*.js'
            ]
          }
        },
        prod: {
          options: {
            preserveComments: 'some'
          },
           files: {
            'www/js/plugins.min.js' : [
              "src/js/swfaddress/swfaddress.js",
              "src/js/jquery/jquery.mousewheel.min.js",
              "src/js/jquery/jquery.fullscreen.js",
              "src/js/jquery/jquery.cookie.min.js",
              "src/js/lightbox/lightbox.js",
              "src/js/simplevideo/SimpleVideo.js"
            ],
            'www/js/plugins-phone.min.js' : [
              "src/js/swfaddress/swfaddress.js",
              "src/js/jquery/jquery.cookie.min.js",
              "src/js/iscroll/iscroll.js",
              "src/js/lightbox/lightbox.js",
              "src/js/simplevideo/SimpleVideo.js"
            ],
            'www/js/Main.min.js': [
              'src/js/ss.com/*.js'
            ]
          }
        }
      },
    watch: {
      styles: {
        files: 'src/scss/*.scss',
        tasks: ['compass'],
        options: {
          interrupt: true
        }
      },
      scripts: {
        files: 'src/js/**/*.js',
        tasks: ['uglify:dev'],
        options: {
          interrupt: true
        }
      }
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');

  // Default task.
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('prod', ['compass', 'uglify:prod']);

};
