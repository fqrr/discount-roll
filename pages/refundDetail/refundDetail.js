//index.js
//获取应用实例
var app = getApp()
Page({
    data: {
        refundsAmount:'',// 退款金额
        refundsNo:'', // 订单编号
        backData:{}, // 数据对象
    },
    //事件处理函数

    onLoad: function (option) {
        var that=this;
        var token = wx.getStorageSync('token');
        var pathList='mixc/api/v1/order/refundDetail';
        var detailsList= {
            refundsNo:option.refunds,
            'token':token,
            'mallNo':app.globalData.mallNo
        }
        app.getData(pathList, detailsList,function (res) {
            var data = JSON.parse(res);
            var datas=data.data
            datas.applyStatus = parseInt(datas.applyStatus);
            that.setData({
                refundsAmount:datas.refundsAmount,
                refundsNo:datas.refundsNo,
                backData:datas
            })
        })

    },
    showTell:function () {
        wx.showModal({
            title: '客服电话',
            showCancel:false,
            content: '0755-88888888',
        })
    }
})
