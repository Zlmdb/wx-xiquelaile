// pages/modifyName/modifyName.js
var common = require('../../utils/commonConfirm.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // random: wx.getStorageSync(getApp().globalData.appid),
    volidate:true,//初始时是禁用
    isMa:true,
    sendContent:'发送验证码',
    phoneValue:'',
    maValue:'',
    //toast默认不显示  
    isShowToast: false,
    isShowToastButton: false,
    count: 3000,
    toastText: '你好' 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
  onPullDownRefresh: function () {
    setTimeout(function () {
      wx.stopPullDownRefresh();
    }, 1000)
      
  },    

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  
  // },
  //手机号输入事件
  acceptValue:function(e){
    var value = e.detail.value;
    this.setData({
      phoneValue: value
    })
    // console.log(value)
    //如果手机号格式正确，发送验证码按钮解禁
    if(/^1[3|4|5|7|8][0-9]{9}$/.test(value)){
      // console.log("chenggong")
      this.setData({
        volidate: false
      })
    }else{
      this.setData({
        volidate: true
      })
    }
    //如果手机号格式正确，验证码格式也正确，确定按钮解禁
    if (/^1[3|4|5|7|8][0-9]{9}$/.test(value) && /^[0-9]{4}$/.test(this.data.maValue)) {
      // console.log("chenggong")
      this.setData({
        isMa: false
      })
    } else {
      this.setData({
        isMa: true
      })
    }
  },
  //验证码输入事件
  acceptValidate:function(e){
    var value = e.detail.value;
    this.setData({
      maValue: value
    })
    // console.log(value)
    //如果验证码格式也正确，手机号格式也正确，确定按钮解禁
    // if (this.data.volidate==false){
      // console.log("chenggong")
    if (/^[0-9]{4}$/.test(value) && /^1[3|4|5|7|8][0-9]{9}$/.test(this.data.phoneValue)) {
        console.log("chenggong")
        this.setData({
          isMa: false
        })
      } else {
        this.setData({
          isMa: true
        })
      }
    // }
  },
  //发送验证码按钮
  sendMa:function(){
    var that=this
    //禁用发送按钮，等倒数结束后，再启用
    this.setData({
      volidate: true
    });
    var time=60;
    console.log(time);
    var timer=setInterval(() => {
      
      time--;
      console.log(time);
      this.setData({
        sendContent: "剩余" + time + "秒"
      });
      if (time == 0) {
        this.setData({
          sendContent: "重新发送",
          volidate: false//可以点击了
        });
        clearInterval(timer);
        timer = 0;
        return 
      }
    },1000)
    // 发送验证码请求
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        console.log('页面获取到随机数为')
        console.log(res.data)
        wx.request({
          url: getApp().url + 'user/modifyMobileVerificationCode',
          method: 'POST',
          data: {
            thirdSessionId: res.data,
            mobile: that.data.phoneValue
          },
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            console.log(res)
            if (res.data.status === 200) {
              console.log(200)
              wx.showToast({
                title: '发送成功',
                icon: 'success',
                mask: true,
                duration: 1000
              })
            } else if (res.data.status === 400) {//失败
              console.log(400)
              var msg = res.data.msg
              //设置toast时间，toast内容  
              that.setData({
                count: 1000,
                toastText: msg
              });
              that.showToast();
            }
            common.status(res, that)//状态401和402

          },
          fail: function (res) {
            //设置toast时间，toast内容  
            that.setData({
              count: 2000,
              toastText: '网络错误'
            });
            that.showToast();
          }
        })
      },
      fail: function () {
        console.log('页面获取随机数失败')
      }
    })
    
  },
  //最下面确定按钮
  modifySuccess:function(){
    var that = this
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        console.log('页面获取到随机数为')
        console.log(res.data)
        wx.request({
          url: getApp().url + 'user/modifyMobile',
          data: {
            thirdSessionId: res.data,
            customerName: that.data.nameValue,
            mobile: that.data.phoneValue,
            verificCode: that.data.maValue
          },
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            console.log(res)

            //成功
            if (res.data.status === 200) {
              console.log(200)
              wx.showToast({
                title: '修改成功',
                icon: 'success',
                mask: true
              })
              wx.switchTab({
                url: '../personalCenter/personalCenter',
                success: function (res) {
                  wx.hideToast()
                },
                fail: function (res) { },
                complete: function (res) { },
              })
            } else if (res.data.status === 400) {//失败
              console.log(400)
              var msg = res.data.msg
              //设置toast时间，toast内容  
              that.setData({
                count: 2000,
                toastText: msg
              });
              that.showToast();
            }
            common.status(res, that)//状态401和402
          },
          fail: function (res) {
            //设置toast时间，toast内容  
            that.setData({
              count: 2000,
              toastText: '网络错误'
            });
            that.showToast();
          }
        })
      },
      fail: function () {
        console.log('页面获取随机数失败')
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
    var _this=this
    common.buttonConfirm(_this)
  },
  //提示框的去登陆按钮
  toAgainLogin: function () {
    var _this = this
    common.toAgainLogin(_this)
  }
})