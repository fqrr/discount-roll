var app = getApp()
Page({
    data: {
        useName:''
    },
    onLoad: function (option) {
        var data = option.data;
        this.setData({
            useName:data
        })
    }
})