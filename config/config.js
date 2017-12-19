const path = require('path')
const rootPath = path.normalize(__dirname + '/..')
const env = process.env.NODE_ENV || 'development'

let config = {
  development: {
    root: rootPath,
    app: {
      name: 'Blog'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/blog'
  },
  test: {
    root: rootPath,
    app: {
      name: 'Blog'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/blog'
  },
  production: {
    root: rootPath,
    app: {
      name: 'Blog'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/blog'
  }
}

module.exports = config[env];
