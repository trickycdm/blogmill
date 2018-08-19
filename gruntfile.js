require('dotenv').config()
module.exports = function (grunt) {
  // SITE STYLE
  const siteTheme = process.env.SITE_THEME
  const siteRoot = `site/themes/${siteTheme}/`
  const siteScssRoot = `site/themes/${siteTheme}/scss/`
  const siteGlobbedScssDestination = `${siteRoot}/scss/style.scss`
  const sitePublicStyleDestination = `${siteRoot}/public/css/style.css`

  // SITE JS
  const siteJsBundledJsFile = `${siteRoot}public/js/main.js`
  const siteJsFinalOutput = `${siteRoot}public/js/main.min.js`

  // CMS STYLE
  const cmsRoot = `cms/`
  const cmsGlobbedScssDestination = `${cmsRoot}scss/style.scss`
  const cmsScssRoot = `${cmsRoot}scss/`
  const cmsPublicStyleDestination = `${cmsRoot}public/css/style.css`

  // CMS JS
  const cmsJsBundledJsFile = `${cmsRoot}public/js/main.js`
  const cmsJsFinalOutput = `${cmsRoot}public/js/main.min.js`

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // main jsmin task
    uglify: {
      cms: {
        src: [
          `${cmsRoot}**/_*.js`
        ],
        dest: cmsJsBundledJsFile
      },
      site: {
        src: [
          `${siteRoot}**/_*.js`
        ],
        dest: siteJsBundledJsFile
      }
    },
    babel: {
      options: {
        sourceMap: true,
        minified: true,
        presets: ['es2015']
      },
      dist: {
        files: {
          [cmsJsFinalOutput]: cmsJsBundledJsFile,
          [siteJsFinalOutput]: siteJsBundledJsFile
        }
      }
    },
    browserify: {
      cms: {
        src: [cmsJsBundledJsFile],
        dest: cmsJsBundledJsFile,
        options: {
          external: ['jquery']
        }
      },
      site: {
        src: [siteJsBundledJsFile],
        dest: siteJsBundledJsFile,
        options: {
          external: ['jquery']
        }
      }
    },
    // concats all the sass partials for compilation later, need them in this order, avoid wildcards
    sass_globbing: {
      site: {
        files: {
          [siteGlobbedScssDestination]: [
            `${siteScssRoot}_variables.scss`,
            `${siteScssRoot}_globals.scss`,
            `${siteScssRoot}_basic-style.scss`,
            `${siteScssRoot}_bootstrap-overrides.scss`,
            `${siteScssRoot}_utilities.scss`,
            `${siteRoot}**/_*.scss`,
            // add media last to ensure it always has precidence
            `${siteScssRoot}_media.scss`
          ]
        },
        options: {
          useSingleQuotes: false,
          signature: '// Style by Colin Mackenzie - DOGFI.SH Mobile'
        }
      },
      cms: {
        files: {
          [cmsGlobbedScssDestination]: [
            `${cmsScssRoot}_variables.scss`,
            `${cmsScssRoot}_globals.scss`,
            `${cmsScssRoot}_basic-style.scss`,
            `${cmsScssRoot}_bootstrap-overrides.scss`,
            `${cmsRoot}**/_*.scss`
          ]
        },
        options: {
          useSingleQuotes: false,
          signature: '// Style by Colin Mackenzie - DOGFI.SH Mobile'
        }
      }
    },
    // convert the scss into css
    sass: {
      site: {
        options: {
          style: 'expanded' // minified in postcss
        },
        files: {
          [sitePublicStyleDestination]: [siteGlobbedScssDestination]
        }
      },
      cms: {
        options: {
          style: 'expanded'
        },
        files: {
          [cmsPublicStyleDestination]: [cmsGlobbedScssDestination]
        }
      }
    },
    // lint and sort the css rules before compilation
    csscomb: {
      site: {
        dynamic_mappings: {
          expand: true,
          cwd: siteRoot,
          src: ['style.scss'],
          dest: siteRoot,
          ext: '.scss'
        }
      },
      cms: {
        dynamic_mappings: {
          expand: true,
          cwd: cmsRoot,
          src: ['style.scss'],
          dest: cmsRoot,
          ext: '.scss'
        }
      }
    },
    // take our processed scss >> css and lint and augment the css
    postcss: {
      site: {
        options: {
          map: {
            inline: false, // save all sourcemaps as separate files...
            annotation: `${sitePublicStyleDestination}style.min.css` // ...to the specified directory
          },
          processors: [
            require('autoprefixer')({browsers: 'last 2 versions'}), // add vendor prefixes
            require('cssnano')() // minify the result
          ]
        },
        dist: {
          src: `${sitePublicStyleDestination}style.css`
        }
      },
      cms: {
        options: {
          map: {
            inline: false, // save all sourcemaps as separate files...
            annotation: `${cmsPublicStyleDestination}style.min.css` // ...to the specified directory
          },
          processors: [
            require('autoprefixer')({browsers: 'last 2 versions'}), // add vendor prefixes
            require('cssnano')() // minify the result
          ]
        },
        dist: {
          src: `${cmsPublicStyleDestination}style.css`
        }
      }
    },
    watch: {
      site_css: {
        files: [`${siteRoot}**/_*.scss`],
        tasks: ['site-style-build']
      },
      cms_css: {
        files: [`${cmsRoot}**/_*.scss`],
        tasks: ['cms-style-build']
      },
      cms_js: {
        files: [`${cmsRoot}**/_*.js`],
        tasks: ['cms-js-build']
      },
      site_js: {
        files: [`${siteRoot}**/_*.js`],
        tasks: ['site-js-build']
      }
    }
  })

  require('load-grunt-tasks')(grunt, {scope: 'devDependencies'})

  // Default task(s).
  grunt.registerTask('cms-js-build', ['uglify:cms', 'browserify:cms', 'babel'])
  grunt.registerTask('site-js-build', ['uglify:site', 'browserify:site', 'babel'])

  grunt.registerTask('site-style-build', ['sass_globbing:site', 'csscomb:site', 'sass:site', 'postcss:site'])
  grunt.registerTask('cms-style-build', ['sass_globbing:cms', 'csscomb:cms', 'sass:cms', 'postcss:cms'])
}
