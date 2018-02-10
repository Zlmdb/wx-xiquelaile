function status(res,that) {
  if (res.data.status === 401) {//被挤掉了
    getApp().login()
    console.log(401)
    var msg = res.data.msg
    //设置toast时间，toast内容  
    that.setData({
      count: 2000,
      toastText: '您没有登录，请登录',
      isShowToast: true,
      isShowToastButton: true//按钮显示
    });
  } else if (res.data.status === 402) {//随机数过期
    getApp().login()
    console.log(402)
    var msg = res.data.msg
    //设置toast时间，toast内容  
    that.setData({
      count: 2000,
      toastText: '登录过期，请重新登录',
      isShowToast: true,
      isShowToastButton: true//按钮显示
    });
  }
}
function showToast(_this) {
  // var _this = this;
  // toast时间  
  _this.data.count = parseInt(_this.data.count) ? parseInt(_this.data.count) : 3000;
  // 显示toast  
  _this.setData({
    isShowToast: true,
  });
  // 定时器关闭  
  setTimeout(function () {
    _this.setData({
      isShowToast: false
    });
  }, _this.data.count);
}

function buttonConfirm(_this){
  //关闭提示框
  _this.setData({
    isShowToast: false,
    isShowToastButton: false
  });
}

function toAgainLogin(_this){
  //关闭提示框
  _this.setData({
    isShowToast: false,
    isShowToastButton: false
  });
  wx.switchTab({
    url: '../personalCenter/personalCenter',
    success: function (res) {
    },
    fail: function (res) { },
    complete: function (res) { }
  })
}

module.exports.status = status
exports.showToast = showToast
exports.buttonConfirm = buttonConfirm
exports.toAgainLogin = toAgainLogin