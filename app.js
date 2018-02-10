

// 静博士正版
App({
  globalData: {//初始化请求参数
    appid: 'wxab4355d28417d914',  
    secret: '026e8bf6e20155b7d7f926b27db7c5c3'
  },
  // url: 'http://115.236.38.186:9020/weixin-xique/',//张伟哲
  // url: 'http://122.225.192.228:9031/weixin-xique/',//测试环境
  // url: "http://jbs.xibao.com:8890/weixin-xique/",//陈荣贵
  // url: "https://192.168.18.253:8443/weixin-xique/",//陈荣贵
  // url: 'http://122.225.192.228:9031/weixin-xique/',//测试环境
  url: "https://xq.beautysaas.com/weixin-xique/",//正式环境
  onLaunch: function () {
  },
  login: function () {
    // console.log('调用app.js页面的login函数')
    var that = this
    wx.login({
      success: function (res) {
        var code = res.code;
        // console.log(code)
        // console.log('获取login到了code' + code)
        //调用公共方法
        wx.getLocation({
          type: 'gcj02',
          success: function (resss) {
            // console.log('app页面获取地图成功')
            var latitude = resss.latitude
            var longitude = resss.longitude
            var altitude = resss.altitude
            // 参数都获取到了，发送请求
            that.commomlogin(code, latitude, longitude, altitude)
          },
          fail: function () {
            that.commomlogin(code)
          }
        })
      },
      fail: function () {
        console.log('获取用户code失败')
        // console.log('app页面获取用户登录态失败！' + res.errMsg)
        // wx.showToast({
        //   title: '获取用户登录态失败',
        //   duration: 2000
        // })
      }
    });
  },
  //公共login请求
  commomlogin: function (code,latitude, longitude, altitude) {
    var that = this
    var sendData
    var appid = that.globalData.appid
    var secret = that.globalData.secret
    if (!latitude) {
      sendData = {
        code: code,
        appid: appid,
        secret: secret
      }
    } else {
      sendData = {
        code: code,
        latitude: latitude,
        longitude: longitude,
        // altitude: altitude,//不传海拔高度了
        appid: appid,
        secret: secret
      }
    }
    // console.log(sendData)
    wx.request({
      url: getApp().url + 'wxLogin/login',
      data: sendData,
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        // console.log(latitude, longitude, altitude)
        console.log('app.js文件的login接口成功')
        console.log(res.data)
        if (res.data.status == 200) {
          wx.setStorage({//异步存随机数，在它的回调函数里走原index函数
            key: appid,
            data: res.data.data.thirdSessionId,
            success: function () {
              // console.log('保存随机数成功，开始调用首页数据')
            },
            fail: function () {
              // console.log('保存随机数失败')
            }
          })

        } else if (res.data.status == 400) {
          // var msg = res.data.msg
          // //验证签名失败
          // wx.showToast({
          //   title: 'login' + msg,
          //   duration: 2000
          // })
        }
      }
    });
  },
  onShow:function(enter){
    // console.log('onShow')
  }
})



