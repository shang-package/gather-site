# myGather

[![npm version](https://badge.fury.io/js/gather-site.svg)](https://badge.fury.io/js/gather-site)


## `gather(requestConfig, parseConfig, proxyConfig)`

## 获取规则(requestConfig)
```js
// 和 request 相同config, 但是不支持 pipe 等函数
// headers['User-Agent'] 会自动设置
// followRedirect 默认为false
```

## 解析规则(parseConfig)
```js
{
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

## 代理规则(proxyConfig)
```js
proxyConfig === false // 不设置代理
proxyConfig === undefined || proxyConfig === null; // 默认无代理, 失败后再次请求, 最后抛出失败

// proxyConfig
{
  urls: [                              // 从网站获取 proxy
    null,                             // null 表示不使用代理
    'full url get a json proxy list'  // 一个url, 返回内容为 [{url: 'proxy_url_1'}, {url: 'proxy_url_2'}]
  ],
  time: 60 * 1000,                    // 设置[默认]url 轮询更新 间隔
  tryRange: [0, 2],                  // typeProxies中选择获取proxy的范围
  typeProxies: [                     // 显示设置 代理链接,  使用此规则后 urls 不起作用
    [{url: null}],                   // 无代理
    [{url: 'proxy_url_1'}, {url: 'proxy_url_2'}], // 随机选择 proxy_url_1 或者 proxy_url_2
    [{url: 'proxy_url_another_1'}]
  ]
}
```

## gather.proxyPool.getProxy(proxyConfig, noPromise)

```js
var proxy = gather.proxyPool.getProxy(false, true) // 返回一个无代理的proxy
// noPromise === true时, 无法保证已经从 远程拿到 代理列表

gather.proxyPool
  .getProxy()
  .then(function(proxy){
    // 返回一个默认代理的proxy
  });

proxy.getOne(nu); // 随机获取 typeProxies[nu] 中一条
proxy.tryRange    // 从typeProxies的返回的范围
```

## 例子
```js
var gather = require('gather-site');

var requestConfig = {
  url: 'http://www.xicidaili.com/nn'
};

var parseConfig = {
  mode: 'css',
  extract_rules: [{
    name: 'ipList',
    expression: function($) {
      var arr = [];
      $('#ip_list').find('tr').each(function(i, e) {
        var info = $(e).text().replace(/^\s+|\s+$/g, '').split(/\s+/);
        if (info.length < 2 || !/\d+/.test(info[1])) {
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

var proxyConfig = false;

gather(requestConfig, parseConfig, proxyConfig)
  .then(function(data) {
    console.log(data);
  })
  .catch(function(e) {

  });

```

## 许可证
### MIT