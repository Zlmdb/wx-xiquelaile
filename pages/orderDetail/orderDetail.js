// pages/orderDetail/orderDetail.js
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
    status:1,
    isArray:false,//手艺人，默认是1或3的状态
    isAnonymous:false,//匿名评价
    cancelDisabled:true,//'取消预约'按钮默认禁用
    nScore:1,//评分，就是五角星的个数，点击操作之后得到的
    serviceCode:0,//服务单号
    serviceId: 0,//服务单id
    scheduleServiceId: '',//排版定单id
    departLabels: [],//门店评价标签id
    beauticianLabels: [],//手艺人评价标签id
    cancelMask:false,//取消预约模态框隐藏
    recordData:{
      // "isEvaluate": "n","isOther":0, "departmentName": "浙大店", "province": "安徽省", "city": "合肥市", "district": "瑶海区", "address": "西湖区浙大路39号紫兰酒店1楼（近西湖文化中心）", "longitude": 120.134679, "latitude": 30.266067, "customerId": 92726, "customerName": "张旭", "serviceStartTime": '12：00', "serviceCode": "20171207000005", "date": '2017-10-24', "departId": 10, "serviceId": 16, "evaluateScore": 10, "statusName": "服务完成", "isAnonymous": "y","userId": 9600, "userName": "占琴玉", "beauticianList": [
      //     {
      //       "id": "1",
      //       "username": "a"
      //     },
      //     {
      //       "id": "2",
      //       "username": "b"
      //     }
      //   ],
      //   "evaluatUserLableVOList": [
      //     {
      //       "evaluateLableId": "1",
      //       "evaluateLable": "aaa"
      //     },
      //     {
      //       "evaluateLableId": "2",
      //       "evaluateLable": "aaa"
      //     }
      //   ],
      //   "evaluatDepartLableVOList": [
      //     {
      //       "evaluateLableId": "1",
      //       "evaluateLable": "aaa"
      //     },
      //     {
      //       "evaluateLableId": "2",
      //       "evaluateLable": "aaa"
      //     }
      //   ],
      //   "evaluateLableList":[
      //     {
      //       "evaluateLableId": "1",
      //       'evaluateLableType':'1',
      //       "evaluateLable": "aaa"
      //     },
      //     {
      //       "evaluateLableId": "2",
      //       'evaluateLableType': '1',
      //       "evaluateLable": "bbb"
      //     },
      //     {
      //       "evaluateLableId": "3",
      //       'evaluateLableType': '2',
      //       "evaluateLable": "态度很好"
      //     },
      //     {
      //       "evaluateLableId": "4",
      //       'evaluateLableType': '2',
      //       "evaluateLable": "很干净"
      //     }
      //   ]
      },
    //toast默认不显示  
    isShowToast: false,
    isShowToastButton: false,
    count: 3000,
    toastText: '你好' ,
    // img1: false,
    img2: false,
    img3: false,
    img4: false,
    img5: false,
    bg: {},//初始化每一个评价标签对应的颜色状态，这里个bg应该是{1:false,3:true}这种对象形式
    arrObj: []//初始化赋值，这个是上面的升级版，每个对象里面同时包含evaluateLableId(标签id)和evaluateType(标签类型)这两个属性，例如[{id:flase,evaluateLableId:5,evaluateType:1},{id:flase,evaluateLableId:9,evaluateType:2}]这种形式，目的是点击提交按钮时，便于统计点击的标签是哪个类型的，id是多少，这些要传递给后台
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('触发了orderDetail的onLoad')
    var that=this
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'WDEBZ-33BRR-ZO4WZ-WSJ3Y-RFEM2-D6BZF'
    });
    var status = options.status//记录1，2还是3
    var scheduleServiceId = options.scheduleServiceId//排班订单服务id
    console.log('服务订单' + scheduleServiceId)
    that.setData({
      status: status,
      scheduleServiceId: scheduleServiceId
    })
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        
        var sendData={
          thirdSessionId: res.data,
          status: status,
          scheduleServiceId: scheduleServiceId
        }
        console.log('订单详情初始化参数')
        console.log(sendData)
        wx.request({
          url: getApp().url + 'userScheduleService/getServiceDetail',
          method: 'POST',
          data: sendData ,
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            console.log(res.data)
            if (res.data.status === 200) {
              // console.log(200)
              // 重构响应数据，需要把原始响应数据里的date，serviceStartTime，evaluateScore这三个属性改造
              var recordData = Object.assign({}, res.data.data)//声明一个无关联的新对象
              //时间转换
              var now, Y, M, D, h, m,
                now = new Date(recordData.orderStartTime);
              //求2017-10-30和11:59
              Y = now.getFullYear() + '-';
              M = (now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1) + '-';
              D = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
              h = now.getHours() + ':';
              m = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()
              recordData.date = Y + M + D
              recordData.serviceStartTime = h + m
              //把number类型的评分改成对应的数组,以便于遍历
              switch (recordData.evaluateScore) {
                case 1: recordData.evaluateScore = [1]; break
                case 2: recordData.evaluateScore = [1, 2]; break
                case 3: recordData.evaluateScore = [1, 2, 3]; break
                case 4: recordData.evaluateScore = [1, 2, 3, 4]; break
                case 5: recordData.evaluateScore = [1, 2, 3, 4, 5]; break
              }
              if (recordData.customerName.length>4){//如果预约人姓名大于四个，增加一个属性，否则不加
                recordData.maxname = recordData.customerName.substr(0,4)
              }
              //更新数据
              that.setData({
                recordData: recordData,
                serviceCode: recordData.serviceCode,
                serviceId: recordData.serviceId,
                cancelDisabled:false//解禁取消预约
              })




              //初始化bg的值，即评价标签的状态，同时初始化arrObj这个数组对象
              var arrOrigin = recordData.evaluateLableList//未评价时所有的标签列表
              if (arrOrigin) {//未评价
                //var evaluateLableList=recordData.evaluateLableList//未评价时所有的标签列表
                var newArr = JSON.parse(JSON.stringify(arrOrigin))//声明一个无关联的新数组
                var obj = {}
                var arrObj = []
                for (var i = 0; i < newArr.length; i++) {//让evaluateLableId的value作为obj的key
                  obj[newArr[i].evaluateLableId] = false//初始化全是false,即未选中状态
                  //arrObj每个对象需要三个属性
                  // arrObj[i][newArr[i].evaluateLableId] = false
                  // arrObj[i].evaluateType = newArr[i].evaluateType
                  // arrObj[i].evaluateLableId = newArr[i].evaluateLableId
                  newArr[i][newArr[i].evaluateLableId] = false
                }

                that.setData({
                  bg: obj,
                  arrObj: newArr
                })
              }

              // 判断手艺人从哪个地方取，是从“beauticianList数组”取，还是从“userName”取
              if (recordData.beauticianList && recordData.beauticianList.length > 0) {//手艺人，是beauticianList数组
                that.setData({
                  isArray: true
                })
              } else {//手艺人，是userName
                //不用写
              }
            } else if (res.data.status === 400) {//失败
              console.log(400)
              var msg = res.data.msg
              //设置toast时间，toast内容  
              that.setData({
                count: 2000,
                toastText: msg,
                cancelDisabled: true//禁用取消预约
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // var pages = getCurrentPages()
    // console.log('订单详情页面noshow')
    // console.log(pages)
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
  //点击打开地图
  toWhere:function(e){
    var that=this
    var latitude = e.currentTarget.dataset.latitude//获取标签上绑定的维度
    var longitude = e.currentTarget.dataset.longitude//获取标签上绑定的经度
    var name = e.currentTarget.dataset.departmentName
    var address = e.currentTarget.dataset.address
    // 调用坐标转换接口
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      coord_type: 3,
      success: function (res) {//门店有经纬度

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
        console.log(res);
        //设置toast时间，toast内容  
        that.setData({
          count: 2000,
          toastText: "定位中..."
        });
        that.showToast();
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },
  // 复制粘贴板
  setClipboard:function(){
    wx.setClipboardData({
      data: this.data.serviceCode.toString(),//必须是字符串形式
      success: function (res) {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 800
        })
        // wx.getClipboardData({
        //   success: function (res) {
        //     console.log(res.data) // data
        //   }
        // })
      }
    })
  },
  //匿名评价
  anonymous:function(){
    this.setData({
      isAnonymous: !this.data.isAnonymous
    })
    console.log(111111)
  },
  //点击五角星
  // handleToggle1:function(){
  //   this.setData({
  //     img1:!this.data.img1
  //   })
  // },
  handleToggle2: function () {
    this.setData({
      img2: !this.data.img2
    })
    if (this.data.img3 === false) {
      this.setData({
        img3: true,
        img4: true,
        img5: true
      })
    }
  },
  handleToggle3: function () {
    this.setData({
      img3: !this.data.img3
    })
    if (this.data.img2 === true) {
      this.setData({
        img2: false,
      })
    }
    if (this.data.img4===false) {
      this.setData({
        img4: true,
        img5: true
      })
    }
  },
  handleToggle4: function () {
    this.setData({
      img4: !this.data.img4
    })
    if (this.data.img3 === true) {
      this.setData({
        img2: false,
        img3: false,
      })
    }
    if (this.data.img5 === false) {
      this.setData({
        img5: true
      })
    }
  },
  handleToggle5: function () {
    this.setData({
      img5: !this.data.img5
    })
    if (this.data.img4 === true) {
      this.setData({
        img2: false,
        img3: false,
        img4: false
      })
    }
  },
  //点击评价标签
  handleBg:function(e){
    var target = e.currentTarget.dataset.str//获取当前对象
    var targetValue = this.data.bg[target]//获取当前对象所对应的值，是布尔值
    //重新设置对象
    var obj=this.data.bg
    //改变新对象里的某个值
    obj[target] = !targetValue
    //更新数据
    this.setData({
      bg: obj
    })


    //重新设置对象
    var objj = this.data.arrObj
    for(var i=0;i<objj.length;i++){
      var everyElement = objj[i]
      if (everyElement[target] == false || everyElement[target]==true){//找到当前这个对象
          //改变新对象里的某个值
          objj[i][target] = !targetValue
          //更新数据
          this.setData({
            arrObj: objj
          })
      }
    }

  },
  //提交按钮
  submitEvevate:function(){
    var that=this
    // 获取五角星的个数
    if(!this.data.img5){//红色
      this.setData({
        nScore:5
      })
    } else if (!this.data.img4){
      this.setData({
        nScore: 4
      })
    } else if (!this.data.img3) {
      this.setData({
        nScore: 3
      })
    } else if (!this.data.img2) {
      this.setData({
        nScore: 2
      })
    }
    //是否匿名转换成y或n
    var isAnonymous=""
    if (this.data.isAnonymous){
      isAnonymous='y'
    }else{
      isAnonymous = 'n'
    }
    //获取门店标签id与手艺人标签id
    var arrObj=that.data.arrObj
    console.log(arrObj)
    var departLabels =[]
    var beauticianLabels = []
    var departLabelsString = ''
    var beauticianLabelsString = ''
    for (var i = 0; i < arrObj.length; i++) {
      var curr = arrObj[i]
      var currIds = arrObj[i]['evaluateLableId']
      if (curr[currIds]===true){
        if (curr.evaluateLableType === 1) {
          departLabels.push(curr.evaluateLableId)
          departLabelsString = departLabels.join(',')
        } else if (curr.evaluateLableType === 2) {
          beauticianLabels.push(curr.evaluateLableId)
          beauticianLabelsString = beauticianLabels.join(',')
        }
      }
    }
    
    //提交评价
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        // console.log('页面获取到随机数为')
        console.log(res.data)
        wx.request({
          url: getApp().url + 'userScheduleService/saveEvaluate',
          data: {
            thirdSessionId: res.data,
            serviceId: that.data.serviceId,//服务单id
            evaluateScore: that.data.nScore,//评分
            departLabels: departLabelsString,
            beauticianLabels: beauticianLabelsString,
            isAnonymous: isAnonymous
          },
          method: 'POST',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            console.log(res.data)
            if (res.data.status === 200) {
              //页面跳转成功后，设置上个页面值
              var pages = getCurrentPages();
              var prevPage = pages[pages.length - 2]//上一个页面
              //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
              prevPage.setData({
                status: 2
              })
              console.log('提交成功')
              wx.navigateBack({
                delta: 1,
                // url: '../order/order',
                success: function () {
                  
                }
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
  //取消预约
  showModal:function(){
    var that=this
    console.log('ddddddddd' + that.data.scheduleServiceId)
    that.setData({
      cancelMask:true//显示模态框
    })
  },
  // 取消预约确定
  cancelSuccess:function(){
    var that=this
    that.setData({
      cancelMask:false
    })
    wx.getStorage({//异步获取随机数
      key: getApp().globalData.appid,
      success: function (res) {
        console.log('发送取消预约参数')
        console.log(res.data + ',' + that.data.scheduleServiceId)
        wx.request({
          url: getApp().url + 'schedule/cancelOrder',
          method: 'POST',
          data: {
            thirdSessionId: res.data,
            scheduleServiceId: that.data.scheduleServiceId//排班订单id
          },
          header:{ 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            console.log('success响应数据')
            console.log(res.data)
            //页面跳转成功后，设置上个页面值
            var pages = getCurrentPages();
            var prevPage = pages[pages.length - 2]//上一个页面
            //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
            prevPage.setData({
              status: 3
            })
            if (res.data.status === 200) {
              //页面跳转到订单列表页面
              wx.navigateBack({
                delta: 1,
                // url: '../order/order',
                success: function () {

                }
              })
            } else if (res.data.status === 400) {
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
            console.log('取消预约服务器失败')
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
  // 取消预约取消
  cancelFail: function () {
    var that=this
    that.setData({
      cancelMask: false
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