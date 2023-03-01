//index.js
//获取应用实例
var app = getApp()
Page({
    data: {
        winWidth: 0,
        winHeight: 0,
        // tab切换
        currentTab: 0,
        // 是否有卡券
        noCardOne: true,
        noCardTwo: true,
        loginMobile: '',
        point: '',
        src: '../img/noCard.png',   // 没有卡券时默认的地址

        /*头部登陆提示*/
        topLogin: false,

        /*登陆弹框*/
        bombHidden: true,
        countVal: '发送验证码',
        mobile: '',
        countNum: '',

        countDisabled: false,
        loginDisabled: false,
        /*购买券列表*/
        fee: {},    // 购买券
        feeAm:[],   // 所有购买券
        feePage:1,  // 购买券页码
        unFee: {}, // 已失效购买券
        allUnFee:[],  // 所有已失效购买券
        unFeePage:1,    // 所有已失效购买券页码
        /*积分券列表*/
        coin:{},    //  积分领取
        coinAm:[],
        coinPage:1,
        unCoin: {}, // 已失效积分券
        allUnCoin:[],  // 所有已失效积分券
        unCoinPage:1,    // 所有已失效积分券页码
        /*免费券*/
        free:{},    //  免费券领取
        freeAm:[],
        freePage:1,
        unFree: {}, // 已失效积分券
        allUnFree:[],  // 所有已失效积分券
        unFreePage:1,    // 所有已失效积分券页码

        total:'',  // 总页数
        timer:null,
        codeType:'购买券'
    },
    onShow: function () {
        var token = wx.getStorageSync('token') || '';
        var userName = wx.getStorageSync('userName') || '';
        var that = this;
        if (token) {
            this.queryList(that,token);
            that.setData({
                topLogin: false,
                bombHidden: true,
                loginMobile:userName,
            });
        } else {
            that.setData({
                topLogin: true,
                bombHidden: false,
                fee:{},
                coin:{},
                free:{},
            });
        }
    },
    queryList:function (obj,token) {    // 查询
        /*查询我的购买券列表*/
        var that=this;
        var feeMy='mixc/api/v2/order/list';
        var feeDataMy= {
            'mallNo':app.globalData.mallNo,
            'token':token,
            'pageNum':1,
            'pageSize':1000
        }
        app.getData(feeMy,feeDataMy,function (res) {
            var data = JSON.parse(res).data;
            var list = [];  // 保存所有有效券ps:带‘券’字的
            var unList = [];  // 保存所有有效券ps:带‘券’字的
            obj.data.fee = data;
            var lists = data.list;
            for (var i=0;i<lists.length;i++){   // 过滤券
                var tit = lists[i].title;
                var titBu = tit.substring((tit.length-1),tit.length);
                if(titBu === '券'){
                    if (lists[i].status === '2'){
                        list.push(lists[i]);
                    }else if(lists[i].status === '10'){
                        list.push(lists[i]);
                        that.codeType="购买券"
                    } else {
                        unList.push(lists[i]);
                        that.codeType="已驳回"
                    }
                }
            }
            var pageList = [] ;
            for (var j = 0;j<obj.data.feePage*8;j++){ // 模拟分页显示
                if (list[j]){
                    pageList.push(list[j]);
                }
            }
            var unPageList = [] ;
            for (var j = 0;j<obj.data.unFeePage*8;j++){ // 模拟分页显示
                if (unList[j]){
                    unPageList.push(unList[j]);
                }
            }
            obj.data.fee.list = pageList;
            obj.data.fee.total = list.length;
            obj.data.fee.pages = Math.ceil (list.length/8);
            obj.data.unFee.list = unPageList;   // 设置失效券列表数据
            obj.data.unFee.total = unList.length;   // 设置失效券总数
            obj.data.unFee.pages = Math.ceil(unList.length/8); // 设置失效券总页数
            obj.setData({
                unFee:obj.data.unFee,
                allUnFee:unList,
                fee: obj.data.fee,
                feeAm:list,
            });

        });
        /*查询我的积分券列表*/
        var coinMy='mixc/api/v2/gift/usergiftlist';
        var coinDataMy= {
            'mallNo':app.globalData.mallNo,
            'token':token,
            'pageNum':1,
            'pageSize':1000
        }
        app.getData(coinMy,coinDataMy,function (res) {
            var data = JSON.parse(res).data;
            var list = [];  // 保存所有有效券ps:带‘券’字的
            var unList = [];  // 保存所有有效券ps:带‘券’字的
            obj.data.coin = data;
            var lists = data.list;
            for (var i=0;i<lists.length;i++){   // 过滤券
                var tit = lists[i].giftName;
                var titBu = tit.substring((tit.length-1),tit.length);
                if(titBu === '券'){
                    if (lists[i].exchangeState === '1'){
                        list.push(lists[i]);
                    }else {
                        unList.push(lists[i]);
                    }
                }
            }
            var pageList = [] ;
            for (var j = 0;j<obj.data.coinPage*8;j++){ // 模拟分页显示
                if (list[j]){
                    pageList.push(list[j]);
                }
            }
            var unPageList = [] ;
            for (var j = 0;j<obj.data.unCoinPage*8;j++){ // 模拟分页显示
                if (unList[j]){
                    unPageList.push(unList[j]);
                }
            }
            obj.data.coin.list = pageList;
            obj.data.coin.total = list.length;
            obj.data.coin.pages = Math.ceil (list.length/8);
            obj.data.unCoin.list = unPageList;   // 设置失效券列表数据
            obj.data.unCoin.total = unList.length;   // 设置失效券总数
            obj.data.unCoin.pages = Math.ceil(unList.length/8); // 设置失效券总页数
            obj.setData({
                unCoin:obj.data.unCoin,
                allUnCoin:unList,
                coin: obj.data.coin,
                coinAm:list,
            });
        });
        /*查询我的免费券列表*/
        var pathMy='mixc/api/v2/coupon/mine'
        var dataMy= {
            'pageNum':1,
            'token':token,
        }
        app.getData(pathMy,dataMy,function (res) {
            var data = JSON.parse(res).data;
            if (!data.list){data.list = []}
            var list = [];  // 保存所有有效券ps:带‘券’字的
            var unList = [];  // 保存所有有效券ps:带‘券’字的
            obj.data.free = data;
            var lists = data.list;
            for (var i=0;i<lists.length;i++){   // 过滤券
                var tit = lists[i].status;
                if(tit === 'unused'){
                    list.push(lists[i]);
                }else {
                    unList.push(lists[i]);
                }
            }
            var pageList = [] ;
            for (var j = 0;j<obj.data.freePage*8;j++){ // 模拟分页显示
                if (list[j]){
                    pageList.push(list[j]);
                }
            }
            var unPageList = [] ;
            for (var j = 0;j<obj.data.unFreePage*8;j++){ // 模拟分页显示
                if (unList[j]){
                    unPageList.push(unList[j]);
                }
            }
            obj.data.free.list = pageList;
            obj.data.free.total = list.length;
            obj.data.free.pages = Math.ceil (list.length/8);
            obj.data.unFree.list = unPageList;   // 设置失效券列表数据
            obj.data.unFree.total = unList.length;   // 设置失效券总数
            obj.data.unFree.pages = Math.ceil(unList.length/8); // 设置失效券总页数
            obj.setData({
                unFree:obj.data.unFree,
                allUnFree:unList,
                free: obj.data.free,
                freeAm:list,
            });
        });
        /*查询我的个人资料*/
        var myInfo='mixc/api/v2/member/getPersonalData';
        var myData= {
            'token':token,
            'mallNo':app.globalData.mallNo
        }
        app.getData(myInfo,myData,function (res) {
            var data = JSON.parse(res).data;
            if(data.bindCard){
                wx.setStorageSync('cardLevel', data.bindCard.cardLevel);
            }
            obj.setData({
                point:data.point
            })
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
    unFeeMore:function () {   // 失效购买券加载更多
        if(this.data.unFeePage >= this.data.unFee.pages){
            return false;
        }
        this.data.unFeePage = app.morePage(this,this.data.unFeePage,this.data.allUnFee,this.data.unFee);
        this.setData({
            unFeePage:this.data.unFeePage,
            unFee: this.data.unFee,
        });
    },
    coinMore:function () {   // 积分券加载更多
        if(this.data.coinPage >= this.data.coin.pages){
            return false;
        }
        this.data.coinPage = app.morePage(this,this.data.coinPage,this.data.coinAm,this.data.coin);
        this.setData({
            coinPage:this.data.coinPage,
            coin: this.data.coin,
        });
    },
    unCoinMore:function () {   // 积分券加载更多
        if(this.data.unCoinPage >= this.data.unCoin.pages){
            return false;
        }
        this.data.unCoinPage = app.morePage(this,this.data.unCoinPage,this.data.allUnCoin,this.data.unCoin);
        this.setData({
            unCoinPage:this.data.unCoinPage,
            unCoin: this.data.unCoin,
        });
    },
    freeMore:function () {   // 免费券加载更多
        if(this.data.freePage >= this.data.free.pages){
            return false;
        }
        this.data.freePage = app.morePage(this,this.data.freePage,this.data.freeAm,this.data.free);
        this.setData({
            freePage:this.data.freePage,
            free: this.data.free,
        });
    },
    unFreeMore:function () {   // 免费券加载更多
        if(this.data.unFreePage >= this.data.unFree.pages){
            return false;
        }
        this.data.unFreePage = app.morePage(this,this.data.unFreePage,this.data.allUnFree,this.data.unFree);
        this.setData({
            unFreePage:this.data.unFreePage,
            unFree: this.data.unFree,
        });
    },
    bindChange: function (e) {
        var that = this;
        that.setData({currentTab: e.detail.current});
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
    },

    /*退出*/
    quit: function () {
        var that = this;
        wx.showModal({
            title: "您确定退出登陆吗？",
            success: function (res) {
                if (res.confirm) {
                    clearInterval(that.timer);
                    that.setData({
                        countVal: '发送验证码',
                        countDisabled:false
                    });
                    wx.removeStorageSync('token')
                    wx.removeStorageSync('userName')
                    wx.removeStorageSync('point');
                    that.onShow();
                }
            }
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
                    that.timer = setInterval(function () {
                        count--;
                        if(count<1){
                            that.setData({
                                countVal: '发送验证码',
                                countDisabled:false
                            });
                            clearInterval(that.timer);
                        }else{
                            that.setData({
                                countVal: count + 's后重发',
                            });
                        }
                    },1000);
                }else {
                    wx.showModal({
                        title: '提示',
                        content: data.message,
                        showCancel:false
                    });
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
                    bombHidden: false
                });
                /*设置用户token*/
                wx.setStorageSync('token', data.data.token);
                wx.setStorageSync('userName',data.data.mobile);
                wx.setStorageSync('point',data.data.point);
                if(data.data.bindCard){
                    wx.setStorageSync('cardLevel', data.data.bindCard.cardLevel);
                }
                that.onShow();
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

