// pages/craftsman/craftsman.js
var common = require('../../utils/commonConfirm.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // random: wx.getStorageSync(getApp().globalData.appid),
    isPeopleShow: true,//点击手艺人模板页面
    // departmentName:'',//门店名称,上个页面穿过来的 
    isOk:true,//有数据，否则显示已满
    timeformat: '',
    toggleDay: '',
    craftData:[
      // {
      //   "id": 209,
      //   "username": "王晚霞",
      //   "departmentId": 10,
      //   "head": "http://image.beautysaas.com/xibao/face/5a9f67ee-d712-42e7-9e80-2705c244bad2"
      // },
      // {
      //   "id": 383,
      //   "username": "叶景美",
      //   "head": "http://image.beautysaas.com/xibao/face/81d965fe-727e-4b04-bbde-e547490f8cca"
      // }
    ],
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
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var that=this
    var timeformat = options.timeformat//
    var toggleDay = options.toggleDay//
    that.setData({
      timeformat: timeformat,
      toggleDay: toggleDay
    })
    // console.log(departmentId)
    //动态设置标题
    wx.setNavigationBarTitle({
      title: '选择手艺人'
      // title: '浙大店'
    })
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {//用户允许地图功能
        var latitude = res.latitude
        var longitude = res.longitude
        that.commonRequest(longitude, latitude)
      },
      fail: function () {//用户拒绝地图功能
        that.commonRequest()
      }
    })
    
  },
  //公共的请求
  commonRequest: function (longitude, latitude) {
    var that=this
    //初始化页面
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        console.log('页面获取到随机数为')
        console.log(res.data)
        var sendData
        if (!longitude) {
          sendData = {
            thirdSessionId: res.data,
            timeFormat: that.data.timeformat,
            day: that.data.toggleDay
          }
        } else {
          sendData = {
            thirdSessionId: res.data,
            timeFormat: that.data.timeformat,
            day: that.data.toggleDay,
            longitude: longitude,
            latitude: latitude
          }
        }
        wx.request({
          url: getApp().url + 'staff/getFreeStaff',
          method: 'POST',
          data: sendData,
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            wx.hideLoading();
            console.log(res.data)
            if (res.data.status === 200) {
              console.log(200)
              var dataList = res.data.data
              for (var i = 0; i < dataList.length; i++) {
                var curr = dataList[i]
                if (curr.distance >= 1000) {
                  curr.distanceChange = (curr.distance / 1000).toFixed(1)
                }
              }
              that.setData({
                craftData: dataList
              })
              if (res.data.data.length===0){
                that.setData({
                  isOk:false
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
            wx.hideLoading();
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
  //点击美容师
  selectClickPeople:function(e){
    var that=this
    var userId = e.currentTarget.dataset.id//获取员工id
    var scheduleId = e.currentTarget.dataset.scheduleid//
    var timeFormat = that.data.timeformat//
    // var avatarapp = e.currentTarget.dataset.avatarapp//获取员工图片

    // var departmentName = e.currentTarget.dataset.departmentname//获取员工所在门店名称
    //检查是否登录,登录返回登录信息 
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        console.log('页面获取到随机数为')
        console.log(res.data)
        wx.request({
          url: getApp().url + 'user/checkLogin',
          data: {
            thirdSessionId: res.data
          },
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            console.log(res)
            var obj = {};
            if (res.data.status === 200) {
              if (res.data.data.login) {//登录了,去核对信息页面
                wx.navigateTo({
                  url: '../checkinfo/checkinfo?userid=' + userId + '&scheduleid=' + scheduleId + '&timeformat=' + timeFormat,
                  success: function () {
                  }
                })
              } else if (!res.data.data.login) {//没登录，去登陆页面
                console.log('没登录了')
                wx.navigateTo({
                  url: '../login/login?userid=' + userId + '&scheduleid=' + scheduleId + '&timeformat=' + timeFormat + '&howto=' + true,
                  success: function () {
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
        console.log('页面获取随机数失败')
      }
    })
  },
  //点击去换时间按钮
  toTime:function(){
    //返回上一级页面
    wx.navigateBack({
      delta: 1,
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