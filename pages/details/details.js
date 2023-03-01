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
        feeHidden: true,   // 支付控制
        /*退款状态*/
        isBack: true,
        /*免费券*/
        shopInfo: {}, // 商家信息
        couponInfo: {}, // 商品信息
        cardLevel: [], // 卡级别
        countLimit:'',
        /*购买券*/
        buyDetail: {},
        /*积分券*/
        giftDetail: {},
        /*判断进来的是那种券*/
        isId: '',

        coinNum: 1, // 积分兑换默认值
        coinHidden: true,  // 显示积分兑换框

        myPoint: '', //  我的积分
        btnTit: '',  //  按钮文字

        orderNo: '',     // 支付订单
        wxRequest: {},   // 微信支付串
    },

    onLoad: function (option) {
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];  //当前页面
        var prevPage = pages[pages.length - 2]; //上一个页面
        console.log(pages);
        var that = this;
        var detailsList = {
            'mallNo': app.globalData.mallNo
        }
        var pathList = '';
        if (option.id) {     // 免费券详情
            pathList = 'mixc/api/v2/coupon/detail/' + option.id;
            detailsList.category = option.category; // 券类型
            app.getData(pathList, detailsList, function (res) {
                var data = JSON.parse(res).data;
                var may = ['V1_POINT_CARD', 'POINT_CARD', 'V2_POINT_CARD', 'V3_POINT_CARD', 'V3_GOLD_CARD', 'V3_PLATINUM_CARD'];
                var chMay = ['畅享卡', '买单测试卡级', '优享卡', '尊享卡', '尊享金卡', '尊享白金卡'];
                var cardLevels = [];
                var thisCard = data.couponInfo.cardLevels;
                for (var i = 0; i < thisCard.length; i++) {
                    for (var j = 0; j < may.length; j++) {
                        if (thisCard[i] === may[j]) {
                            cardLevels.push(chMay[j]);
                        }
                    }
                }
                that.setData({
                    shopInfo: data.shopInfo,
                    couponInfo: data.couponInfo,
                    cardLevel: cardLevels,
                    isId: 'free'
                });
                if(data.couponInfo.receiveStatus=== ''){
                    that.setData({
                        countLimit:'未开始',
                        hadHide:false,
                        receiveHide:true,
                        immediateUse:true
                    });
                }
                if(data.couponInfo.receiveStatus === '2'){
                    that.setData({
                        hadHide:true,
                        receiveHide:false,
                        immediateUse:true
                    });
                }
                if(data.couponInfo.receiveStatus === '3'){
                    that.setData({
                        countLimit:'已抢光',
                        hadHide:false,
                        receiveHide:true,
                        immediateUse:true
                    });
                }
                if(data.couponInfo.receiveStatus === '4'){
                    that.setData({
                        countLimit:'已领取',
                        hadHide:false,
                        receiveHide:true,
                        immediateUse:true
                    });
                }
                if(data.couponInfo.receiveStatus === '5'){
                    that.setData({
                        countLimit:'已过期',
                        hadHide:false,
                        receiveHide:true,
                        immediateUse:true
                    });
                }
            })
        }
        if (option.gbId) {        // 购买券详情
            pathList = 'mixc/api/v2/groupbuy/info';
            detailsList = {
                'gbId': option.gbId,
            }
            app.getData(pathList, detailsList, function (res) {
                var data = JSON.parse(res).data;
                if (data.status == 1) {
                    that.setData({
                        receiveHide: true,
                        immediateUse: true,
                        hadHide: false,
                        btnTit: '未开始'
                    });
                }
                if (data.status == 2) {
                    that.setData({
                        receiveHide: false,
                        immediateUse: true,
                        hadHide: true,
                    });
                }
                if (data.status == 3) {
                    that.setData({
                        receiveHide: true,
                        immediateUse: true,
                        hadHide: false,
                        btnTit: '已结束'
                    });
                }
                if (data.status == 4) {
                    that.setData({
                        receiveHide: true,
                        immediateUse: true,
                        hadHide: false,
                        btnTit: '已抢光'
                    });
                }
                that.setData({
                    buyDetail: data,
                    isId: 'fee'
                });
            })
        }
        if (option.giftId) {        // 积分券详情
            pathList = 'mixc/api/v2/gift/info';
            detailsList = {
                'giftId': option.giftId,
            }
            app.getData(pathList, detailsList, function (res) {
                var data = JSON.parse(res).data;
                that.setData({
                    giftDetail: data,
                    isId: 'coin'
                });
            })
        }
    },
    /*跳转至卖家中心*/
    toSeller: function (e) {
        var that = this;
        var scope = e.currentTarget.dataset.scope;
        var id = '',bizType = '';
        if(e.currentTarget.dataset.id){id=e.currentTarget.dataset.id;bizType = 20}   // 免费
        if(e.currentTarget.dataset.gbid){id=e.currentTarget.dataset.gbid;bizType = 10}  // 购买
        if(e.currentTarget.dataset.giftId){id=e.currentTarget.dataset.giftId;bizType = 20}  // 积分
        if (scope > 1) {
            wx.navigateTo({
                url: '../seller/seller?id=' + id + '&bizType='+ bizType
            });
        }
    },
    /*领取免费券*/
    toDraw: function (e) {
        var that = this;
        var token = wx.getStorageSync('token') || '';
        var cardLevel = wx.getStorageSync('cardLevel') || '';   // 获取用户级别
        var ids = this.data.couponInfo.id;
        if (token) {
            var memberPriceCardLevels = this.data.couponInfo.cardLevels || []; // 判断卡级别
            var flg = false;
            if(memberPriceCardLevels.length > 0){
                if(cardLevel){
                    memberPriceCardLevels.forEach(function (item) {
                        if (item === cardLevel){
                            flg = true;
                        }
                    });
                    if(!flg){
                        wx.showModal({
                            title: '提示',
                            content: "您当前卡级别不够",
                            showCancel:false
                        });
                        return false;
                    }
                }else {
                    wx.showModal({
                        title: '提示',
                        content: "您当前卡级别不够",
                        showCancel:false
                    });
                    return false;
                }
            }
            var category = e.target.dataset.category;
            var dataList = {
                'category': category,
                'isNewType': '0',
                'token': token,
                'mallNo': app.globalData.mallNo
            }
            var pathList = 'mixc/api/v2/coupon/get/' + ids
            app.getData(pathList, dataList, function (res) {
                var data = JSON.parse(res);
                if (data.code == 0) {
                    wx.showToast({  // 成功提示
                        title: data.message,
                        icon: 'success',
                        duration: 2000
                    });
                    /*that.setData({
                        receiveHide:true,
                        immediateUse:false
                    })*/
                    setTimeout(function () {
                        wx.reLaunch({
                            url: '../my/my'
                        });
                    },1000)
                }else {
                    wx.showModal({
                        title: '提示',
                        content: data.message,
                        showCancel:false
                    })
                }
            })
        } else {
            that.setData({
                bombHidden: false
            });
        }

    },
    /*兑换积分券按钮*/
    toExchange: function () {
        var token = wx.getStorageSync('token') || '';
        var cardLevel = wx.getStorageSync('cardLevel') || '';   // 获取用户级别
        if (token) {
            var memberPriceCardLevels = this.data.giftDetail.cardLevels || []; // 判断卡级别
            var flg = false;
            if(memberPriceCardLevels.length > 0){
                if(cardLevel){
                    memberPriceCardLevels.forEach(function (item) {
                        if (item === cardLevel){
                            flg = true;
                        }
                    });
                    if(!flg){
                        wx.showModal({
                            title: '提示',
                            content: "您当前卡级别不够",
                            showCancel:false
                        });
                        return false;
                    }
                }else {
                    wx.showModal({
                        title: '提示',
                        content: "您当前卡级别不够",
                        showCancel:false
                    });
                    return false;
                }
            }
            this.setData({
                coinHidden: false
            });
        } else {
            this.setData({
                bombHidden: false
            });
        }
    },
    /*兑换积分券减数量*/
    coinNumLeft: function () {
        if (this.data.coinNum <= 1) {
            return false
        } else {
            this.data.coinNum--;
            this.setData({
                coinNum: this.data.coinNum
            })
        }
    },
    /*兑换积分券加数量*/
    coinNumRight: function () {
        this.data.coinNum++;
        this.setData({
            coinNum: this.data.coinNum
        })
    },
    /*兑换积分券输入张数*/
    coinNum: function (e) {
        var val = parseInt(e.detail.value);
        this.setData({
            coinNum: val
        })
    },
    /*兑换积分券输入张数*/
    coinNumOver: function (e) {
        var val = parseInt(e.detail.value) || 1;
        this.setData({
            coinNum: val
        })
    },
    /*兑换积分券提交*/
    submitCoin: function (e) {
        var that = this;
        var ids = e.currentTarget.dataset.id;
        var token = wx.getStorageSync('token') || '';
        var dataList = {
            'giftId': ids,
            'count': this.data.coinNum,
            'token': token,
            'mallNo': app.globalData.mallNo
        }
        var pathList = 'mixc/api/v2/gift/exchange'
        app.getData(pathList, dataList, function (res) {
            var data = JSON.parse(res);
            if (data.code == 0) {
                /*领取成功提示*/
                wx.showToast({
                    title: '兑换成功',
                    duration: 1000
                });
                /*that.setData({
                    coinHidden: true,
                    receiveHide: true,
                    immediateUse: false,
                });*/
                setTimeout(function () {
                    wx.reLaunch({
                        url: '../my/my'
                    });
                },1000)
            } else {
                wx.showModal({
                    title: '提示',
                    content: data.message,
                    showCancel: false
                })
            }
        })
    },
    /*购买券立即购买*/
    toBuy: function () {
        var token = wx.getStorageSync('token') || '';
        var cardLevel = wx.getStorageSync('cardLevel') || '';
        if (token) {
            var memberPriceCardLevels = this.data.buyDetail.memeberPriceCardLevels || []; // 判断卡级别
            var flg = false;
            if(memberPriceCardLevels.length > 0){
                if(cardLevel){
                    memberPriceCardLevels.forEach(function (item) {
                        if (item === cardLevel){
                            flg = true;
                        }
                    });
                    if(!flg){
                        wx.showModal({
                            title: '提示',
                            content: "您当前卡级别不够",
                            showCancel:false
                        });
                        return false;
                    }
                }else {
                    wx.showModal({
                        title: '提示',
                        content: "您当前卡级别不够",
                        showCancel:false
                    });
                    return false;
                }
            }
            this.setData({
                feeHidden: false,
            });
        } else {
            this.setData({
                bombHidden: false
            })
        }
    },
    /*购买券确认支付*/
    submitPay: function (e) {
        var that = this;
        var ids = e.currentTarget.dataset.id;
        var token = wx.getStorageSync('token') || '';
        var openId = wx.getStorageSync('openid');
        if (token) {
            var dataList = {
                'gbId': ids,
                'numb': 1,
                'payType': 4,
                'token': token,
                'method': 'post',
                'mallNo': app.globalData.mallNo,
                'platform': 'wxa',
                'openId': openId
            }
            var pathList = 'mixc/api/v3/order/generateOrder'
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
                               /* that.setData({
                                    feeHidden: true,
                                    immediateUse:false,
                                    receiveHide:true
                                })*/
                                wx.showToast({
                                    title: '支付成功！',
                                    duration: 2000
                                });
                                setTimeout(function () {
                                    wx.reLaunch({
                                        url: '../my/my'
                                    });
                                },1000)
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
    /*关闭*/
    toClose: function () {
        this.setData({
            coinHidden: true,
            feeHidden: true,
        });
    },
    toLoad: function (e) {
        var data = e.target.dataset.name;
        wx.navigateTo({
            url: '../load/load?data='+data
        });
    },

    /*---------登陆--------------*/
    /*获取到手机输入框的值*/
    mobileVal: function (e) {
        this.setData({
            mobile: e.detail.value
        })
    },
    mobileChange: function (e) {
        this.setData({
            mobile: e.detail.value
        })
    },
    /*获取到验证码的值*/
    codeChange: function (e) {
        this.setData({
            countNum: e.detail.value
        })
    },
    /*手机输入框改变事件*/
    mobileClick: function () {
        this.setData({
            tipHidden: true,
        });
    },
    /*关闭蒙层*/
    bombClose: function (e) {
        this.setData({
            bombHidden: true
        });
    },
    /*倒计时*/
    countdown:function () {
        var that = this;
        var count = 60;
        var re=/^1[34578]\d{9}$/;
        if(!re.test(that.data.mobile)) {
            wx.showModal({
                title: '提示',
                content: "请输入正确的手机号码",
                showCancel:false
            })
            return false;
        }else {
            var datasss= {
                'mob':that.data.mobile,
                'type':'31',
                'mallNo':app.globalData.mallNo
            }
            app.getData('mixc/api/v1/sendCheckCode', datasss,function (res) {
                var data = JSON.parse(res);
                if (data.code == 0){
                    wx.showModal({
                        title: '提示',
                        content: data.message,
                        showCancel:false
                    });
                    that.setData({
                        countDisabled:true
                    });
                    var timer = setInterval(function () {
                        count--;
                        if(count<1){
                            that.setData({
                                countVal: '发送验证码',
                                countDisabled:false
                            });
                            clearInterval(timer);
                        }else{
                            that.setData({
                                countVal: count + 's后重发',
                            });
                        }
                    },1000);
                }
            })
        }
    },
    /*跳转至用户协议*/
    toService: function () {
        wx.navigateTo({
            url: '../service/service'
        });
    },
    /*登陆数据提交*/
    formSubmit: function (e) {
        var that = this;
        var formData = e.detail.value;
        var datas = {
            'userName': formData.mobile,
            'code': formData.countNum,
            'mallNo': app.globalData.mallNo
        }
        app.getData('mixc/api/v1/loginByCheckCode', datas, function (res) {
            var data = JSON.parse(res);
            if (data.code == 0) {
                /*登陆成功提示*/
                wx.showToast({
                    title: '登陆成功',
                    duration: 2000
                });
                that.setData({
                    bombHidden: true,
                    myPoint: data.data.point
                });
                /*设置用户token*/
                wx.setStorageSync('token', data.data.token);
                wx.setStorageSync('userName', data.data.mobile);
                wx.setStorageSync('point', data.data.point);
                if(data.data.bindCard){
                    wx.setStorageSync('cardLevel', data.data.bindCard.cardLevel);
                }
            } else {
                var erro = data.message;
                wx.showModal({
                    title: '提示',
                    content: erro,
                    showCancel: false
                })
            }
        })
    }
})
