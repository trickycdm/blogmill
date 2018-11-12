// NOTE if you get infinite loop on grunt watch, make sure all packages are installed, especially npm install grunt-postcss pixrem autoprefixer cssnano for somereason this omits packages form the package.json file.

require('dotenv').config()
module.exports = function (grunt) {
  // SITE STYLE
  const siteTheme = process.env.SITE_THEME
  const siteRoot = `site/themes/${siteTheme}`
  const siteScssRoot = `site/themes/${siteTheme}/scss/`
  const siteGlobbedScssDestination = `${siteRoot}/scss/style.scss`
  const sitePublicStyleDestination = `${siteRoot}/public/css/style.css`

  // SITE JS
  const siteJsBundledJsFile = `${siteRoot}/public/js/bundle.js`
  const siteJsFinalOutput = `${siteRoot}/public/js/main.min.js`

  // CMS STYLE
  const cmsRoot = `cms`
  const cmsGlobbedScssDestination = `${cmsRoot}/scss/style.scss`
  const cmsScssRoot = `${cmsRoot}/scss/`
  const cmsPublicStyleDestination = `${cmsRoot}/public/css/style.css`

  // CMS JS
  const cmsJsBundledJsFile = `${cmsRoot}/public/js/bundle.js`
  const cmsJsFinalOutput = `${cmsRoot}/public/js/main.min.js`

  require('load-grunt-tasks')(grunt, {
    scope: 'devDependencies'
  })

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // main jsmin task
    uglify: {
      cms: {
        src: [
          `${cmsRoot}/**/_*.js`
        ],
        dest: cmsJsBundledJsFile
      },
      site: {
        src: [
          `${siteRoot}/**/_*.js`
        ],
        dest: siteJsBundledJsFile
      }
    },
    babel: {
      options: {
        sourceMap: true,
        minified: true,
        presets: [
          ['@babel/preset-env', {
            'targets': {
              'chrome': '60'
            }
          }]
        ]
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
            `${siteScssRoot}_normalize.scss`,
            `${siteScssRoot}_globals.scss`,
            `${siteScssRoot}_basic-style.scss`,
            `${siteScssRoot}_utilities.scss`,
            `${siteRoot}/**/_*.scss`,
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
            `${cmsRoot}/**/_*.scss`
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
    // take our processed scss >> css and lint and augment the css
    postcss: {
      options: {
        map: {
          inline: false // save all sourcemaps as separate files...
        },
        processors: [
          require('autoprefixer')({ browsers: 'last 2 versions' }), // add vendor prefixes
          require('cssnano')() // minify the result
        ]
      },
      dist: {
        src: [sitePublicStyleDestination, cmsPublicStyleDestination]
      }
    },
    watch: {
      site_css: {
        files: [`${siteRoot}/**/_*.scss`],
        tasks: ['site-style-build']
      },
      cms_css: {
        files: [`${cmsRoot}/**/_*.scss`],
        tasks: ['cms-style-build']
      },
      cms_js: {
        files: [`${cmsRoot}/**/_*.js`],
        tasks: ['cms-js-build']
      },
      site_js: {
        files: [`${siteRoot}/**/_*.js`],
        tasks: ['site-js-build']
      }
    }
  })

  // Default task(s).
  grunt.registerTask('cms-js-build', ['uglify:cms', 'browserify:cms', 'babel'])
  grunt.registerTask('site-js-build', ['uglify:site', 'browserify:site', 'babel'])

  grunt.registerTask('site-style-build', ['sass_globbing:site', 'sass:site', 'postcss'])
  grunt.registerTask('cms-style-build', ['sass_globbing:cms', 'sass:cms'])

  // utility func to dump grunt config. Useful if you are having any issues.
  grunt.registerTask('printConfig', function () {
    grunt.log.writeln(JSON.stringify(grunt.config(), null, 2))
  })
}
