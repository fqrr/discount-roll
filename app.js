//app.js
App({
    /*获取用户的OpenId*/
    onLaunch: function () {
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                if (res.code) {
                    //发起网络请求--请求后台数据，后台里面有配置appId和AppSecret，注意必须跟开发者对应
                    wx.request({
                        url: 'https://myclhc.com/WxApp/index.php',
                        data: {
                            code: res.code
                        },
                        method: 'GET',
                        success: function (res) {
                            var openid = res.data['openid'];
                            wx.setStorageSync('openid', openid);
                        }
                    })
                } else {
                    console.log('获取用户登录态失败！' + res.errMsg)
                }
            }
        })
    },
    getData: function (path, param, callback) {     // 公共请求函数
        var that = this;
        var paramStr = "";
        if (param) {
            paramStr = JSON.stringify(param);
        }
        var data = {'path': path, 'param': paramStr}
        wx.request({
            url: that.globalData.URL,
            data: data,
            dataType: String,
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: function (res) {
                // console.log(res.data)
                if (callback) {
                    callback(res.data);
                }
            }
        })
    },
    morePage:function (that,page,allList,obj) {    // 分页显示公共函数
        page = page + 1;
        var pageList = [] ;
        for (var j = 0;j<page*8;j++){ // 模拟分页显示
            if(allList[j]){
                pageList.push(allList[j]);
            }
        }
        obj.list = pageList;
        return page;
    },
    globalData: {
        /* URL: 'http://192.168.1.100/project/public/index.php/api',*/
        URL: 'http://test.myclhc.com/huarunhr/api',
        mallNo: '0402D101',
    }
})
