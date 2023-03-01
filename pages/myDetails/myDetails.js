//index.js
//获取应用实例
var app = getApp()
Page({
    data: {
        src: '../img/bg.jpg',
        /*登陆弹框*/
        bombHidden: true,
        countVal: '发送验证码',
        mobile: '',
        countNum: '',
        tipHidden: true,
        tip: '',
        countDisabled: false,
        loginDisabled: false,
        /*领取按钮状态*/
        receiveHide: false,
        immediateUse: true,
        hadHide: true,
        /*退款状态*/
        isBack: true,

        /*购买券*/
        buyDetail: {},
        /*积分券*/
        giftDetail: {},
        /*免费券*/
        freeDetail: {},
        freeImmediateUse: true,
        /*判断进来的是哪种券*/
        isId: '',

        coinNum: 1, // 积分兑换默认值
        coinHidden: true,  // 显示积分兑换框

        myPoint: '', //  我的积分
        btnTit: '',  //  按钮文字

        isWidth: false, // 退款宽度
        isToBack: false, // 退款按钮控制

        refundSchedule: true,//查看退款进度
        receivePay:true, // 未支付立即支付
        feeHidden:true, // 支付窗口
    },

    onLoad: function (option) {
        var that = this;
        var token = wx.getStorageSync('token') || '';
        var detailsList = {
            // 'category': 'reduction',  // 券类型
            'token': token,
            'mallNo': app.globalData.mallNo,
        }
        var pathList = '';
        if (option.id) {     // 免费券详情
            pathList = 'mixc/api/v2/coupon/consume/detail';
            detailsList.id = option.id;
            detailsList.isNewType = '1';
            app.getData(pathList, detailsList, function (res) {
                var data = JSON.parse(res).data;
                that.setData({
                    freeDetail: data,
                    isId: 'free',
                    freeImmediateUse: false
                })
            })
        }
        if (option.orderNo) {     // 购买券详情
            pathList = 'mixc/api/v2/order/detail';
            detailsList.orderNo = option.orderNo
            //detailsList.category = 'cash'
            app.getData(pathList, detailsList, function (res) {
                    var data = JSON.parse(res).data;
                    /*判断是来自有效券还是失效券*/
                    /*如果是有效券*/
                    if (data.status == 2) {
                        /*不能退款*/
                        if (data.canRefundGoods === 0) {
                            that.setData({
                                isWidth: true,
                                isToBack: true,
                                immediateUse: false,
                                refundSchedule: true,
                                hadHide: true
                            });
                        }
                        /*可以退款*/
                        else if (data.canRefundGoods === 1) {
                            that.setData({
                                isWidth: true,
                                isToBack: false,
                                immediateUse: false,
                                refundSchedule: true,
                                hadHide: true
                            });
                        }
                    }
                    /*如果是失效券*/
                    else {
                        if (data.status == 7 || data.status == 8 || data.status == 9 || data.status == 10) {
                            that.setData({
                                isWidth: true,
                                isToBack: true,
                                immediateUse: true,
                                refundSchedule: false,
                                hadHide: true,
                                receivePay:true,
                            });
                        } else {
                            if(data.status == 1){
                                that.setData({
                                    receivePay: false,
                                    isWidth: true,
                                    isToBack: true,
                                    immediateUse: true,
                                    refundSchedule: true,
                                    hadHide: true
                                });
                            }else {
                                that.setData({
                                    btnTit: "已失效",
                                    isWidth: true,
                                    isToBack: true,
                                    immediateUse: true,
                                    refundSchedule: true,
                                    hadHide: false,
                                    receivePay:true
                                });
                            }

                        }
                    }
                    var tips = data.tips || [];
                    if (tips.length>0){
                        for (var i = 0; i<tips.length; i++){
                            var tit = tips[i].title.toString();
                            if(tit.indexOf('useEndTime') > 0){
                                tips[i].title = tit.replace('{useEndTime}',data.consumeInfo.useEndTime);
                                tips[i].introduction=tips[i].introduction.replace('{useStatTime}',data.consumeInfo.useStartTime);
                                tips[i].introduction=tips[i].introduction.replace('{useEndTime}',data.consumeInfo.useEndTime);
                            }
                        }
                    }
                    data.tips = tips;
                    that.setData({
                        buyDetail: data,
                        isId: 'fee'
                    });
                })
        }
        if (option.giftId) {      // 积分券详情
            pathList = 'mixc/api/v1/gift/couponinfo/' + option.exchangeCode;
            app.getData(pathList, detailsList, function (res) {
                var data = JSON.parse(res).data;
                that.setData({
                    giftDetail: data,
                    isId: 'coin'
                });
            })
        }
    },
    /*购买券立即购买*/
    toBuy: function () {
        var token = wx.getStorageSync('token') || '';
        if (token) {
            this.setData({
                feeHidden: false,
            });
        } else {
            this.setData({
                bombHidden: false
            })
        }
    },
    /*关闭*/
    toClose: function () {
        this.setData({
            coinHidden: true,
            feeHidden: true,
        });
    },
    /*购买券确认支付*/
    submitPay: function (e) {
        var that = this;
        var orderNo = e.currentTarget.dataset.orderno;
        var token = wx.getStorageSync('token') || '';
        var openId = wx.getStorageSync('openid');
        if (token) {
            var dataList = {
                'orderNo': orderNo,
                /*'numb': 1,*/
                'payType': 4,
                'token': token,
                //'method': 'post',
                'mallNo': app.globalData.mallNo,
                'platform': 'wxa',
                'openId': openId
            }
            var pathList = 'mixc/api/v1/pay/topay';
            app.getData(pathList, dataList, function (res) {
                var data = JSON.parse(res);
                if (data.code === '0') {
                    var wxRequest = JSON.parse(data.data.payData);
                    that.setData({
                        feeHidden: false,
                        orderNo: data.data.orderNo,
                        wxRequest: wxRequest
                    });
                    wx.requestPayment({
                        'timeStamp': wxRequest.timeStamp,
                        'nonceStr': wxRequest.nonceStr,
                        'package': wxRequest.package,
                        'signType': wxRequest.signType,
                        'paySign': wxRequest.paySign,
                        'success': function (res) {
                            var dataList = {
                                'orderNo': data.data.orderNo,
                                'payType': 4,
                                'token': token,
                                'mallNo': app.globalData.mallNo,
                            }
                            var pathList = 'mixc/api/v3/pay/verifyResult'
                            app.getData(pathList, dataList, function (res) {
                                that.setData({
                                    feeHidden: true,
                                    immediateUse:false,
                                    receiveHide:true,
                                    receivePay:true
                                })
                                wx.showToast({
                                    title: '支付成功！',
                                    duration: 2000
                                });
                            })
                        },
                        'fail': function (res) {
                            console.log(wxRequest.timeStamp)
                        }
                    })
                } else {
                    wx.showToast({
                        title: data.message,
                        duration: 2000
                    })
                }
            })
        }
    },
    /*跳转至卖家中心*/
    toSeller: function (e) {
        var that = this;
        var scope = e.currentTarget.dataset.scope;
        var id = '',bizType = '';// 购买传10，其他传20
        if(e.currentTarget.dataset.id){id=e.currentTarget.dataset.id;bizType = 20}   // 免费
        if(e.currentTarget.dataset.gbid){id=e.currentTarget.dataset.gbid;bizType = 10}  // 购买
        if(e.currentTarget.dataset.giftId){id=e.currentTarget.dataset.giftId;bizType = 20}  // 积分
        if (scope > 1) {
            wx.navigateTo({
                url: '../seller/seller?id=' + id + '&bizType='+ bizType
            });
        }
    },
    toLoad: function (e) {
        var data = e.target.dataset.name;
        wx.navigateTo({
            url: '../load/load?data='+data
        });
    },
    /*退款*/
    toBack: function (e) {
        this.setData({
            isBack: false,
        });
    },
    /*退出退款*/
    closeBack: function () {
        this.setData({
            isBack: true,
        });
    },
    /*确认退款*/
    sureBack: function (e) {
        /*退款申请成功提示*/
        var that = this;
        var token = wx.getStorageSync('token');
        var order = e.currentTarget.dataset.orderno;
        var detailsList = {
            'reasonType': 1, // 退款类型
            'reasonContent': '',     // 退款理由
            'token': token,
            'orderNo': order,    // 订单编号
            'mallNo': app.globalData.mallNo
        }
        var pathList = 'mixc/api/v1/order/applyRefund';
        app.getData(pathList, detailsList, function (res) {
            var data = JSON.parse(res);
            var backMessage = data.message;
            console.log(backMessage);
            if (data.code == 0) {
                console.log(data);
                wx.showToast({
                    title: '退款申请成功',
                    duration: 2000
                })
                wx.navigateBack({
                    delta: 1
                })
                that.setData({
                    isBack: true,
                });
            } else {
                wx.showModal({
                    title: '提示',
                    content: backMessage,
                    showCancel: false
                })
            }
        })
    },

    /*跳转至退款详情*/
    toRefundDetails: function (e) {
        var that = this
        var refunds = e.currentTarget.dataset.refunds;
        console.log(refunds);
        wx.navigateTo({
            url: '../refundDetail/refundDetail?refunds=' + refunds
        });

    },
})
