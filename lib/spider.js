'use strict';

var cheerio = require('cheerio');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'), {multiArgs: true});

var constants = require('./constants.js');
var Proxy = require('./proxy.js');
var utilities = require('./utilities.js');

var userAgents = constants.userAgents;

function defer() {
  var resolve, reject;
  var promise = new Promise(function() {
    resolve = arguments[0];
    reject = arguments[1];
  });
  return {
    resolve: resolve,
    reject: reject,
    promise: promise
  };
}

function Spider(siteInfo, proxy) {
  this.siteInfo = siteInfo;
  this.content = null;
  this.cache = {};
  this.proxy = proxy || new Proxy();
}

Spider.prototype.baseRule = {
  url: {
    isNeed: 1,
    type: 'String',
    optionalValue: null,
    description: 'a full url'
  },
  encoding: {
    isNeed: 0,
    type: 'any',
    defaultValue: 'utf8',
    optionalValue: [undefined, null, 'utf8', 'gbk'],
    description: '采集后进行的编码转换, 默认会检测gbk并转换'
  },
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
  var siteInfo = this.siteInfo;

  var deferred = defer();
  deferred.nu = this.proxy.tryRange[0];

  proxyGet(deferred);
  return deferred.promise;

  function proxyGet(deferred) {
    request(
      {
        url: siteInfo.url,
        method: 'GET',
        timeout: 15 * 1000,
        encoding: null,
        followRedirect: false,
        proxy: that.proxy.getOne(deferred.nu),
        headers: {
          'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
        }
      })
      .spread(function(response, body) {
        if(response.statusCode >= 400) {
          return Promise.reject('statusCode: ' + response.statusCode);
        }

        var content = utilities.changeEncoding(body, siteInfo.encoding, siteInfo.noCheck);
        that.content = content;
        return deferred.resolve(content);
      })
      .catch(function(e) {
        console.log(e);
        console.log(deferred.nu);
        if(deferred.nu >= that.proxy.tryRange[1]) {
          return deferred.reject(e);
        }
        deferred.nu += 1;
        return proxyGet(deferred);
      });
  }
};

Spider.prototype.parse = function() {
  var siteInfo = this.siteInfo;
  var content = this.content;
  var cache = this.cache;

  var $;

  // 转换为小写
  siteInfo.mode = siteInfo.mode || 'json';
  siteInfo.mode = siteInfo.mode.toLowerCase();
  if(siteInfo.mode === 'json') {
    try {
      $ = JSON.parse(content);
    }
    catch(e) {
      throw e;
    }
  }
  else if(siteInfo.mode === 'css') {
    $ = cheerio.load(content);
  }
  else {
    $ = content;
  }

  if(!siteInfo.extract_rules) {
    return $;
  }
  // 对每条规则执行 expression 函数
  siteInfo.extract_rules.map(function(rule) {
    cache[rule.name] = [].concat(rule.expression($, cache));
    return cache[rule.name];
  });

  return cache;
};

Spider.prototype.checkRule = function() {
  var baseRule = this.baseRule;
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
      var extract_rules = this.siteInfo.extract_rules ;

      if(!extract_rules) {
        continue;
      }
      var baseExtractRule = baseRule.extract_rules[0];
      extract_rules.forEach(checkExtractRules(baseExtractRule));
    }
    else {
      if(baseRule[key].isNeed && !this.siteInfo[key]) {
        valid = false;
        console.log('siteInfo need attr: ', key);
      }
    }
  }
  return valid;
};

module.exports = Spider;
