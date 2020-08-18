var now = Date.now();
var app;

function fnGet(path, data, isDelete, callback, noHide) {
    var headers = {};
    api.showProgress({
        title: '加载中',
        modal: false
    });
    if (isDelete) {
        headers["Content-Type"] = 'application/json';
    }
    var apipath;
    // var server = $api.getStorage('server');
    // if ($api.getStorage('net') == 'networks') {
    //     apipath = server.networks;
    // } else if ($api.getStorage('net') == 'areaNetwork') {
    //     apipath = server.areaNetwork;
    // }
    apipath = $api.getStorage('kfapipath');
    headers.Authorization = $api.getStorage('kfHeaders');
    app = {
        apipath: apipath,
    };
    api.ajax({
        url: apipath + path,
        method: isDelete ? 'delete' : 'get',
        timeout: 100,
        headers: headers,
        dataType: 'json',
    }, function(ret, err) {
        callback(ret, err);
        api.refreshHeaderLoadDone();
        if (!noHide) {
            api.hideProgress();
        }
        if (err) {
            if (err.body) {
                if (err.body.Message) {
                    api.toast({
                        msg: err.body.Message,
                        duration: 2000,
                        location: 'top'
                    });
                }
            }
        } else if (ret.code == 0) {
            api.toast({
                msg: ret.result,
                duration: 2000,
                location: 'top'
            });
        }
    });
};

function kfPost(path, data, contentType, isLogin, isPut, callback, noHide) {
    console.log(JSON.stringify(data))
    var headers = {

    };
    if (contentType) {
        headers["Content-Type"] = contentType
    }
    if (isLogin) {
        if (!$api.getStorage('loginInfo')) {
            api.openWin({
                name: 'login',
                url: 'widget://html/login/login.html'
            });
            return;
        }
    }
    api.showProgress({
        title: '加载中',
        modal: true
    });
    var apipath;
    apipath = $api.getStorage('kfapipath');
    headers.Authorization = $api.getStorage('kfHeaders');
    app = {
        apipath: apipath,
    };
    api.ajax({
        url: 'http://192.168.0.106/' + path,
        method: isPut ? 'put' : 'post',
        timeout: 100,
        dataType: 'json',
        returnAll: false,
        headers: headers,
        data: data
    }, function(ret, err) {
        api.refreshHeaderLoadDone();
        if(!noHide){
          api.hideProgress();
        }
        callback(ret, err);
        if (err) {
            if (err.body) {
                if (err.body.Message) {
                    api.toast({
                        msg: err.body.Message,
                        duration: 2000,
                        location: 'top'
                    });
                }
            }
        } else if (ret.code == 0) {
            api.toast({
                msg: ret.result,
                duration: 2000,
                location: 'top'
            });
        }
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
// ajax同步访问
var asynAjax = {
    get: function(path, where, page, limit, fn) {
        var apipath;
        var server = $api.getStorage('server');
        if ($api.getStorage('net') == 'networks') {
            apipath = server.networks;
        } else if ($api.getStorage('net') == 'areaNetwork') {
            apipath = server.areaNetwork;
        };
        var obj = new XMLHttpRequest();
        var url = 'http://' + apipath + '/Api/' + path + '?filter={"where":' + JSON.stringify(where) + ',"page":' + page + ',"limit":' + limit + '}';
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
        // var db = api.require('db');
        // db.selectSql({
        //     name: 'test',
        //     sql: 'SELECT * FROM Server'
        // }, function(ret, err) {
        //     if (ret.status) {
        //         apipath = ret.data[0].ServerIp;
        //         console.log('http://' + apipath + '/Api/' + path)
        //         var obj = new XMLHttpRequest();
        //         var url = 'http://' + apipath + '/Api/' + path + '?filter={"where":' + JSON.stringify(where) + ',"page":' + page + ',"limit":' + limit + '}';
        //         obj.open('GET', url, false);
        //         obj.onreadystatechange = function() {
        //             var ret, err;
        //             if (obj.readyState == 4 && obj.status == 200 || obj.status == 304) {
        //                 ret = obj.responseText;
        //             } else {
        //                 err = obj.responseText;
        //             }
        //             fn.call(ret, ret);
        //         };
        //         obj.send();
        //     } else {
        //         console.log(JSON.stringify(err))
        //     }
        // })

    },
    post: function(path, data, fn) {
        var apipath;
        var server = $api.getStorage('server');
        if ($api.getStorage('net') == 'networks') {
            apipath = server.networks;
        } else if ($api.getStorage('net') == 'areaNetwork') {
            apipath = server.areaNetwork;
        };
        var obj = new XMLHttpRequest();
        var url = 'http://' + apipath + '/Api/' + path
        obj.open("POST", url, false);
        obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        obj.onreadystatechange = function() {
            var ret, err;
            if (obj.readyState == 4 && obj.status == 200 || obj.status == 304) {
                ret = obj.responseText;
            } else {
                err = obj.responseText;
            }
            fn.call(ret, err);
        };
        obj.send(data);
        // var db = api.require('db');
        // db.selectSql({
        //     name: 'test',
        //     sql: 'SELECT * FROM Server'
        // }, function(ret, err) {
        //     if (ret.status) {
        //         apipath = ret.data[0].ServerIp;
        //         console.log('http://' + apipath + '/Api/' + path);
        //         var obj = new XMLHttpRequest();
        //         var url = 'http://' + apipath + '/Api/' + path
        //         obj.open("POST", url, false);
        //         obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        //         obj.onreadystatechange = function() {
        //             var ret, err;
        //             if (obj.readyState == 4 && obj.status == 200 || obj.status == 304) {
        //                 ret = obj.responseText;
        //             } else {
        //                 err = obj.responseText;
        //             }
        //             fn.call(ret, err);
        //         };
        //         obj.send(data);
        //     } else {
        //         console.log(JSON.stringify(err))
        //     }
        // })
    }
}
