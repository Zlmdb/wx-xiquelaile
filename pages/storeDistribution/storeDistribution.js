// pages/storeDistribution/storeDistribution.js
var common = require('../../utils/commonConfirm.js')
// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // random: wx.getStorageSync(getApp().globalData.appid),
    name:'',
    kong:false,
    stopRecord:[
      // {
      //   name:"朝晖店", distance: "0.8",city:"杭州市",district:"下城区",address:"杭州市下城区中山北路588号东北路58号号东北路58号号东北路58号"
      // }
    ],
    fromWhere:true,//true表示从预约点击进来的
    pageNo:1,//默认初始化是第一页
    totalPages:0,
    //toast默认不显示  
    isShowToast: false,
    isShowToastButton: false,
    count: 3000,
    toastText: '你好',
    isBottom:false//页面底部提醒 
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
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'WDEBZ-33BRR-ZO4WZ-WSJ3Y-RFEM2-D6BZF'
    });
    //获取页面打开源
    var fromWhere = options.fromWhere
    console.log(fromWhere)
    that.setData({
      fromWhere: fromWhere
    })
    //初始化页面
    wx.getSetting({//判断是否授权了地理位置
      success: (res) => {
        console.log(res)
        if (!res.authSetting['scope.userLocation']) {//没有授权地理位置
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              // 用户已经同意小程序使用地理位置功能，后续调用 wx.startRecord 接口不会弹窗询问
              that.userLocation()
            },
            fail: function () {// 本来是用户不授权，那就不传经纬度参数，但是为了方便，还是直接传，只不过是空值
              that.userLocation()
            }
          })
        } else {//授权地理位置
          that.userLocation()
        }
      }
    })
  },
  // 公共的函数
  userLocation: function () {
    console.log('retrtr')
    var that = this
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
    console.log('rrr')
    var that=this
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        console.log('页面获取到随机数为')
        console.log(res.data)
        var sendData
        if (!longitude) {
          sendData = {
            thirdSessionId: res.data,
            pageNo: 1,
            pageSize: 10
          }
        } else {
          sendData = {
            thirdSessionId: res.data,
            longitude: longitude,
            latitude: latitude,
            pageNo: 1,
            pageSize: 10
          }
        }
        wx.request({
          url: getApp().url + 'user/getStoreList',
          method: 'POST',
          data: sendData,
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            wx.hideLoading()
            console.log(res.data)
            if (res.data.status === 200) {
              console.log(200)
              var dataList = res.data.data.list
              for (var i = 0; i < dataList.length;i++){
                var curr = dataList[i]
                if(curr.distance>=1000){
                  curr.distanceChange = (curr.distance / 1000).toFixed(1)
                }
              }
              that.setData({
                totalPages: res.data.data.totalPages,
                stopRecord: dataList
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
            wx.hideLoading()
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
    // wx.setNavigationBarTitle({
    //   title: '门店分布'
    // })
    // wx.showNavigationBarLoading()
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
    this.setData({
      isBottom: false,//触底隐藏
      kong: false//空状态隐藏
    })
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
      setTimeout(function() {3
        wx.stopPullDownRefresh();
      }, 1000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that=this
    console.log('触底了' + that.data.pageNo)
    console.log('触底了' + that.data.totalPages)
    if(that.data.pageNo === that.data.totalPages){
        that.setData({
          isBottom:true//触底显示出来
        })
    }
    console.log('触底了111' + that.data.pageNo)
    if(that.data.pageNo < that.data.totalPages){
      console.log('xiaoyu')
      wx.showLoading({
        title: '加载中',
      })
      that.setData({//增加1
        pageNo: that.data.pageNo+1
      })
      //继续发请求
      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          var latitude = res.latitude
          var longitude = res.longitude
          console.log(latitude)
          console.log(longitude)
          that.commonBottomRequest(longitude, latitude)
        },
        fail:function(){
          that.commonBottomRequest()
        }
      })
    }
  },
  // 公共的触底请求
  commonBottomRequest: function (longitude, latitude){
    var that=this
    console.log('再次公共请求')
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        console.log('页面获取到随机数为')
        console.log(res.data)
        var sendData
        if (!longitude) {
          sendData = {
            thirdSessionId: res.data,
            name:that.data.name,
            pageNo: that.data.pageNo,
            pageSize: 10
          }
        } else {
          sendData = {
            thirdSessionId: res.data,
            name: that.data.name,
            longitude: longitude,
            latitude: latitude,
            pageNo: that.data.pageNo,
            pageSize: 10
          }
        }
        wx.request({
          url: getApp().url + 'user/getStoreList',
          method: 'POST',
          data: sendData,
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            wx.hideLoading();//关闭加载框
            console.log(res.data)
            if (res.data.status === 200) {
              console.log(200)
              var dataList = res.data.data.list
              for (var i = 0; i < dataList.length; i++) {
                var curr = dataList[i]
                if (curr.distance >= 1000) {
                  curr.distanceChange = (curr.distance / 1000).toFixed(1)
                }
              }
              var tt = that.data.stopRecord.concat(dataList)
              that.setData({
                stopRecord: tt
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
    
  },
  onPageScroll: function (obj) {
    // console.log(obj);
  },
  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function (obj) {
   
  // },
  //输入门店
  handleInput: function (e) {
    var that = this
    // 每次搜索时，都先把pageNo设为1
    that.setData({
      pageNo: 1,//重置为第一页
      isBottom:false//重置为隐藏
    })
    var name = e.detail.value;
    console.log('输入值为' + name)
    that.setData({
      name: name
    })
    if (name) {//有值
      console.log('有值')
      this.setData({
        // isShow: false,//隐藏局部首页，保留搜索框
        // isSearchShow: true,//搜索手艺人模板显示
        // pullOk: true//可以上拉触底了
      })
    } else {//没值
      console.log('为空')
      this.setData({
        // isShow: true,
        // isSearchShow: false,
        // pullOk: false//不可以上拉触底
      })
    }
    console.log(name)
    wx.getSetting({//判断是否授权了地理位置
      success: (res) => {
        console.log(res)
        if (!res.authSetting['scope.userLocation']) {//没有授权地理位置
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              // 用户已经同意小程序使用地理位置功能，后续调用 wx.startRecord 接口不会弹窗询问
              that.storeLocation()
            },
            fail: function () {// 本来是用户不授权，那就不传经纬度参数，但是为了方便，还是直接传，只不过是空值
              that.storeLocation()
            }
          })
        } else {//授权地理位置
          that.storeLocation()
        }
      }
    })
  },
  // 输入门店公共的函数
  storeLocation: function () {
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {//用户允许地图功能
        var latitude = res.latitude
        var longitude = res.longitude
        that.storeCommonRequest(longitude, latitude)
      },
      fail: function () {//用户拒绝地图功能
        that.storeCommonRequest()
      }
    })
  },
  //输入门店公共的请求
  storeCommonRequest: function (longitude, latitude) {
    var that = this
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        // console.log('页面获取到随机数为')
        // console.log(res.data)
        var sendData
        if (!latitude) {
          sendData = {
            thirdSessionId: res.data,
            name: that.data.name,
            pageNo: 1,
            pageSize: 10
          }
        } else {
          sendData = {
            thirdSessionId: res.data,
            name: that.data.name,
            longitude: longitude,
            latitude: latitude,
            pageNo: 1,
            pageSize: 10
          }
        }
        wx.request({
          url: getApp().url + 'user/getStoreList',
          data: sendData,
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            console.log(res.data)
            if (res.data.status === 200) {
              // var searchData = res.data.data.list
              var dataList = res.data.data.list
              for (var i = 0; i < dataList.length; i++) {
                var curr = dataList[i]
                if (curr.distance >= 1000) {
                  curr.distanceChange = (curr.distance / 1000).toFixed(1)
                }
              }
              var totalPages = res.data.data.totalPages
              that.setData({
                totalPages: totalPages,
                stopRecord: dataList//替换掉原来的数据
              })
              // console.log(that.data.searchData)
              //是否显示没找到手艺人
              if (searchData.length === 0) {//显示出来没找到页面
                that.setData({
                  kong: true
                })
              } else {
                that.setData({
                  kong: false
                })
              }
            } else if (res.data.status === 400) {
              console.log(400)
              var msg = res.data.msg
              console.log(msg)
              //设置toast时间，toast内容  
              // that.setData({//没必要让顾客知道
              //   count: 2000,
              //   toastText: msg
              // });
              // that.showToast();
            }
            common.status(res, that)//状态401和402
          },
          fail: function (res) {
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
  //点击跳转美容师页面或者地图页面
  tocraftsmanOrMap:function(e){
    var that=this
    if (this.data.fromWhere==='true'){//从预约点击进来的
      var departmentId = e.currentTarget.dataset.department//获取部门id
      var name = e.currentTarget.dataset.name//店名
      console.log(departmentId)
      wx.navigateTo({
        url: '../craftsman/craftsman?departmentId=' + departmentId + '&name=' + name,
        success: function () {
        }
      })
    }else{//从我的里的门店分布点击进来的
      var latitude = e.currentTarget.dataset.latitude//获取标签上绑定的维度
      var longitude = e.currentTarget.dataset.longitude//获取标签上绑定的经度
      var name = e.currentTarget.dataset.name
      var address = e.currentTarget.dataset.address
      // 调用坐标转换接口
      qqmapsdk.reverseGeocoder({
        location: {
          latitude: latitude,
          longitude: longitude
        },
        coord_type:3,
        success: function (res) {//门店有经纬度
          console.log('腾讯地图调用成功'+res)
          var loca = res.result.ad_info.location;
          wx.openLocation({
            latitude: loca.lat,
            longitude: loca.lng,
            scale: 18,
            name: name,
            address: address
          })
        },
        fail: function (res) {//门店没有经纬度
          console.log('获取经纬度失败');
          //设置toast时间，toast内容  
          that.setData({
            count: 1000,
            toastText: "定位中..."
          });
          that.showToast();
        },
        complete: function (res) {
          console.log(res);
        }
      });
    }
  },
  //显示自定义提示框
  showToast:function() {
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