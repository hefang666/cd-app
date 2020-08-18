var serviceUrls = {
  s8rimRoot: getPublicParameter(null, null, 10104 , 'SNT_RIM_URL_ROOT')
}

/// <summary>
/// 加密方法
/// </summary>
/// <param name="Text">需加密的信息</param>
/// 如果成功数据返回的格式为：{"Successed":"true","Message":"加密文本"}
/// 其中Message为Text对应的加密文本。
/// 如果失败数据返回的格式为：{"Successed":"false","Code":"-1","Message":"错误信息"}
function fnEncrypt(Text, callback) {
    var url = serviceUrls.s8rimRoot + '/Security/LeaRunSSO/Encrypt';
    fnRequestService(url, { 'Text': Text }, 'json', function(ret, err) {
      callback(fnResultHandle(ret, err));
    });
}

/// <summary>
/// 验证用户名和密码
/// </summary>
/// <param name="userName">用户名</param>
/// <param name="password">密码</param>
/// <param name="isClearText">是否明文，字符串0或1</param>
/// 如果成功数据返回的格式为：{"Successed":"true","Message":"Ticket值"}
/// 其中Message为Ticket值。
/// 如果失败数据返回的格式为：{"Successed":"false","Code":"-1","Message":"错误信息"}
function fnVerifyLogin(userName, password, isClearText, callback) {
    var url = serviceUrls.s8rimRoot + '/Security/LeaRunSSO/VerifyLogin';
    fnRequestService(url, { 'userName': userName, 'password': password, 'isClearText': isClearText }, 'json', function(ret, err) {
      callback(fnResultHandle(ret, err));
    });
}

/// <summary>
/// 验证并登陆方法
/// </summary>
/// <param name="ticket">用户的Ticket信息</param>
/// 如果成功数据返回的格式为JSONP格式：jsoncallback（{"Successed":"true","Message":"Url地址"}）
/// 其中Message为登陆到该用户对应的登陆界面的Url完整地址。
/// 如果失败数据返回的格式为：jsoncallback（{"Successed":"false","Code":"-1","Message":"错误信息"}）
/// 其中Message为返回信息的内容，Code为错误码（-1 验证失败，-2用户名或密码错误，-3票据无效，-99 未知错误）。
function fnVerifyTicket(ticket, callback) {
    var url = serviceUrls.s8rimRoot + '/Security/LeaRunSSO/VerifyTicket';
    fnRequestService(url, { 'ticket': ticket }, 'text', function(ret, err) {
      callback(fnResultHandle(ret, err));
    });
}

/// <summary>
/// 验证用户名和密码并且转向到指定页面
/// </summary>
/// <param name="userName">用户名</param>
/// <param name="password">密码</param>
/// <param name="isClearText">是否明文</param>
/// <param name="redirectURL">需要跳转的URL页面，注意要进行URLEncode编码</param>
/// 成功转向到指定页面; 失败显示错误页面
function fnVerifyLogintoRedirect(userName, password, isClearText, redirectURL) {
    var url = serviceUrls.s8rimRoot + '/Security/LeaRunSSO/VerifyLogintoRedirect';
    fnRequestService(url, { 'userName': userName, 'password': password, 'isClearText': isClearText }, 'json', function(ret, err) {
      callback(fnResultHandle(ret, err));
    });
}

/// 获取用户列表
function fnGetUserList(callback) {
    var url = serviceUrls.s8rimRoot + '/Apps/Apps/GetUserList';
    fnRequestService(url, { 'sysAdrCode': 's8rim' }, 'json', function(ret, err) {
      callback(fnResultHandleApp(ret, err));
    });
}

/// 获取待办
function fnGetTodoList(userId, pageNumber, pageSize, callback) {
    var url = serviceUrls.s8rimRoot + '/Apps/Apps/GetTodoList';
    fnRequestService(url, { 'sysAdrCode': 's8rim', 'userId': userId, 'pageNumber': pageNumber, 'pageSize': pageSize }, 'json', function(ret, err) {
      callback(fnResultHandleApp(ret, err));
    });
}

/// 获取已办
function fnGetDoneList(userId, pageNumber, pageSize, callback) {
    var url = serviceUrls.s8rimRoot + '/Apps/Apps/GetDoneList';
    fnRequestService(url, { 'sysAdrCode': 's8rim', 'userId': userId, 'pageNumber': pageNumber, 'pageSize': pageSize }, 'json', function(ret, err) {
      callback(fnResultHandleApp(ret, err));
    });
}


// 对调用服务后的返回结果进行处理，返回真实结果，出现错误返回null
function fnResultHandle(ret, err) {
  var regexp = /^jsoncallback\((.+)\)$/i;
  // 如果返回结果是通过jsoncallback封装了的则去壳
  if (typeof ret === 'string') {
    var array = regexp.exec(ret);
    if (array && array.length > 1) {
      ret = array[1];
      ret = $api.strToJson(ret);
    }
  }

  if (err) {
    api.toast({
        msg: '错误号：' + err.code + '\r\n描述：' + err.msg,
        duration: 5000,
        location: 'top'
    });
  } else if (typeof ret === 'string') {
    return ret;
  } else if (ret && ret.Successed) {
    return ret.Message;
  } else if (ret && ret.Code) {
    api.toast({
        msg: '错误号：' + ret.Code + '\r\n描述：' + ret.Message,
        duration: 5000,
        location: 'top'
    });
  } else {
    api.toast({
        msg: '系统未知错误：' + $api.jsonToStr(ret) + '\r\n' + $api.jsonToStr(err),
        duration: 5000,
        location: 'top'
    });
  }

  return null;
}

// 对调用APP服务后的返回结果进行处理，返回真实结果，出现错误返回null
function fnResultHandleApp(ret, err) {
  // 如果返回结果存在则转换为Json对象
  if (typeof ret === 'string') {
    ret = $api.strToJson(ret);
  }

  if (err) {
    api.toast({
        msg: '错误号：' + err.code + '\r\n描述：' + err.msg,
        duration: 5000,
        location: 'top'
    });
  } else if (ret && ret.RtnCode == '9999') {
    return ret;
  } else if (ret && ret.RtnCode) {
    api.toast({
        msg: '错误号：' + ret.RtnCode + '\r\n描述：' + ret.RtnMsg,
        duration: 5000,
        location: 'top'
    });
  } else {
    api.toast({
        msg: '系统未知错误：' + $api.jsonToStr(ret) + '\r\n' + $api.jsonToStr(err),
        duration: 5000,
        location: 'top'
    });
  }

  return null;
}

// 发起请求服务返回结果
// 参数说明：
//     url            服务的URL地址
//     data           参数Json对象数据
//     resultType     结果类型，json或text
//     callback       请求结果回调函数，包含ret和err参数
function fnRequestService(url, data, resultType, callback) {
  api.showProgress({
      title: '加载中',
      modal: false
  });

  api.ajax({
      url: url,
      method: 'post',
      timeout: 15,
      cache: false,
      dataType: (!resultType || resultType == '' ? 'json' : resultType),
      data: { values: data },
      returnAll: false
  }, function(ret, err) {
      api.hideProgress();
      callback(ret, err);
  });
}
