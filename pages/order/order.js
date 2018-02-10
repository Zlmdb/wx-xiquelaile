// pages/order/order.js
var common = require('../../utils/commonConfirm.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // random: wx.getStorageSync(getApp().globalData.appid),
    status:1,//表示待服务
    pageNo: 1,//默认初始化是第一页
    totalPages: 0,
    listData: [
      // { "id": 1, "isOther": 0, "date": '10-30',"week":'周二', "departId": 10, "serviceStartTime": '11:59',"timePart":'中午', "departmentName": "浙大店", "isEvaluate": "y" },
      // { "id": 2, "date": '10-30', "week": '周四', "departId": 10, "serviceStartTime": '11:59', "timePart": '中午', "departmentName": "城西店", "isEvaluate": "n" }
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
    // console.log('触发了order的onLoad')
    
    
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
    console.log('订单页面的status')
    console.log(this.data.status)
    var pages = getCurrentPages()
    var currPage = pages[pages.length - 1]//当前页面
    console.log('订单页面获取上个页面的status')
    console.log(currPage.data.status)
    console.log(currPage.data)
    var newStatus = parseInt(currPage.data.status)//取出上个页面传来的值，如果上个页面没有传，就是本页数据
    that.setData({//重新设置一下
      status: newStatus
    })
    
    // 初始化页面
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        console.log('页面获取到随机数为')
        console.log(res.data)
        wx.request({
          url: getApp().url + 'userScheduleService/getUserScheduleServiceList',
          method: 'POST',
          data: {
            thirdSessionId: res.data,
            status: that.data.status,
            pageNo: 1,
            pageSize: 10
          },
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            wx.hideLoading();
            // console.log(res.data)
            if (res.data.status === 200) {
              // 重构响应数据
              var arrOrigin = res.data.data.list;//响应数据
              var arr = JSON.parse(JSON.stringify(arrOrigin));//声明一个无关联的新数组


              //时间转换
              var date, M, D, h, m, week
              for (var i = 0; i < arr.length; i++) {
                date = new Date(arr[i].serviceStartTime);
                //求10-30和11:59
                M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
                D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
                h = date.getHours() + ':';
                m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
                // console.log(m);
                arr[i].date = M + D
                arr[i].serviceStartTime = h + m
                // //求星期几
                // switch (date.getDay()) {
                //   case 0: week = "星期天"; break
                //   case 1: week = "星期一"; break
                //   case 2: week = "星期二"; break
                //   case 3: week = "星期三"; break
                //   case 4: week = "星期四"; break
                //   case 5: week = "星期五"; break
                //   case 6: week = "星期六"; break
                // }

                // 求是否是今，明，后天，后者是星期几
                var jinDate = new Date()//今天时间对象
                var mingms = Date.parse(jinDate) + 1 * 24 * 60 * 60 * 1000
                var mingDate = new Date(mingms)//明天时间对象
                var houms = Date.parse(jinDate) + 2 * 24 * 60 * 60 * 1000
                var houDate = new Date(houms)//后天时间对象
                if (date.toDateString() === jinDate.toDateString()) {
                  week = '今天'
                } else if (date.toDateString() === mingDate.toDateString()) {
                  week = '明天'
                } else if (date.toDateString() === houDate.toDateString()) {
                  week = '后天'
                } else {
                  switch (date.getDay()) {
                    case 0: week = "星期天"; break
                    case 1: week = "星期一"; break
                    case 2: week = "星期二"; break
                    case 3: week = "星期三"; break
                    case 4: week = "星期四"; break
                    case 5: week = "星期五"; break
                    case 6: week = "星期六"; break
                  }
                }
                arr[i].week = week
                //获取timePart
                var trsform = date.getHours()
                if (trsform < 12) {
                  arr[i].timePart = '上午'
                } else if (12 < trsform < 18) {
                  arr[i].timePart = '下午'
                } else {
                  arr[i].timePart = '晚上'
                }
              }
              //更新数据
              that.setData({
                totalPages: res.data.data.totalPages,
                listData: arr
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
            wx.hideLoading();
            console.log(res);
            //设置toast时间，toast内容  
            that.setData({
              count: 2000,
              toastText: "服务器错误"
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
    var that = this
    if (that.data.pageNo < that.data.totalPages) {
      wx.showLoading({
        title: '加载中',
      })
      this.setData({
        pageNo: this.data.pageNo + 1
      })
      //继续发请求
      wx.getStorage({//异步获取随机数
        key: getApp().globalData.appid,
        success: function (res) {
          console.log('页面获取到随机数为')
          console.log(res.data)
          wx.request({
            url: getApp().url + 'userScheduleService/getUserScheduleServiceList',
            method: 'POST',
            data: {
              thirdSessionId: res.data,
              status: that.data.status,
              pageNo: that.data.pageNo,
              pageSize: 10
            },
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            success: function (res) {
              wx.hideLoading();//关闭加载框
              // console.log(res.data)
              if (res.data.status === 200) {
                // 重构响应数据
                var arrOrigin = res.data.data.list;//响应数据
                var arr = JSON.parse(JSON.stringify(arrOrigin));//声明一个无关联的新数组
                //时间转换
                var date, M, D, h, m, week
                for (var i = 0; i < arr.length; i++) {
                  date = new Date(arr[i].serviceStartTime);
                  // console.log(arr[i].serviceStartTime)
                  //求10-30和11:59
                  M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
                  D = date.getDate();
                  h = date.getHours() + ':';
                  m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
                  // console.log(m);
                  arr[i].date = M + D
                  arr[i].serviceStartTime = h + m
                  //求星期几
                  switch (date.getDay()) {
                    case 0: week = "星期天"; break
                    case 1: week = "星期一"; break
                    case 2: week = "星期二"; break
                    case 3: week = "星期三"; break
                    case 4: week = "星期四"; break
                    case 5: week = "星期五"; break
                    case 6: week = "星期六"; break
                  }
                  arr[i].week = week
                  //获取timePart
                  var trsform = date.getHours()
                  if (trsform < 12) {
                    arr[i].timePart = '上午'
                  } else if (12 < trsform < 18) {
                    arr[i].timePart = '下午'
                  } else {
                    arr[i].timePart = '晚上'
                  }
                }
                var tt = that.data.listData.concat(arr)
                //更新数据
                that.setData({
                  listData: tt
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
              wx.hideLoading();//关闭加载框
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
     
    }
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  
  // },
  //头部导航点击切换
  timeSelected: function (e) {
    var that=this
    // console.log(999)
    // console.log(e)
    // console.log(e.target.dataset.num)
    var statusNow = e.currentTarget.dataset.status
    that.setData({
      status: statusNow
    })
    // 也是初始化页面
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        console.log('页面获取到随机数为')
        console.log(res.data)
        wx.request({
          url: getApp().url + 'userScheduleService/getUserScheduleServiceList',
          method: 'POST',
          data: {
            thirdSessionId: res.data,
            status: statusNow,
            pageNo: 1,
            pageSize: 10
          },
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            console.log(res.data)
            if (res.data.status === 200) {
              console.log(200)
              // 重构响应数据
              var arrOrigin = res.data.data.list;//响应数据
              var arr = JSON.parse(JSON.stringify(arrOrigin));//声明一个无关联的新数组


              //时间转换
              var date, M, D, h, m, week
              for (var i = 0; i < arr.length; i++) {
                date = new Date(arr[i].serviceStartTime);
                //求10-30和11:59
                M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
                D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
                h = date.getHours() + ':';
                m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
                // console.log(m);
                arr[i].date = M + D
                arr[i].serviceStartTime = h + m
                //求星期几
                // switch (date.getDay()) {
                //   case 0: week = "星期天"; break
                //   case 1: week = "星期一"; break
                //   case 2: week = "星期二"; break
                //   case 3: week = "星期三"; break
                //   case 4: week = "星期四"; break
                //   case 5: week = "星期五"; break
                //   case 6: week = "星期六"; break
                // }

                // 求是否是今，明，后天，后者是星期几
                var jinDate = new Date()//今天时间对象
                var mingms = Date.parse(jinDate) + 1 * 24 * 60 * 60 * 1000
                var mingDate = new Date(mingms)//明天时间对象
                var houms = Date.parse(jinDate) + 2 * 24 * 60 * 60 * 1000
                var houDate = new Date(houms)//后天时间对象
                if (date.toDateString() === jinDate.toDateString()) {
                  week = '今天'
                } else if (date.toDateString() === mingDate.toDateString()) {
                  week = '明天'
                } else if (date.toDateString() === houDate.toDateString()) {
                  week = '后天'
                } else {
                  switch (date.getDay()) {
                    case 0: week = "星期天"; break
                    case 1: week = "星期一"; break
                    case 2: week = "星期二"; break
                    case 3: week = "星期三"; break
                    case 4: week = "星期四"; break
                    case 5: week = "星期五"; break
                    case 6: week = "星期六"; break
                  }
                }


                arr[i].week = week
                //获取timePart
                var trsform = date.getHours()
                if (trsform < 12) {
                  arr[i].timePart = '上午'
                } else if (12 < trsform < 18) {
                  arr[i].timePart = '下午'
                } else {
                  arr[i].timePart = '晚上'
                }
              }
              //更新数据
              that.setData({
                totalPages: res.data.data.totalPages,
                listData: arr
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
              toastText: "服务器错误"
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
  //每一条订单点击跳转
  oneClick:function(e){
    var that = this
    var status = e.currentTarget.dataset.status
    var scheduleServiceId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../orderDetail/orderDetail?status=' +status + '&scheduleServiceId=' + scheduleServiceId,
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