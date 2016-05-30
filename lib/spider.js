'use strict';

var cheerio = require('cheerio');
var extend = require('extend');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'), {multiArgs: true});

var constants = require('./constants.js');
var proxyPool = require('./proxyPool.js');
var retryStrategy = require('./retryStrategy.js');
var utilities = require('./utilities.js');

var userAgents = constants.userAgents;

function Spider(requestConfig, parseConfig, proxy, defaultRequest) {
  this.requestConfig = requestConfig || {};

  // encoding 为 null 获取内容,方便转码
  var originEncoding = this.requestConfig.encoding;
  this.requestConfig.encoding = null;

  // 设置 followRedirect
  if(!this.requestConfig.followRedirect) {
    this.requestConfig.followRedirect = false;
  }

  // 使用 request.defaults 定义的request
  this.request = defaultRequest || request;

  // 默认检测编码转换
  this.encodingCheck = this.requestConfig.encodingCheck !== false;

  // 重试间隔, 默认为0
  this.retryDelay = this.requestConfig.retryDelay || 0;
  // 重试机制
  this.retryStrategy = this.requestConfig.retryStrategy || retryStrategy.all;

  // 删除request不需要的参数
  delete this.requestConfig.retryDelay;
  delete this.requestConfig.retryStrategy;

  if(parseConfig) {
    parseConfig.encoding = parseConfig.encoding || originEncoding;
  }
  this.parseConfig = parseConfig;
  
  this.proxy = proxy || proxyPool.getProxy(false, false);

  this.cache = {};
  this.content = null;
}

Spider.prototype.baseParseRule = {
  mode: {
    isNeed: 0,
    type: 'String',
    defaultValue: 'json',
    optionalValue: ['css', 'text', 'json'],
    description: '采集内容进行解析, 对css进行类JQ 转换, 对text直接返回文本, 对json则进行JSON.parse'
  },
  extract_rules: [{
    name: {
      isNeed: 1,
      type: 'String',
      optionalValue: null,
      description: '对执行 expression 函数后返回的结果封装成数组(即非数组会成为长度为1的数组)进行缓存, 以供下面的规则进行使用'
    },
    expression: {
      isNeed: 1,
      type: 'Function',
      optionalValue: 'function($, cache)',
      description: 'mode: css($ === $), RegExp($ === String), json($ === obj), cache(obj)'
    }
  }]
};

Spider.prototype.download = function() {
  var that = this;
  var retryDelay = this.retryDelay;

  var deferred = utilities.defer();

  // 存在 proxy, 则不使用重试机制
  if(this.requestConfig.hasOwnProperty('proxy')) {
    deferred.nu = this.proxy.proxies.length;
  }
  else {
    deferred.nu = 0;
  }

  proxyGet(deferred);
  return deferred.promise;

  function tryAgain(e, deferred) {
    if(deferred.nu >= that.proxy.proxies.length) {
      return deferred.reject(e);
    }
    deferred.nu += 1;

    setTimeout(function() {
      proxyGet(deferred);
    }, retryDelay);
  }

  function proxyGet(deferred) {
    var config = that.requestConfig;

    if(!config.proxy) {
      config.proxy = that.proxy.get(deferred.nu);
    }

    // 不存在 User-Agent 则 写入一个
    config.headers = config.headers || {};
    config.headers['User-Agent'] = config.headers['User-Agent'] || userAgents[Math.floor(Math.random() * userAgents.length)];

    that.request(config)
      .spread(function(response, body) {
        if(that.retryStrategy(null, response)) {
          return tryAgain(new Error('statusCode: ' + response.statusCode), deferred);
        }

        if(!that.parseConfig) {
          that.content = utilities.changeEncoding(body);
          return deferred.resolve(that.content);
        }

        // 编码转换
        var content = utilities.changeEncoding(body, that.parseConfig.encoding, that.parseConfig.noCheck);
        that.content = content;

        return deferred.resolve(content);
      })
      .catch(function(e) {
        if(that.retryStrategy(e)) {
          return tryAgain(e, deferred);
        }
        return deferred.reject(e);
      });
  }
};

Spider.prototype.parse = function() {
  return this.parseWith(this.parseConfig);
};

Spider.prototype.parseWith = function(parseConfig) {
  var content = this.content;
  var cache = this.cache;
  var $;

  if(!parseConfig) {
    return content;
  }

  // 转换为小写
  parseConfig.mode = parseConfig.mode || 'json';
  parseConfig.mode = parseConfig.mode.toLowerCase();
  if(parseConfig.mode === 'json') {
    try {
      if(this.requestConfig.json) {
        $ = content;
      }
      else {
        $ = JSON.parse(content);
      }
    }
    catch(e) {
      throw e;
    }
  }
  else if(parseConfig.mode === 'css') {
    $ = cheerio.load(content);
  }
  else {
    $ = content;
  }

  if(!parseConfig.extract_rules) {
    return $;
  }
  // 对每条规则执行 expression 函数
  parseConfig.extract_rules.map(function(rule) {
    cache[rule.name] = [].concat(rule.expression($, cache));
    return cache[rule.name];
  });

  return cache;
};

Spider.prototype.checkRule = function() {

  if(!this.requestConfig) {
    return false;
  }

  var baseRule = this.baseParseRule;
  var valid = true;

  function checkExtractRules(baseExtractRule) {
    return function(rule, index) {
      for(var k in baseExtractRule) {
        if(!baseExtractRule.hasOwnProperty(k)) {
          continue;
        }

        if(baseExtractRule[k].isNeed && !rule[k]) {
          valid = false;
          console.log('siteInfo.extract_rules[' + index + '] need attr: ', k);
        }
      }
    };
  }

  for(var key in baseRule) {
    if(!baseRule.hasOwnProperty(key)) {
      continue;
    }

    if(key === 'extract_rules') {
      if(!this.parseConfig) {
        continue;
      }

      var extract_rules = this.parseConfig.extract_rules;

      if(!extract_rules) {
        continue;
      }
      var baseExtractRule = baseRule.extract_rules[0];
      extract_rules.forEach(checkExtractRules(baseExtractRule));
    }
    else {
      if(baseRule[key].isNeed && !this.parseConfig[key]) {
        valid = false;
        console.log('siteInfo need attr: ', key);
      }
    }
  }
  return valid;
};

Spider.request = request;
module.exports = Spider;
