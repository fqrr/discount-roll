//index.js
//获取应用实例
var app = getApp();
Page({
    data: {
        src: '../img/banner.jpg',
        bombHidden: true,
        countVal:'发送验证码',
        mobile:'',
        countNum:'',

        currentTab:0,
        countDisabled:false,
        loginDisabled:false,
        free:{},    //  免费领取
        freeAm:[],  // 模拟分页数据
        freePage:1, // 模拟分页默认页

        coin:{},    //  积分领取
        coinAm:[],  // 模拟分页数据
        coinPage:1, // 模拟分页默认页

        fee:{},    //  付费领取
        feeAm:[],   // 模拟分页数据
        feePage:1,  // 模拟分页默认页
        array: [{
            message: 'foo',
        }, {
            message: 'bar'
        }],

        scrollVal:[],
        pageSize:1000,     // 列表每页展示数量
        toView: 'one',
        oneLocation:'',
        twoLocation:'',
        threeLocation:'',
    },
    onShow: function () {
        var that = this;
        var detailsList= {
            'type':'list',
            'mallNo':app.globalData.mallNo,
            'pageNum':1,
            'pageSize':this.data.pageSize
        }
        var freesList = 'mixc/api/v2/coupon/list';
        var coinsList = 'mixc/api/v1/gift/querylist';
        var feesList = 'mixc/api/v1/groupbuy/onsalelist';
        app.getData(freesList, detailsList,function (res) {     // 免费券
            var data = JSON.parse(res);
            var list = data.data || [];
            var pageList = [] ;
            for (var j = 0;j<that.data.freePage*8;j++){ // 模拟分页显示
                if (list[j]){
                    pageList.push(list[j]);
                }
            }
            that.data.free.list = pageList;
            that.data.free.total = list.length;
            that.data.free.pages = Math.ceil (list.length/8);
            that.setData({
                freeAm:list,
                free: that.data.free,
            });
        });
        app.getData(coinsList, detailsList,function (res) {     // 积分券
            var data = JSON.parse(res).data;
            var list = [];
            that.data.coin = data;
            var lists = data.list;
            for (var i=0;i<lists.length;i++){   // 过滤券
                var tit = lists[i].giftName;
                var titBu = tit.substring((tit.length-1),tit.length);
                if(titBu === '券'){
                    list.push(lists[i]);
                }
            }
            var pageList = [] ;
            for (var j = 0;j<that.data.coinPage*8;j++){ // 模拟分页显示
                if (list[j]){
                    pageList.push(list[j]);
                }
            }
            that.data.coin.list = pageList;
            that.data.coin.total = list.length;
            that.data.coin.pages = Math.ceil (list.length/8);
            that.setData({
                coinAm:list,
                coin: that.data.coin,
            });
        });
        app.getData(feesList, detailsList,function (res) {  // 购买券
            var data = JSON.parse(res).data;
            var list = [];
            that.data.fee = data;
            var lists = data.list;
            for (var i=0;i<lists.length;i++){
                var tit = lists[i].title;
                var titBu = tit.substring((tit.length-1),tit.length);
                if(titBu === '券'){
                    list.push(lists[i]);
                }
            }
            var pageList = [] ;
            for (var j = 0;j<that.data.feePage*8;j++){ // 模拟分页显示
                if (list[j]){
                    pageList.push(list[j]);
                }
            }
            that.data.fee.list = pageList;
            that.data.fee.total = list.length;
            that.data.fee.pages = Math.ceil (list.length/8);
            that.setData({
                feeAm:list,
                fee:that.data.fee
            });
        });
    },
    feeMore:function () {   // 购买券加载更多
        if(this.data.feePage >= this.data.fee.pages){
            return false;
        }
        this.data.feePage = app.morePage(this,this.data.feePage,this.data.feeAm,this.data.fee);
        this.setData({
            feePage:this.data.feePage,
            fee: this.data.fee,
        });
    },
    coinMore:function () {   // 积分券加载更多
        if(this.data.coinPage >= this.data.coinPage.pages){
            return false;
        }
        this.data.coinPage = app.morePage(this,this.data.coinPage,this.data.coinAm,this.data.coin);
        this.setData({
            coinPage:this.data.coinPage,
            coin: this.data.coin,
        });
    },
    freeMore:function () {  // 免费加载更多
        if(this.data.freePage >= this.data.free.pages){
            return false;
        }
        this.data.freePage = app.morePage(this,this.data.freePage,this.data.freeAm,this.data.free);
        console.log(this.data.free)
        this.setData({
            freePage:this.data.freePage,
            free: this.data.free,
        });
    },
    // 点击tab切换
    swichNav: function (e) {
        var that = this;
        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            that.setData({
                currentTab: e.target.dataset.current
            })
        }
        var _id = e.target.dataset.id;
        this.setData({
            toView: _id
        })
    },

    swiChange:function (e) {   // 滚动事件
        var scrollTop= e.detail.scrollTop;
        var query = wx.createSelectorQuery();
        var that = this;
        /*query.select('#one').boundingClientRect(function(rect){
            console.log(rect.top+"/--top--1");
            console.log(rect.bottom+"/----1");
            /!*that.setData({
                oneLocation:rect.bottom
            });*!/
        }).exec();
        query.select('#two').boundingClientRect(function(rect){
           console.log(rect.bottom+"/----2");
            /!*that.setData({
                twoLocation:rect.bottom
            });*!/
        }).exec();
        query.select('#three').boundingClientRect(function(rect){
           console.log(rect.bottom+"/----3");
           /!* that.setData({
                threeLocation:rect.bottom
            });*!/
        });
        console.log(this.data.oneLocation+"--1--"+scrollTop)
        console.log(this.data.twoLocation+"--2--"+scrollTop)
        console.log(this.data.threeLocation+"--3--"+scrollTop)*/

        /*if (scrollTop < this.data.oneLocation && scrollTop >this.data.twoLocation){
            that.setData({
                currentTab: 0
            })
        }
        if (scrollTop < this.data.twoLocation && scrollTop > this.data.threeLocation){
            that.setData({
                currentTab: 1
            })
        }
        if (scrollTop < this.data.threeLocation ){
            that.setData({
                currentTab: 2
            })
        }*/
    },
    toLoad:function(e){
        var that = this;
        var token=wx.getStorageSync('token');
        if(token){
            that.setData({
                bombHidden: true,
            });
            /*跳转至下载页面*/
            wx.navigateTo({
                url: '../load/load'
            });
        }else{
            that.setData({
                bombHidden: false
            });
        }
    },
    /*获取到手机输入框的值*/
    mobileVal: function(e) {
        this.setData({
            mobile:e.detail.value
        })
    },
    mobileChange: function(e) {
        this.setData({
            mobile:e.detail.value
        })
    },
    /*获取到验证码的值*/
    codeChange:function(e) {
        this.setData({
            countNum:e.detail.value
        })
    },

    /*关闭蒙层*/
    bombClose: function(e) {
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
            this.setData({
                countDisabled:false
            });
            wx.showModal({
                title: '提示',
                content: "请输入正确的手机号码",
                showCancel:false
            })
            return false;
        }else {
            var that=this;
            var datasss= {
                'mob':that.data.mobile,
                'type':'31',
                'mallNo':app.globalData.mallNo
            }
            app.getData('mixc/api/v1/sendCheckCode', datasss,function (res) {
                var data = JSON.parse(res).data;
                console.log(data)
                if (data.code == 0){
                    wx.showModal({
                        title: '提示',
                        content: data.message,
                        showCancel:false
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
                                countDisabled:true
                            });
                        }
                    },1000);
                }
            })
        }
    },
    /*跳转至用户协议*/
    toService:function () {
        wx.navigateTo({
            url: '../service/service'
        });
    },
    /*登陆数据提交*/
    formSubmit: function(e) {
        var that = this;
        var formData = e.detail.value;
        var datas= {
            'userName':formData.mobile,
            'code': formData.countNum,
            'mallNo':app.globalData.mallNo
        }
        app.getData('mixc/api/v1/loginByCheckCode', datas,function (res) {
            var data = JSON.parse(res);
            if(data.code == 0){
                /*登陆成功提示*/
                wx.showToast({
                    title: '登陆成功',
                    duration: 2000
                });
                that.setData({
                    bombHidden: true
                });
                /*设置用户token*/
                wx.setStorageSync('token', data.data.token);
                wx.setStorageSync('userName',data.data.mobile);
                wx.setStorageSync('point',data.data.point);
            }else {
                var erro = data.message;
                wx.showModal({
                    title: '提示',
                    content: erro,
                    showCancel:false
                })
            }
        })
    }
})
