//index.js
//获取应用实例
var app = getApp()
Page({
    data: {
        shops:{},
        list:[],
        pages:'',
        id:'',
        pageNum:1
    },
    //事件处理函数
    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onLoad: function (option) {
        var that = this;
        var id = option.id;
        var bizType = option.bizType;
        //调用应用实例的方法获取全局数据
        var pathList='mixc/api/v1/groupbuy/applyshop';
        var detailsList={
            'bizId':id,
            'bizType':bizType,
            'pageNum':1,
            'pageSize':12
        }
        app.getData(pathList, detailsList,function (res) {
            var data = JSON.parse(res).data;
            that.setData({
                shops:data,
                list:data.list,
                pages:data.pages,
                id:id
            })
        })
    },
    onReachBottom:function () {     // 下拉刷新
        var that = this;
        if (this.data.pageNum < this.data.pages){   // 判断是否小于最大页数
            this.data.pageNum++;
            var pathList='mixc/api/v1/groupbuy/applyshop';
            var detailsList={
                'bizId':this.data.id,
                'bizType':'20',
                'pageNum':this.data.pageNum,
                'pageSize':12
            }
            app.getData(pathList, detailsList,function (res) {
                var data = JSON.parse(res).data.list;
                for (var i =0;i<data.length;i++){
                    that.data.list.push(data[i]);
                }
                var nList = that.data.list;
                that.setData({
                    list:nList
                })
                wx.stopPullDownRefresh();
            })
        }
    }
})
