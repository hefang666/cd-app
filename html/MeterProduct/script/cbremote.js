// var app = {
//     apipath: apiUrl + '/api/',
// };

var now = Date.now();


function fnGet(path, data, isDelete, callback, noHide, tag) {
    var headers = {};
    api.showProgress({
        title: '加载中',
        modal: false
    });
    if (isDelete) {
        headers["Content-Type"] = 'application/json';
    }
    // api.openWin({
    //     name: 'index',
    //     url: 'widget://index.html'
    // });
    var options = {
      url: $api.getStorage('cbapipath') + '/api/WaterMeters/Info',
      method: isDelete ? 'delete' : 'get',//传输方式
      timeout: 30,//超时时间
      dataType: 'json',
      headers: headers,
      traditional: true
    }
    if(tag){
      options['tag'] = tag
    }
    api.ajax(options, function(ret, err) {
        if (!noHide) {
            api.hideProgress();
        }
        // api.refreshHeaderLoadDone();
        callback(ret, err);
        if (err) {
            if (err.body) {
                if (err.body.error) {
                    if (err.body.error.message == '10000') {
                        api.toast({
                            msg: err.body.error.details,
                            duration: 2000,
                            location: 'top'
                        });
                    } else {
                        api.toast({
                            msg: err.body.error.message,
                            duration: 2000,
                            location: 'top'
                        });
                    }
                    if (err.body.error.message == '当前用户没有登录到系统！') {
                        // console.log(111);
                        api.openWin({
                            name: 'login',
                            url: 'widget://html/login/login.html',
                            slidBackEnabled: false,
                            bgColor: 'widget://image/login/login_backgroud.png'
                        });
                    }
                } else {
                    api.toast({
                        msg: err.body,
                        duration: 2000,
                        location: 'top'
                    });
                }
            } else {
                api.toast({
                    msg: err.msg,
                    duration: 2000,
                    location: 'top'
                });
            }
        }
    });
};
function fnGet1(path, data, isDelete, callback, noHide, tag) {
    var headers = {};
    // api.showProgress({
    //     title: '加载中',
    //     modal: false
    // });
    if (isDelete) {
        headers["Content-Type"] = 'application/json';
    }
    // api.openWin({
    //     name: 'index',
    //     url: 'widget://index.html'
    // });
    var options = {
      url: $api.getStorage('cbapipath') + '/api/WaterMeters/Info',
      method: isDelete ? 'delete' : 'get',//传输方式
      timeout: 30,//超时时间
      dataType: 'json',
      headers: headers,
      traditional: true
    }
    if(tag){
      options['tag'] = tag
    }
    api.ajax(options, function(ret, err) {
        if (!noHide) {
            // api.hideProgress();
        }
        // api.refreshHeaderLoadDone();
        callback(ret, err);
        if (err) {
            if (err.body) {
                if (err.body.error) {
                    if (err.body.error.message == '10000') {
                        api.toast({
                            msg: err.body.error.details,
                            duration: 2000,
                            location: 'top'
                        });
                    } else {
                        api.toast({
                            msg: err.body.error.message,
                            duration: 2000,
                            location: 'top'
                        });
                    }
                    if (err.body.error.message == '当前用户没有登录到系统！') {
                        // console.log(111);
                        api.openWin({
                            name: 'login',
                            url: 'widget://html/login/login.html',
                            slidBackEnabled: false,
                            bgColor: 'widget://image/login/login_backgroud.png'
                        });
                    }
                } else {
                    api.toast({
                        msg: err.body,
                        duration: 2000,
                        location: 'top'
                    });
                }
            } else {
                api.toast({
                    msg: err.msg,
                    duration: 2000,
                    location: 'top'
                });
            }
        }
    });
};

function fnPost(path, data, contentType, isPut, callback) {
    var headers = {};
    if (contentType) {
        headers["Content-Type"] = contentType;
    }
    api.showProgress({
        title: '加载中',
        modal: true
    });
    var options = {
      url: $api.getStorage('cbapipath') + '/api/WaterMeters/Info',
      method: isPut ? 'put' : 'post',
      timeout: 15,
      dataType: 'json',
      returnAll: false,
      headers: headers,
      data: data
    }
    //alert(JSON.stringify(options));
    //console.log(JSON.stringify(options));

    api.ajax(options, function(ret, err) {
        api.refreshHeaderLoadDone();
        api.hideProgress();
        if (err) {
            api.toast({
                msg: err.body.Message,
                duration: 2000,
                location: 'top'
            });
        } else if (ret.code == 0) {
            api.toast({
                msg: ret.result,
                duration: 2000,
                location: 'top'
            });
        }
        callback(ret, err);
    });
    // var db = api.require('db');
    // db.selectSql({
    //     name: 'test',
    //     sql: 'SELECT * FROM Server'
    // }, function(ret, err) {
    //     if (ret.status) {
    //      apipath=ret.data[0].ServerIp;
    //
    //      console.log('http://'+apipath+'/Api/'+path)
    //      app = {
    //          apipath:apipath,
    //      };
    //      api.ajax({
    //          url:'http://'+apipath+'/Api/'+path ,
    //          method: isPut ? 'put' : 'post',
    //          timeout: 100,
    //          dataType: 'json',
    //          returnAll: false,
    //          headers: headers,
    //          data: data
    //      }, function(ret, err) {
    //          api.refreshHeaderLoadDone();
    //         //  api.hideProgress();
    //          callback(ret, err);
    //      });
    //     } else {
    //         console.log(JSON.stringify(err));
    //     }
    // });

};
function fnPostt(path, data, contentType, isPut, callback) {
    var headers = {};
    if (contentType) {
        headers["Content-Type"] = contentType;
    }
    api.showProgress({
        title: '加载中',
        modal: true
    });
    var options = {
      url: $api.getStorage('cbapipath') + '/api/WaterMeters/Info',
      method: isPut ? 'put' : 'post',
      timeout: 10,
      dataType: 'json',
      returnAll: false,
      headers: headers,
      data: data
    }
    //alert(JSON.stringify(options));
    //console.log(JSON.stringify(options));

    api.ajax(options, function(ret, err) {
        api.refreshHeaderLoadDone();
        api.hideProgress();
        if (err) {
            api.toast({
                msg: err.body.Message,
                duration: 2000,
                location: 'top'
            });
        } else if (ret.code == 0) {
            api.toast({
                msg: ret.result,
                duration: 2000,
                location: 'top'
            });
        }
        callback(ret, err);
    });
    // var db = api.require('db');
    // db.selectSql({
    //     name: 'test',
    //     sql: 'SELECT * FROM Server'
    // }, function(ret, err) {
    //     if (ret.status) {
    //      apipath=ret.data[0].ServerIp;
    //
    //      console.log('http://'+apipath+'/Api/'+path)
    //      app = {
    //          apipath:apipath,
    //      };
    //      api.ajax({
    //          url:'http://'+apipath+'/Api/'+path ,
    //          method: isPut ? 'put' : 'post',
    //          timeout: 100,
    //          dataType: 'json',
    //          returnAll: false,
    //          headers: headers,
    //          data: data
    //      }, function(ret, err) {
    //          api.refreshHeaderLoadDone();
    //         //  api.hideProgress();
    //          callback(ret, err);
    //      });
    //     } else {
    //         console.log(JSON.stringify(err));
    //     }
    // });

};
function fnPost1(path, data, contentType, isPut, callback) {
    var headers = {};
    if (contentType) {
        headers["Content-Type"] = contentType;
    }

    api.ajax({
        url: $api.getStorage('cbapipath') + '/api/WaterMeters/Info',
        method: isPut ? 'put' : 'post',
        timeout: 100,
        dataType: 'json',
        returnAll: false,
        headers: headers,
        data: data
    }, function(ret, err) {
        api.refreshHeaderLoadDone();
        callback(ret, err);
    });
};
//访问工单接口
function fnPost3(path, data, contentType, isPut, callback) {
    var headers = {};
    if (contentType) {
        headers["Content-Type"] = contentType;
    }
    api.showProgress({
        title: '加载中',
        modal: true
    });
    //headers.Authorization = "[{\"key\":\"10046\"},{\"key\":\"g6OuZomFp3E=\"}]";
    headers.Authorization = [{"key":$api.getStorage('cbOperatorId')},{"key":$api.getStorage('cbPassword')}]
    var options = {
      url: $api.getStorage('cbapipath') + path,
      method: isPut ? 'put' : 'post',
      timeout: 100,
      dataType: 'json',
      returnAll: false,
      headers: headers,
      data: data
    }
    //alert(JSON.stringify(options));
    //console.log(JSON.stringify(options));
    api.ajax(options, function(ret, err) {
        api.refreshHeaderLoadDone();
        api.hideProgress();
        if (err) {
            api.toast({
                msg: err.body.Message,
                duration: 2000,
                location: 'top'
            });
        } else if (ret.code == 0) {
            api.toast({
                msg: ret.result,
                duration: 2000,
                location: 'top'
            });
        }
        callback(ret, err);
    });
};

function fnPost4(Methods, data,contentType, isLogin, isPut, callback,files={},isErr = false) {
    var headers = {};
        // console.log(JSON.stringify(files))
    var body = {
        body: JSON.stringify({
            Method: Methods,
            UserName:$api.getStorage('cbOperatorName'), //"01012"
            Password:$api.getStorage('cbPassword'),// "g6OuZomFp3E="
            SerialNo: '20200426171300',
            KeyCode:'', //营业
            Parameter: JSON.stringify(data)
        }),
        files: files
    };
    if (contentType) {
        headers["Content-Type"] = contentType
    }

    if (isLogin) {
        if (!$api.getStorage('loginInfo')) {
            setTimeout(function() {
                api.closeToWin({
                    name: 'login'
                });
            }, 200);
            return;
        }
        headers.Authorization =$api.getStorage("bwHeaders");
    }
    api.showProgress({
        title: '加载中',
        text: '',
        modal: false
    });

    // vue 测试
    // app.apipath = 'http://' + $api.getStorage('apiUrl')+'/api/'+path;
    // console.log( app.apipath);
    api.ajax({
        url: $api.getStorage('cbapipath') + '/api/WaterMeters/Info', //app.apipath+path
        method: isPut ? 'put' : 'post',
        // timeout: 15,
        dataType: 'json',
        returnAll: false,
        headers: headers,
        data: body
    }, function(ret, err) {
        // api.refreshHeaderLoadDone();
        callback(ret, err);
        if (err) {
            if (isErr) {
                callback(false, err);
            }
            callback(ret, err);
            if (err.body) {
                if (err.body.error) {
                    if (err.body.error.message == '10000') {
                        api.toast({
                            msg: err.body.error.details,
                            duration: 2000,
                            location: 'top'
                        });
                    } else {
                        api.toast({
                            msg: err.body.error.message,
                            duration: 2000,
                            location: 'top'
                        });
                    }
                    if (err.body.error.message == '当前用户没有登录到系统！') {
                        // console.log(111);
                        setTimeout(function() {
                            api.closeToWin({
                                name: 'login'
                            });
                        }, 200);
                    }
                } else {
                    if (isErr == false) {
                        api.toast({
                            msg: err.body,
                            duration: 2000,
                            location: 'top'
                        });
                    }
                }
            } else {
                if (isErr == false) {
                    api.toast({
                        msg: err.msg,
                        duration: 2000,
                        location: 'top'
                    });
                }

            }
        }
    });
};

function fnPostNoProcess(path, data, contentType, isPut, callback) {
    var headers = {};
    if (contentType) {
        headers["Content-Type"] = contentType;
    }

    api.ajax({
        url: $api.getStorage('cbapipath') + '/api/WaterMeters/Info',
        method: isPut ? 'put' : 'post',
        timeout: 30,
        dataType: 'json',
        returnAll: false,
        headers: headers,
        data: data
    }, function(ret, err) {
        callback(ret, err);
    });

};

// ajax同步访问
var asynAjax = {
    get: function(path, where, page, limit, fn) {
        var obj = new XMLHttpRequest();
        var url = app.apipath + path + '?filter={"where":' + JSON.stringify(where) + ',"page":' + page + ',"limit":' + limit + '}';
        obj.open('GET', url, false);
        obj.onreadystatechange = function() {
            var ret, err;
            if (obj.readyState == 4 && obj.status == 200 || obj.status == 304) {
                ret = obj.responseText;
            } else {
                err = obj.responseText;
            }
            fn.call(ret, ret);
        };
        obj.send();
    },
    post: function(path, data, fn) {
        var obj = new XMLHttpRequest();
        obj.open("POST", url, false);
        obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        obj.onreadystatechange = function() {
            var ret, err;
            if (obj.readyState == 4 && obj.status == 200 || obj.status == 304) {
                ret = obj.responseText;
            } else {
                err = obj.responseText;
            }
            fn.call(ret, ret);
        };
        obj.send(data);
    }
}
