# Handlebars to HTML pages loader for Webpack

[Webpack](https://github.com/webpack/webpack#readme) loader for create HTML pages
from [Handlebars](https://github.com/handlebars-lang/handlebars.js) templates.

The plugin is inspired by [Foundation's Panini](https://github.com/foundation/panini).

## Installation

The plugin requires your application to be installed Webpack 5 and Handlebars 4.

You can install the package as follows:

```sh
npm install @sumotto/handlebars-to-html-pages-webpack-loader --save-dev

# or

yarn add @sumotto/handlebars-to-html-pages-webpack-loader --dev
```

## Usage

Add the loader to your webpack configuration's:

### Simple loader

```js
const { join } = require( 'path' );
const src = join( __dirname, 'src' );

module.exports = {
  module: {
    rules: [
      {
        test: /\.hbs$/,
        use: [
          'html-loader', // Or something else to link hbs text to JS
          {
            loader: '@sumotto/handlebars-to-html-pages-webpack-loader',
            options: {
              // Paths to the corresponding folders, can be either a string or an array of absolute or relative paths.
              layoutsPaths: join( src, 'layouts' ), // by 'layouts' 
              partialsPaths: [ join( src, 'partials' ), join( src, 'blocks' ) ], // by default 'partials'
              helpersPaths: join( src, 'helpers' ), // by default 'helpers'
              contextsPaths: join( src, 'contexts' ), // by default 'contexts'
              // The path to the pages needs to get the pageName right, for example: 'sub-page/some-page'
              pagesFolderPaths: join( src, 'pages' ), // by default 'pages'
              // Used to determine relative paths.
              root: src, // by default loaderContext.rootContext
              // If you need to, you can set the default context.
              defaultContext: {
                key: 'value',
              }, // by default {}
              //Outputs to the console information about all registered helpers, partials and contexts.
              debug: true, // by default false
            }
          },
        ],
      }
    ]
  },
};
```

### With Assets Resources

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.hbs$/,
        type: 'asset/resource',
        generator: {
          filename: ( pathData ) => {
            return relative( pages, pathData.filename ).replace( /\.hbs$/, '.html' );
          },
        },
      },
      {
        test: /\.hbs$/,
        use: [
          '@sumotto/handlebars-to-html-pages-webpack-loader'
        ],
      }
    ]
  },
}
```

### With HTML Webpack plugin

```js
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const src = join( __dirname, 'src' );

module.exports = {
  module: {
    rules: [
      {
        test: /\.hbs$/,
        use: [
          'html-loader',
          '@sumotto/handlebars-to-html-pages-webpack-loader'
        ],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin( {
      page: 'index.html',
      template: join( src, 'pages', 'index.hbs' ),
    } ),
    new HtmlWebpackPlugin( {
      page: 'sub-page/some-page.html',
      template: join( src, 'pages', 'sub-page/some-page.hbs' ),
    } ),
  ],
}
```

## License

MIT License
