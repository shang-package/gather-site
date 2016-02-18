# myGather

[![npm version](https://badge.fury.io/js/gather-site.svg)](https://badge.fury.io/js/gather-site)

## 站点规则
```js
{
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
}
```

## 例子
```js
var gather = require('gather-site');
var siteInfo = {
  url: 'http://www.xicidaili.com/nn',
  encoding: null,
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
};

var config = {
  proxy: true
};

gather(siteInfo, config)
  .then(function(data) {
    console.log(data);
  })
  .catch(function(e) {

  });
```

## gather.proxyPool.getProxy(proxyConfig)

```js
// proxyConfig
{
	urls: [                              // 从网站获取 proxy
    null,					                    // null 表示不使用代理
    'full_url get a json proxy list'  // 一个url, 返回内容为 [{url: 'proxy_url'}]
  ],
  time: 60 * 1000,										// 设置[默认]url 轮询更新 间隔
  tryRange: [0, 2],                  // typeProxies中选择获取proxy的范围
  typeProxies: [										 // 显示设置 代理链接,  使用此规则后 urls 不起作用
  	[{url: 'proxy_url_1'}, {url: 'proxy_url_2'}],
  	[{url: 'proxy_url_another_1'}]
  ]
}

// var proxy = gather.proxyPool.getProxy() // 返回一个无代理的proxy
// var proxy = gather.proxyPool.getProxy({}) // 返回一个默认代理的proxy
// proxy.getOne(nu); // 随机获取 typeProxies[nu] 中一条
// proxy.tryRange    // 从typeProxies的返回的范围
```

## 许可证
### MIT