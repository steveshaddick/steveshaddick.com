'use strict';

module.exports = function(grunt) {

  var ASSET_PATH = "static";
  var SRC_PATH = 'src';

  var jsFiles = [
    {src: [SRC_PATH + '/js/lib/**/*.js'], dest: ASSET_PATH + '/js/lib.min.js'},
    {src: [SRC_PATH + '/js/*.js'], dest: ASSET_PATH + '/js/main.min.js'}
  ];

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    
    compass: {
      d: {
        options: {
          sassDir: SRC_PATH + '/scss/',
          cssDir: ASSET_PATH + '/css',
          imagesDir: ASSET_PATH + '/img',
          outputStyle: 'compressed',
          environment: 'production'
        }
      },
      sv: {
        options: {
          sassDir: SRC_PATH + '/lib/simplevideo/theme/',
          cssDir: ASSET_PATH + '/lib/simplevideo/theme/',
          imagesDir: ASSET_PATH + '/lib/simplevideo/theme/',
          outputStyle: 'compressed',
          environment: 'production'
        }
      }
    },

    uglify: {
      dev: {
        options: {
          preserveComments: 'some',
          compress: false,
          beautify: true
        },
        files: jsFiles
      },
      prod: {
        options: {
          preserveComments: 'some',
          report: 'min'
        },
        files: jsFiles
      }
    },

    concat: {
      options: {
        separator: ';',
      },
      dist: {
      src: SRC_PATH + '/js/plugins/**/*.js',
      dest: ASSET_PATH + '/js/plugins.min.js',
      },
    },
    
    watch: {
      styles: {
        files:SRC_PATH + '/scss/*.scss',
        tasks: ['compass:d'],
        options: {
          interrupt: true
        }
      },
      lib: {
        files: SRC_PATH + '/lib/**/*.scss',
        tasks: ['compass:sv'],
        options: {
          interrupt: true
        }
      },
      scripts: {
        files: SRC_PATH + '/js/**/*.js',
        tasks: ['uglify:prod', 'concat'],
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
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task.
  grunt.registerTask('default', ['compass', 'uglify:prod', 'concat', 'watch']);
  grunt.registerTask('dev', ['compass', 'uglify:dev', 'concat']);

};
