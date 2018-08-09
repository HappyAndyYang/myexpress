// Log4js配置
module.exports = {
  appenders: {
    uwebserver: {
      type: 'dateFile',
      filename: './logs/uwebserver',
      pattern: '-yyyy-MM-dd-hh.log',
    },
    console: {
      type: 'console',
    },
  },
  categories: {
    default: {
      appenders: ['uwebserver', 'console'],
      level: 'all',
    },
  },
};
