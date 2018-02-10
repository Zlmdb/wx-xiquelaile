// pages/login/login.js
var common = require('../../utils/commonConfirm.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // random: wx.getStorageSync(getApp().globalData.appid),
    // 上一个页面传过来的参数,跳转到核对信息页面和我的页面用
    howTo:true,//true表示预约点击进来的，false表示登陆点击进来的
    //下面三个只有跳转到核对信息页面用
    userId: 0,//技师id
    scheduleId:0,//排班id
    timeFormat: '',//预约时间块，逗号隔开
    //传值结束
    volidate: true,//初始时是禁用
    isMa: true,
    sendContent: '发送验证码',
    nameValue:'',
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
    var howTo=options.howto;
    //下面三个参数从登陆页面进来不传，从首页的马上预约和排班页的确定进来才有
    var userId = options.userid;
    var scheduleId = options.scheduleid;
    var timeFormat = options.timeformat;
    this.setData({
      howTo:howTo,
      userId: userId,
      scheduleId: scheduleId,
      timeFormat: timeFormat
    })
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
  //姓名输入事件
  acceptName: function (e) {
    var value = e.detail.value;
    this.setData({
      nameValue: value
    })
    //判断姓名不能为空和不能有空格，同时判断手机号格式和验证码格式，来解禁确定按钮
    var regu = "^[ ]+$"; var re = new RegExp(regu);
    if (value.length !== 0 && !re.test(value) && /^1[3|4|5|7|8][0-9]{9}$/.test(this.data.phoneValue) && /^[0-9]{4}$/.test(this.data.maValue)) {
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
  //手机号输入事件
  acceptPhone: function (e) {
    var value = e.detail.value;
    this.setData({
      phoneValue: value
    })
    // console.log(value)
    //判断手机号格式是否正确，来解禁发送验证码按钮
    if (/^1[3|4|5|7|8][0-9]{9}$/.test(value)) {
      // console.log("chenggong")
      this.setData({
        volidate: false
      })
    } else {
      this.setData({
        volidate: true
      })
    }

    //判断姓名不能为空和不能有空格，同时判断手机号格式和验证码格式，来解禁确定按钮
    var regu = "^[ ]+$"; var re = new RegExp(regu);
    if (this.data.nameValue.length !== 0 && !re.test(this.data.nameValue) && /^1[3|4|5|7|8][0-9]{9}$/.test(value) && /^[0-9]{4}$/.test(this.data.maValue)) {
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
  acceptValidate: function (e) {
    var value = e.detail.value;
    this.setData({
      maValue: value
    })
    //判断姓名不能为空和不能有空格，同时判断手机号格式和验证码格式，来解禁确定按钮
    var regu = "^[ ]+$"; var re = new RegExp(regu);
    if (this.data.nameValue.length !== 0 && !re.test(this.data.nameValue) && /^1[3|4|5|7|8][0-9]{9}$/.test(this.data.phoneValue) && /^[0-9]{4}$/.test(value)) {
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
  //发送验证码按钮
  sendMa:function () {
    var that=this
    //禁用发送按钮，等倒数结束后，再启用
    this.setData({
      volidate: true
    });
    var time = 60;
    // console.log(time);
    //倒计时，并改变内容
    var timer = setInterval(() => {
      time--;
      // console.log(time);
      this.setData({
        sendContent: "剩余" + time + "秒"
      });
      if (time == 0) {
        clearInterval(timer)
        this.setData({
          sendContent: "重新发送",
          volidate: false//可以点击了
        });
        clearInterval(timer)
        timer = 0;
        return
      }
    }, 1000)
    // 发送验证码请求
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        // console.log('登录页获取到随机数为')
        // console.log(res.data)
        //检查是否登录,登录返回登录信息 
        wx.request({
          url: getApp().url + 'user/getVerificationCode',
          method: 'POST',
          data: {
            thirdSessionId: res.data,
            mobile: that.data.phoneValue
          },
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            console.log('点击发送验证码成功')
            console.log(res)
            console.log(res.status)
            if (res.data.status===200){
              //设置toast时间，toast内容  
              wx.showToast({
                title: '发送成功',
                icon: 'success',
                mask: true,
                duration: 1000
              })
            } else if (res.data.status === 400){
              //设置toast时间，toast内容  
              var msg = res.data.msg
              that.setData({
                count: 1000,
                toastText: msg
              });
              that.showToast();
            }
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
        console.log('登录页获取随机数失败')
      }
    })
   
  },
  //最下面确定按钮
  modifySuccess: function () {
    var that=this
    // console.log(123)
    // 发送所有信息去服务器验证
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        // console.log('登录页获取到随机数为')
        // console.log(res.data)
        wx.request({
          url: getApp().url + 'user/login',
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
              // console.log(200)
              // wx.setStorageSync(that.data.random + 'CustomerId', res.data.data.id)//存用户id
              // wx.setStorageSync(getApp().globalData.appid + 'CustomerId', res.data.data.id)//存用户id
              var howTo = that.data.howTo
              // console.log('howto' + typeof (howTo))
              var url = ""
              if (howTo === 'true') {
                var userId = that.data.userId
                var scheduleId = that.data.scheduleId
                var timeFormat = that.data.timeFormat
                url = "../checkinfo/checkinfo?userid=" + userId + '&scheduleid=' + scheduleId + '&timeformat=' + timeFormat//跳转到核对预约信息
                wx.redirectTo({//因为这个页面是个中间人，跳转后要把这个页面删除掉
                  url: url,
                  success: function (res) {
                    // clearInterval(timer)
                  },
                  fail: function (res) { },
                  complete: function (res) { },
                })
              } else if (howTo === 'false') {
                url = "../personalCenter/personalCenter"//跳转到我的页面
                wx.switchTab({
                  url: url,
                  success: function (res) {
                    // clearInterval(timer)
                  }
                })
              }


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
        console.log('登录页获取随机数失败')
      }
    })
    
  },
  //显示自定义提示框
  showToast: function () {
    var _this = this;
    common.showToast(_this)
  },
  //提示框的确定按钮
  buttonConfirm:function(){
    var _this = this
    common.buttonConfirm(_this)
  },
  //提示框的去登陆按钮
  toAgainLogin:function(){
    var _this = this
    common.toAgainLogin(_this)
  }
})