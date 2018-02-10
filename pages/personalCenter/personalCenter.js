// pages/personalCenter/personalCenter.js
var common = require('../../utils/commonConfirm.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // random: wx.getStorageSync(getApp().globalData.appid),
    isLogin:true,
    avatarUrl:'../../image/login.png',
    maxname:"",//姓名截取之后的值
    customInfo:{
      name: '',
      mobile: 0
    },
    //toast默认不显示  
    isShowToast: false,
    isShowToastButton: false,
    count: 3000,
    toastText: '你好' 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    // that.setData({//进来就先隐藏掉
    //   isLogin: true//隐藏姓名和手机号
    // })
    // console.log('个人中心的onshow触发了')
    // console.log('获取所有缓存')
    // console.log(wx.getStorageInfoSync())
    //获取微信图像
    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        var avatarUrl = userInfo.avatarUrl
        that.setData({
          avatarUrl: avatarUrl
        })
        console.log(avatarUrl)
      },
      fail:function(){
        console.log('获取图像失败')
      }
    })
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        console.log('个人中心获取到随机数为')
        console.log(res.data)
        //检查是否登录,登录返回登录信息 
        wx.request({
          url: getApp().url + 'user/checkLogin',
          data: {
            thirdSessionId: res.data
          },
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            // console.log(res)
            var obj = {};
            if (res.data.status === 200) {

              if (res.data.data.login) {//登录了
                console.log('登录了')
                var name = res.data.data.name
                var mobile = res.data.data.mobile
                var customId = res.data.data.id
                if (name.length>4){//大于四，就有截取之后的值，否者，没有值
                    that.setData({
                      maxname:name.substr(0,4)
                    })
                }else{
                  that.setData({
                    maxname: ""
                  })
                }
                that.setData({
                  isLogin: false,//显示姓名和手机号
                  customInfo: {
                    name: name,
                    mobile: mobile
                  }
                })
              } else if (!res.data.data.login) {//没登录
                console.log('没登录')
                that.setData({
                  isLogin: true//隐藏姓名和手机号
                })
              }
            } else if (res.data.status === 400) {//失败
              console.log(400)
              var msg = res.data.msg
              //设置toast时间，toast内容  
              that.setData({
                count: 2000,
                toastText: msg,
                isLogin: true//隐藏姓名和手机号
              });
              that.showToast();
            }
            common.status(res, that)//状态401和402   
          },
          fail: function (res) {
            //设置toast时间，toast内容  
            that.setData({
              count: 2000,
              toastText: '网络错误',
              isLogin: true//隐藏姓名和手机号
            });
            that.showToast();
          }
        })
      },
      fail:function(){
        console.log('个人中心获取随机数失败')
      }
    })
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh:function () {
    setTimeout(function () {
      wx.stopPullDownRefresh();
    }, 1000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom:function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage:function () {

  // },
  //点击登录
  tologin:function(){
    wx.navigateTo({
      url: '../login/login?howto='+false,
      success: function(res) {
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  //查看订单
  toOrder:function(){
    var that=this
    if (!that.data.isLogin){//登录了
      wx.navigateTo({
        url: '../order/order',
        success: function (res) {
        },
        fail: function (res) { },
        complete: function (res) { },
      })
    }else{//没登录
      //设置toast时间，toast内容  
      that.setData({
        count: 2000,
        toastText: '请先登录'
      });
      that.showToast();
    }
  },
  //联系客服
  makePhoneCall:function(){
    var that=this
    wx.makePhoneCall({
      phoneNumber: '4008860225',
      success:function(){

      },
      fail:function(){
        // //设置toast时间，toast内容  
        // that.setData({
        //   count: 5000,
        //   toastText: '如果联系客服，必须先授权拨打电话功能'
        // });
        // that.showToast();
      }
    })
  },
  //修改姓名
  // toModifyName:function(){
  //   var that=this
  //   wx.navigateTo({
  //     url: '../modifyName/modifyName?name=' + that.data.customInfo.name,
  //     success: function (res) {
  //     },
  //     fail: function (res) { },
  //     complete: function (res) { },
  //   })
  // },
  //修改手机号
  toModifyPhone:function(){
    var that=this
    wx.navigateTo({
      url: '../modifyPhone/modifyPhone?mobile=' + that.data.customInfo.mobile,
      success: function (res) {
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //门店导航
  tostoreDistribution:function(){
    wx.navigateTo({
      url: '../storeDistribution/storeDistribution?fromWhere=false',
      success: function () {
      }
    })
  },
  //显示自定义提示框
  showToast: function () {
    var _this = this;
    common.showToast(_this)
  },
  //提示框的确定按钮
  buttonConfirm: function () {
    var _this = this
    common.buttonConfirm(_this)
  },
  //提示框的去登陆按钮
  toAgainLogin: function () {
    var _this = this
    common.toAgainLogin(_this)
  }
})