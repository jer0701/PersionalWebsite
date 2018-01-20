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
    db: 'mongodb://localhost/blog',
    invitationCode: '1111'
  },
  test: {
    root: rootPath,
    app: {
      name: 'Blog'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/blog',
    invitationCode: '1111'
  },
  production: {
    root: rootPath,
    app: {
      name: 'Blog'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/blog',
    invitationCode: '1111'
  }
}

module.exports = config[env];
