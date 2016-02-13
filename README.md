# myGather

## 站点规则
```js
{
  url: {
    isNeed: 1,
    type: 'String',
    description: 'a full url'
  },
  encoding: {
    isNeed: 0,
    type: 'any',
    optionalValue: [undefined, null, 'utf8', 'gbk'],
    description: '采集后进行的编码转换, 默认会检测gbk并转换'
  },
  mode: {
    isNeed: 1,
    type: 'String',
    optionalValue: ['css', 'RegExp', 'json'],
    description: '采集内容进行解析, 对css进行类JQ 转换, 对RegExp直接返回文本, 对json则进行JSON.parse'
  },
  extract_rules: [{
    name: {
      isNeed: 1,
      type: 'String',
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

## 许可证
### MIT