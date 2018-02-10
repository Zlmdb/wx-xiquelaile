// pages/craftsman/craftsman.js
var common = require('../../utils/commonConfirm.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // random: wx.getStorageSync(getApp().globalData.appid),
    isPeopleShow: true,//点击手艺人模板页面
    departmentName:'',//门店名称,上个页面穿过来的 
    craftData:[
      // {
      //   "id": 209,
      //   "username": "王晚霞",
      //   "departmentId": 10,
      //   "avatarapp": "http://image.beautysaas.com/xibao/face/5a9f67ee-d712-42e7-9e80-2705c244bad2"
      // },
      // {
      //   "id": 383,
      //   "username": "叶景美",
      //   "avatarapp": "http://image.beautysaas.com/xibao/face/81d965fe-727e-4b04-bbde-e547490f8cca"
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
    var departmentId = options.departmentId//部门id
    var name = options.name//部门名称
    that.setData({
      departmentName:name
    })
    console.log(departmentId)
    //动态设置标题
    wx.setNavigationBarTitle({
      title: name
      // title: '浙大店'
    })
    //初始化页面
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        console.log('页面获取到随机数为')
        console.log(res.data)
        wx.request({
          url: getApp().url + 'staff/getUserListByDepartmentId',
          method: 'POST',
          data: {
            thirdSessionId: res.data,
            departmentId: departmentId
          },
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            wx.hideLoading();
            console.log(res.data)
            if (res.data.status === 200) {
              console.log(200)
              that.setData({
                craftData: res.data.data
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
  selectClickPeople:function(e){
    var that=this
    var userId = e.currentTarget.dataset.id//获取员工id
    var username = e.currentTarget.dataset.username//获取员工姓名
    var avatarapp = e.currentTarget.dataset.avatarapp//获取员工图片

    // var departmentName = e.currentTarget.dataset.departmentname//获取员工所在门店名称
    wx.navigateTo({
      url: '../time/time?userid=' + userId + '&departmentname=' + that.data.departmentName + '&username=' +username + '&avatarapp=' + avatarapp,
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