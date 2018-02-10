// pages/checkinfo/checkinfo.js
var common = require('../../utils/commonConfirm.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // random: wx.getStorageSync(getApp().globalData.appid),
    isMask:false,
    confirmDisabled:false,//确定按钮
    appointmentId: 0,//当前用户id,初始化和获取预约人列表都可以获得
    nameValue:"",//初始化时本人的姓名，用于传给服务器参数
    maxnameValue:"",//姓名大于四个字符时，截取前四个
    // nicknameValue: "",//初始化时本人的昵称，用于显示，小程序里面优先显示昵称，没有昵称，显示姓名
    phoneValue:"",//初始化时本人的手机号
    userId: 0,//技师id
    customerId:0,//去做服务人的id,可能是本人，也可能是别人
    scheduleId:0,//排班id
    timeFormat: '',//预约时间块，逗号隔开
    type:0,//0自己预约1帮别人预约
    animationDataShow: {},
    animationDataL: {},//必须得初始化定义，如果后期动态添加的话，就不是响应数据了，页面不会更新
    self:{},
    booking: [{ id: 'tr0', customer_Name: '丁安昆', customer_Phone: "135898785",'customerId':''},
      { id: 'tr1', customer_Name: '张三', customer_Phone: "137898785", 'customerId': '' }
    ],
    sClientX:0,
    mClientX: 0,
    eClientX: 0
  },
  bindPickerChange: function (e) {
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    // 上一个页面传过来的参数,提价预约时用
    var userId = options.userid//技师id
    var scheduleId = options.scheduleid//排班id
    var timeFormat = options.timeformat//预约时间块，逗号隔开
    console.log('核对信息页面接收到的userId=' + userId + '&scheduleId=' + scheduleId + '&timeFormat=' + timeFormat)
    that.setData({
      userId: userId,
      scheduleId: scheduleId,
      timeFormat: timeFormat
    })

    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        // console.log('页面获取到随机数为')
        // console.log(res.data)
        wx.request({
          url: getApp().url + 'user/getCurrentUser',
          method: 'POST',
          data: {
            thirdSessionId: res.data
          },
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            console.log(res.data)
            if (res.data.status === 200) {
              that.setData({
                phoneValue: res.data.data.mobile,
                nameValue: res.data.data.name,
                maxnameValue: res.data.data.name.length > 4 ? res.data.data.name.substr(0, 4) : res.data.data.name,
                customerId: res.data.data.id,//把本人id当做去做服务人id
                appointmentId: res.data.data.id//data里的appointmentId用来存本人id,便于后期比较type值
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
      setTimeout(function() {
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
  //点击确定
  modifySuccess:function(){
    var that=this
    that.setData({//点击确定，立马禁用掉确定按钮
      confirmDisabled: true
    });
    if (that.data.appointmentId === that.data.customerId){//本人预约
        that.setData({
          type:0
        })
    } else {//帮别人预约
      that.setData({
        type: 1
      })
    }
    //预约请求
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        console.log('核对信息页获取到随机数为')
        console.log(res.data)
        var sendData={
          thirdSessionId: res.data,
          type: that.data.type,
          mobile: that.data.phoneValue,
          userId: that.data.userId,
          customerId: that.data.customerId,
          scheduleId: that.data.scheduleId,
          timeFormat: that.data.timeFormat
        }
        // 打印预约请求参数
        console.log('预约请求参数')
        console.log(sendData)
        wx.request({
          url: getApp().url + 'schedule/addOrder',
          method: 'POST',
          data: sendData,
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            console.log(res.data)
            if (res.data.status === 200) {

              wx.redirectTo({
                url: '../success/success',
                success: function () {
                 
                }
              })
            } else if (res.data.status === 400 || res.data.status === 403 || res.data.status === 404 || res.data.status === 405) {//失败
              // console.log(400)
              var msg = res.data.msg
              //设置toast时间，toast内容  
              that.setData({
                count: 2000,
                toastText: msg
              });
              that.showToast();
            }
            common.status(res, that)//状态401和402

          }
        })
      },
      fail: function () {
        console.log('核对信息页获取随机数失败')
      }
    })
    
  },
  //点击更换预约人
  modifyPre:function(){
    var that=this
    //动画效果制作
    this.setData({
      isMask:true
    })
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out',
    })

    this.animation = animation

    animation.bottom(0).step()

    this.setData({
      animationDataShow: animation.export()
    })
    // 获取预约人列表
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        // console.log(res.data)
        wx.request({
          url: getApp().url + 'user/getAppointment',
          method: 'POST',
          data: {
            thirdSessionId: res.data
          },
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            console.log(res.data)
            if (res.data.status === 200) {
              //处理响应数据，如果名字大于四个，就给这个对象加一个属性，属性值为只取前面四个，否则不增加属性
              var selfData = res.data.data.self
              var AppointmentListData = res.data.data.AppointmentList

              if (selfData.name.length > 4) {//给self增加maxname属性
                  selfData.maxname = selfData.name.substr(0, 4)
              }
              for (var i = 0; i < AppointmentListData.length;i++){
                var currAppoint = AppointmentListData[i]
                for (var j in currAppoint){
                  if (currAppoint.customer_real_name.length > 4) {//给AppointmentList里的每个对象增加maxname属性
                    currAppoint.maxname = currAppoint.customer_real_name.substr(0, 4)
                  }
                }
              }
              that.setData({
                booking: AppointmentListData,
                self: selfData
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
          }
        })
      },
      fail: function () {
        console.log('页面获取随机数失败')
      }
    })
  },
  //新增预约人
  addAppointMan: function () {
    var that=this
    that.setData({
      isMask: false
    })
    wx.navigateTo({
      url: '../addAppoint/addAppoint',
      success: function () {
        that.setData({
          animationDataL: ''//左滑归位
        })
      }
    })
  },
  //弹出框的取消按钮
  cancel:function(){
    var that=this
    that.setData({//左滑归位
      animationDataL:''
    })
    
    setTimeout(function () {
      this.setData({
        isMask: false
      })
    }.bind(this), 80)
  },
  //选中一个预约人
  selectAppoint:function(e){
      var nameValue=e.currentTarget.dataset.name
      var phoneValue = e.currentTarget.dataset.phone
      var customerId = e.currentTarget.dataset.customerid
      this.setData({
        nameValue: nameValue,
        phoneValue: phoneValue,
        customerId: customerId,
        isMask: false,//关闭弹框
        confirmDisabled:false//解禁确定按钮
      })
  },
  //编辑预约人
  // editAppoint: function (e) {
  //   var that=this
  //   var nameValue = e.currentTarget.dataset.name
  //   var nicknameValue = e.currentTarget.dataset.nickname
  //   var phoneValue = e.currentTarget.dataset.phone
  //   var idValue = e.currentTarget.dataset.id
  //   wx.navigateTo({
  //     url: '../editAppoint/editAppoint?nameValue=' + nameValue + '&nicknameValue=' + nicknameValue +'&phoneValue=' + phoneValue + '&idValue=' + idValue,
  //     success: function () {
  //       that.setData({
  //         isMask: false,
  //         animationDataL: ''//左滑归位
  //       })
  //     }
  //   })
  // },
  //删除预约人
  detailAppoint:function(e){
    var nameValue = e.currentTarget.dataset.name
    var phoneValue = e.currentTarget.dataset.phone
    var idValue = e.currentTarget.dataset.id
    var that = this
    //发送请求
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        // console.log('页面获取到随机数为')
        // console.log(res.data)
        wx.request({
          url: getApp().url + 'user/updateAppointment',
          method: 'POST',
          data: {
            thirdSessionId: res.data,
            name: nameValue,
            mobile: phoneValue,
            id: idValue,
            del: 'y'
          },
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            console.log(res.data)
            if (res.data.status === 200) {
              //隐藏列表
              that.setData({
                isMask: false,
                animationDataL: ''//左滑归位
              })
              var msg = res.data.msg
              //设置toast时间，toast内容  
              that.setData({
                count: 1500,
                toastText: '删除成功'
              });
              that.showToast();
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
          }
        })
      },
      fail: function () {
        console.log('页面获取随机数失败')
      }
    })
    
  },
  //向左滑
  itemStart:function(e){
    console.log(e.touches[0].clientX)
    
    this.setData({
      sClientX:e.touches[0].clientX
    })

  },
  itemMove:function(e){
    console.log(e.touches[0].clientX)
    e.preventDefault;
    this.setData({
      mClientX:e.touches[0].clientX
    })
    // console.log(e)
  },
  itemEnd: function (e){
    console.log(e.changedTouches[0].clientX)
    // console.log(e)
    this.setData({
      eClientX: e.changedTouches[0].clientX
    })
    // console.log(this.data.sClientX, this.data.mClientX)
    //对比向左滑动距离，大于100，显示编辑删除按钮
    var distance = this.data.sClientX - this.data.eClientX 
    // console.log(distance)
    if (distance>70){
      var animation = wx.createAnimation({
        duration: 200,
        timingFunction: 'ease-in-out'
      })

      // this.animation = animation

      animation.left(-133+'rpx').step()

      //获取目标元素的自定义data-id
      var dataId = e.currentTarget.dataset.num

      // this.setData({//这样的话，这里的dataId是一个字符串，不是变量
      //   animationDataL: { dataId: animation.export()}
      // })

      //解决方案： []替换
      //定义一个空对象
      var temData = {};
      //重点是这里
      temData[dataId] = animation.export();
      this.setData({
        animationDataL: temData//这里的animationDataL在点击‘更换预约人’的时候不需要初始化，即不需要给列表里的每个预约人都指定一个动画对象，只需要在滑动其中一个时，给当前滑动块一个动画对象即可，别的滑块对应的动画对象值都是空值。
      })
      // console.log(this.data.animationDataL)
      // console.log('大于100')
      // console.log(dataId)
    } else if (distance < -70){
      var animation = wx.createAnimation({
        duration: 200,
        timingFunction: 'ease-in-out'
      })

      // this.animation = animation

      animation.left(0).step()

      //获取目标元素的自定义data-id
      var dataId = e.currentTarget.dataset.num

      // this.setData({//这样的话，这里的dataId是一个字符串，不是变量
      //   animationDataL: { dataId: animation.export()}
      // })

      //解决方案： []替换
      //定义一个空对象
      var temData = {};
      //重点是这里
      temData[dataId] = animation.export();
      this.setData({
        animationDataL: temData
      })
    }
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