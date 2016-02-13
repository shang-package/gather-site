'use strict';

var siteInfos = [{
  url: 'http://www.xicidaili.com/nn',
  encoding: null,
  noCheck: false,
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
  url: '',
  mode: 'RegExp',
  extract_rules: [{
    name: 'allTests',
    expression: function($) {
      return $.match(/test/g);
    }
  }, {
    name: 'test0',
    expression: function($, cache) {
      return cache[0];
    }
  }]
}];


var proxyInfos = [{}];

module.exports = {
  siteInfos: siteInfos,
  proxyInfos: proxyInfos
};
