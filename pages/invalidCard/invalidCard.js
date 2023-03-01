//index.js
//获取应用实例
var app = getApp()
Page({
    data: {
        array: [{
            mode: 'scaleToFill',
            text: 'scaleToFill：不保持纵横比缩放图片，使图片完全适应'
        }],
        src: '../img/banner.jpg'
    },
    //事件处理函数
    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onLoad: function () {
        console.log('onLoad')
        var that = this
        //调用应用实例的方法获取全局数据
        app.getUserInfo(function (userInfo) {
            //更新数据
            that.setData({
                userInfo: userInfo
            })
        })
    },
    onShareAppMessage: function () {

    }

})
