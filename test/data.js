'use strict';

var retryStrategy = require('../lib/retryStrategy.js');

var proxyConfigs = [{
  urls: ['http://gather.proxy.xinshangshangxin.com/api/v1/combine'],
}];

var requestConfigs = [{
  url: 'http://gather.proxy.xinshangshangxin.com/api/v1/proxy?type=nn&perPage=3',
  json: true,
  retryStrategy: retryStrategy.HTTPOrNetworkError,
  proxy: null,
  followRedirect: true
}, {
  url: 'http://www.xicidaili.com/nn',
  encoding: 'gbk'
}];

var parseConfigs = [{
  mode: 'css',
  extract_rules: [{
    name: 'ipList',
    expression: function($) {
      var arr = [];
      $('#ip_list').find('tr').each(function(i, e) {
        var info = $(e).text().replace(/^\s+|\s+$/g, '').split(/\s+/);
        if(info.length < 2 || !/\d+/.test(info[1])) {
          return;
        }

        arr.push({
          url: 'http://' + info[0] + ':' + info[1],
          type: 'nn',
          data: info
        });
      });
      return arr;
    }
  }]
}, {
  mode: 'RegExp',
  extract_rules: [{
    name: 'allTests',
    expression: function($) {
      return $.match(/test/g);
    }
  }, {
    name: 'test0',
    expression: function($, cache) {
      return cache['allTests'][0];
    }
  }]
}, {
  mode: 'RegExp',
  extract_rules: [{
    expression: function($) {
      return $.match(/test/g);
    }
  }]
}, {
  mode: 'RegExp'
}];


module.exports = {
  requestConfigs: requestConfigs,
  parseConfigs: parseConfigs,
  proxyConfigs: proxyConfigs
};
