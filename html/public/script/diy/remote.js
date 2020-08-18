var now = Date.now();
var app;

function fnGet(path, where, page, limit, callback) {
    api.showProgress({
        title: '通信中',
        modal: false
    });
    var apipath;
    // var server = $api.getStorage('server');
    // if ($api.getStorage('net') == 'networks') {
    //     apipath = server.networks;
    // } else if ($api.getStorage('net') == 'areaNetwork') {
    //     apipath = server.areaNetwork;
    // }
    var addressUrl=$api.getStorage('Service_Address');
       apipath=addressUrl.address1;
    // var db = api.require('db');
    // (function (){
    //   db.selectSql({
    //       name: 'test',
    //       sql: 'SELECT * FROM Server'
    //   }, function(ret, err) {
    //       if (ret.status) {
    //        apipath=ret.data[0].ServerIp
    //       } else {
    //           console.log(JSON.stringify(err));
    //       }
    //   });
    // })();
    app = {
        apipath: apipath,
    };
    api.ajax({
        url: 'http://' + apipath + '/Api/' + path + '?filter={"where":' + JSON.stringify(where) + ',"page":' + page + ',"limit":' + limit + '}',
        method: 'get',
        timeout: 100,
        dataType: 'json',

    }, function(ret, err) {
        api.refreshHeaderLoadDone();
        api.hideProgress();
        callback(ret, err);
    });
};

function fnPost(path, data, contentType, isLogin, isPut, callback) {
    var headers = {};
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
    var server = $api.getStorage('server');
    if ($api.getStorage('net') == 'networks') {
        apipath = server.networks;
    } else if ($api.getStorage('net') == 'areaNetwork') {
        apipath = server.areaNetwork;
    };
    app = {
        apipath: apipath,
    };
    api.ajax({
        url: 'http://' + apipath + '/Api/' + path,
        method: isPut ? 'put' : 'post',
        timeout: 100,
        dataType: 'json',
        returnAll: false,
        headers: headers,
        data: data
    }, function(ret, err) {
        api.refreshHeaderLoadDone();
        //  api.hideProgress();
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
