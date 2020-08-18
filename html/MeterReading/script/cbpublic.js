function getCurUserInfo() {
    $api.clearStorage();
    var user = $api.getStorage('curUser');
    return user;
}


function formatUnixTime(argument) {
    var ts = arguments[0] || 0;
    var t, y, m, d, h, i, s;
    t = ts ? new Date(ts * 1000) : new Date();
    y = t.getFullYear();
    m = t.getMonth() + 1;
    d = t.getDate();
    h = t.getHours();
    i = t.getMinutes();
    s = t.getSeconds();
    return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d) + ' ' + (h < 10 ? '0' + h : h) + ':' + (i < 10 ? '0' + i : i) + ':' + (s < 10 ? '0' + s : s);
}


function formatUnixTimeNoSs(argument) {
    var ts = arguments[0] || 0;
    var t, y, m, d, h, i, s;
    t = ts ? new Date(ts * 1000) : new Date();
    y = t.getFullYear();
    m = t.getMonth() + 1;
    d = t.getDate();
    h = t.getHours();
    i = t.getMinutes();
    s = t.getSeconds();
    return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d) + ' ' + (h < 10 ? '0' + h : h) + ':' + (i < 10 ? '0' + i : i);
}


function formatUnixTimeNoYear(argument) {
    var ts = arguments[0] || 0;
    var t, y, m, d, h, i, s;
    t = ts ? new Date(ts * 1000) : new Date();
    y = t.getFullYear();
    m = t.getMonth() + 1;
    d = t.getDate();
    h = t.getHours();
    i = t.getMinutes();
    s = t.getSeconds();
    return (h < 10 ? '0' + h : h) + ':' + (i < 10 ? '0' + i : i) + ':' + (s < 10 ? '0' + s : s);
}


function close_frame(argument) {
    api.closeFrame({
        name: argument
    });
}

Date.prototype.format = function(format) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};

function getFormatDateByLong(l, pattern) {

    return getFormatDate(new Date(l), pattern);
};

function getFormatDate(date, pattern) {
    if (date == undefined) {
        date = new Date();
    }
    if (pattern == undefined) {
        pattern = "yyyy-MM-dd hh:mm:ss";
    }
    return date.format(pattern);
};

var pattern = "yyyy-MM-dd hh:mm:ss";


function getPicture(sourceType) {

    if (sourceType == 1) { // 拍照
        api.getPicture({
            sourceType: 'camera',
            encodingType: 'jpg',
            mediaValue: 'pic',
            allowEdit: false,
            destinationType: 'base64',
            quality: 90,
            saveToPhotoAlbum: true
        }, function(ret, err) {
            if (ret) {
                // $('#imgUp').attr('src', ret.base64Data);
                parentCallBackFun(ret);
            } else {
                alert(JSON.stringify(err));
            }
        });
    } else if (sourceType == 2) { // 从相机中选择
        api.getPicture({
            sourceType: 'library',
            encodingType: 'jpg',
            mediaValue: 'pic',
            destinationType: 'base64',
            quality: 50,
            targetWidth: 750,
            targetHeight: 750
        }, function(ret, err) {
            if (ret) {
                // alert(JSON.stringify(ret));
                parentCallBackFun(ret);
                // $('#imgUp').attr('src', ret.base64Data)
                /*	alert(JSON.stringify(ret));
                  var aa=ret.base64Data;
                  api.ajax({
                      type:"post",
                      url:"http://www.yuechebang.cn/Oauth/Api/index",
                      data:{base64:aa},
                      dataType:'json',
                      async:true,
                  },function(ret,err){
                      if(ret){
                          $('#imgUp').attr('src',aa)
                      }else{
                          api.alert(err);
                      }
                  })*/
            } else {
                alert(JSON.stringify(err));
            }
        });
    }
}



function emptyempty(mixed_var) {
    var key;
    if (mixed_var === "" || mixed_var === 0 || mixed_var === "0" || mixed_var === null || mixed_var === false || typeof mixed_var === 'undefined') {
        return true;
    }
    if (typeof mixed_var == 'object') {
        for (key in mixed_var) {
            return false;
        }
        return true;
    }
    return false;
}
//检测

function testNetIpRe(netIp) {
    var allNet = /^((2[0-4]\d|25[0-5]|[1-9]?\d|1\d{2})\.){3}(2[0-4]\d|25[0-5]|[1-9]?\d|1\d{2})\:([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$$/;
    var AllNets = new RegExp(allNet)
    if (AllNets.test(netIp)) {
        console.log(true)
        return true;
    } else {
        api.toast({
            msg: '网址格式错误',
            duration: 2000,
            location: 'bottom'
        });
        return false;
    }
}

function testAreaNetIpRe(netIp) {
    var testAreaNetRe = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\:([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/;
    var AreaNetre = new RegExp(testAreaNetRe);
    if (AreaNetre.test(netIp)) {
        console.log(true)
        return true;
    } else {
        // api.toast({
        //     msg: '网址格式错误',
        //     duration: 2000,
        //     location: 'bottom'
        // });
        return false;
    }
}

function fnReady() {
    fnReadyKeyback();
    fnReadyOpenWin();
    fnReadyHeader();
    fnReadyNav();
    fnReadyFooter();
    fnReadyOtherHeader();
};

function fnReadyKeyback() {
    var keybacks = $api.domAll('.event-back');
    for (var i = 0; i < keybacks.length; i++) {
        $api.attr(keybacks[i], 'tapmode', 'highlight');
        keybacks[i].onclick = function() {
            api.closeWin();
        };
    }

    api.parseTapmode();
};

function fnReadyOpenWin() {
    var buttons = $api.domAll('.open-win');
    var touchEvent;
    for (var i = 0; i < buttons.length; i++) {
        $api.attr(buttons[i], 'tapmode', 'highlight');
        buttons[i].ontouchstart = function(e) {
            e.preventDefault;
        }
        buttons[i].ontouchmove = function() {
            touchEvent = true;
        }
        buttons[i].ontouchend = function() {
            if (!touchEvent) {
                var target = $api.closest(this, '.open-win');
                var winName = $api.attr(target, 'win'),
                    isNeedLogin = $api.attr(target, 'login'),
                    param = $api.attr(target, 'param');
                if (isNeedLogin == 'true' && !$api.getStorage('loginUser')) {
                    winName = 'login';
                }

                var v_animation = {};
                if (param) {
                    param = JSON.parse(param);
                }

                if (winName == 'login') {
                    v_animation.type = 'push';
                    v_animation.subType = 'from_bottom';
                    v_animation.duration = 400;
                }
                var winOpenName = winName.replace('html/', '');
                var index = winName.lastIndexOf('/');
                if (index != -1) {
                    winOpenName = winOpenName.substring(index + 1);
                }
                api.openWin({

                    name: winOpenName,
                    overScrollMode: 'always',
                    url: './' + winName + '.html',
                    pageParam: param,
                    animation: v_animation
                });
            }
            touchEvent = false;
        };
    }
    // api.parseTapmode();
};

var header, headerHeight = 0;

function fnReadyHeader() {
    header = $api.byId('aui-header');
    if (header) {
        if (api.statusBarAppearance) {
            $api.fixStatusBar(header);
        }
        // $api.fixIos7Bar(header);
        headerHeight = $api.offset(header).h;
    }
};


var otherHeader, otherHeaderHeight = 0;

function fnReadyOtherHeader() {
    otherHeader = $api.byId('other-header');
    if (otherHeader) {
        otherHeaderHeight = $api.offset(otherHeader).h;
    }
};


var nav, navHeight = 0;

function fnReadyNav() {
    nav = $api.byId('nav');
    if (nav) {
        navHeight = $api.offset(nav).h;
    }
};

var footer, footerHeight = 0;

function fnReadyFooter() {
    footer = $api.byId('footer');
    if (footer) {
        footerHeight = $api.offset(footer).h;
    }
};

function fnReadyFrame(bounces) {
    var tmp_bounces = true;
    try {
        if (!bounces) {
            tmp_bounces = bounces
        }
    } catch (error) {
        tmp_bounces = true;
    }

    var frameName = api.winName + '_frm';
    // alert( api.winHeight - headerHeight - footerHeight - navHeight -otherHeaderHeight)
    api.openFrame({
        name: frameName,
        overScrollMode: 'always',
        url: './' + frameName + '.html',
        bounces: tmp_bounces,
        bgColor: '#f0f0f0',
        rect: {
            x: 0,
            y: headerHeight + navHeight + otherHeaderHeight,
            w: 'auto',
            h: api.winHeight - headerHeight - footerHeight - navHeight - otherHeaderHeight
        },
        pageParam: api.pageParam
    });
};



function checkUserLogin() {
    var loginFlag = false;
    var user;
    user = $api.getStorage('loingUser');

    if (user == null || user == undefined) {
        loginFlag = false;
    } else {
        loginFlag = true;
    }
    return loginFlag;
}
// $("body").on('click','[data-action]',function () {
//     var actionName = $(this).data('action');
//     var action = actionList[actionName];
//     if ($.isFunction(action)) action.call($(this));
// });
// $("body").on('input','[data-oninput]',function () {
//     var actionName = $(this).data('oninput');
//     var action = oninputList[actionName];
//     if ($.isFunction(action)) action.call($(this));
// });
function operationDom() {
    var antions = $api.domAll('[data-action]');
    // alert("数量为"+antions.length)
    var touchEvent;
    for (var i = 0; i < antions.length; i++) {
        antions[i].ontouchstart = function(e) {
            e.preventDefault;
        }
        antions[i].ontouchmove = function() {
            touchEvent = true;
        }
        antions[i].ontouchend = function() {
            if (!touchEvent) {
                var target = this;
                var actionName = $api.attr(target, 'data-action');
                // var num=$api.attr(target,'data-id')
                // alert(actionName)
                var action = actionList[actionName]
                action.call(target);
            }
            touchEvent = false;
        }
    }
}
operationDom();

function operatOninput() {
    var oninputs = $api.domAll('[data-oninput]');
    for (var i = 0; i < oninputs.length; i++) {
        oninputs[i].oninput = function() {
            var target = this;
            var oninputName = $api.attr(target, 'data-oninput');

            var oninput = oninputList[oninputName]
            oninput.call(target);
        }
    }
}
operatOninput();

function exitApp() {
    api.addEventListener({
        name: 'keyback'
    }, function(ret, err) {
        api.closeWidget({
            id: 'A6083686772109',
            retData: {
                name: 'closeWidget'
            },
            animation: {
                type: 'flip',
                subType: 'from_bottom',
                duration: 500
            }
        });
    });
}
//定位当前位置
function locationCur(el) {
    api.showProgress({
        style: 'default',
        animationType: 'fade',
        title: '定位中...',
        text: '请稍候...',
        modal: false
    });
    var bMap = api.require('bMap');
    bMap.getLocation({
        accuracy: '100m',
        autoStop: true,
        filter: 1
    }, function(ret, err) {
        if (ret.status) {
            lat = ret.lat;
            lon = ret.lon;

            console.log(JSON.stringify(ret));
            $api.attr(el, 'data-Locations', ret.lat + ',' + ret.lon);
            bMap.getNameFromCoords({
                lon: lon,
                lat: lat
            }, function(ret, err) {
                if (ret.status) {
                    console.log(JSON.stringify(ret));
                    $api.html(el, ret.address);
                }
            });
        } else {
            console.log(JSON.stringify(err));
        }
        api.hideProgress();
    });
}

function TypeIos() {
    if (api.systemType == 'ios') {
        $('.li_hr').css({
            width: '17.8rem'
        });
    }
}
// function getLocationCurNonet(el){
//   // api.showProgress({
//   //     style: 'default',
//   //     animationType: 'fade',
//   //     title: '定位中...',
//   //     modal: true
//   // });
//   var bMap = api.require('bMap');
//   bMap.getLocation({
//       accuracy: '10m',
//       autoStop: true,
//       filter: 1
//   }, function(ret, err) {
//       if (ret.status) {
//           alert(JSON.stringify(ret));
//       } else {
//           alert(err.code);
//       }
//   });
// }

/*
 * 文本框根据输入内容自适应高度
 * @param                {HTMLElement}        输入框元素
 * @param                {Number}                设置光标与输入框保持的距离(默认0)
 * @param                {Number}                设置最大高度(可选)
 */
var autoTextarea = function(elem, extra, maxHeight) {
    extra = extra || 0;
    var isFirefox = !!document.getBoxObjectFor || 'mozInnerScreenX' in window,
        isOpera = !!window.opera && !!window.opera.toString().indexOf('Opera'),
        addEvent = function(type, callback) {
            elem.addEventListener ?
                elem.addEventListener(type, callback, false) :
                elem.attachEvent('on' + type, callback);
        },
        getStyle = elem.currentStyle ? function(name) {
            var val = elem.currentStyle[name];


            if (name === 'height' && val.search(/px/i) !== 1) {
                var rect = elem.getBoundingClientRect();
                return rect.bottom - rect.top -
                    parseFloat(getStyle('paddingTop')) -
                    parseFloat(getStyle('paddingBottom')) + 'px';
            };

            return val;
        } : function(name) {
            return getComputedStyle(elem, null)[name];
        },
        minHeight = parseFloat(getStyle('height'));

    elem.style.resize = 'none';

    var change = function() {
        var scrollTop, height,
            padding = 0,
            style = elem.style;

        if (elem._length === elem.value.length) return;
        elem._length = elem.value.length;

        if (!isFirefox && !isOpera) {
            padding = parseInt(getStyle('paddingTop')) + parseInt(getStyle('paddingBottom'));
        };
        scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

        elem.style.height = minHeight + 'px';
        if (elem.scrollHeight > minHeight) {
            if (maxHeight && elem.scrollHeight > maxHeight) {
                height = maxHeight - padding;
                style.overflowY = 'auto';
            } else {
                height = elem.scrollHeight - padding;
                style.overflowY = 'hidden';
            };
            style.height = height + extra + 'px';
            scrollTop += parseInt(style.height) - elem.currHeight;
            document.body.scrollTop = scrollTop;
            document.documentElement.scrollTop = scrollTop;
            elem.currHeight = parseInt(style.height);
        };
    };

    addEvent('propertychange', change);
    addEvent('input', change);
    addEvent('focus', change);
    change();
};

function getTime(type) {
    var date = new Date()
    var time = null
    switch (type) {
        case 'year':
            time = date.getFullYear().toString()
            break
        case 'month':
            time = date.getMonth() + 1
            time = time.toString().length === 2 ? time : ('0' + time)
            break
        case 'day':
            time = date.getDate()
            time = time.toString().length === 2 ? time : ('0' + time)
            break
        case 'hour':
            time = date.getHours()
            time = time.toString().length === 2 ? time : ('0' + time)
            break
        case 'minute':
            time = date.getMinutes()
            time = time.toString().length === 2 ? time : ('0' + time)
            break
        case 'second':
            time = date.getSeconds()
            time = time.toString().length === 2 ? time : ('0' + time)
            break
    }
    return time
}

function Time(type) {
    var date = new Date()
    var time = null
    switch (type) {
        case 'year':
            time = date.getFullYear().toString()
            break
        case 'month':
            time = date.getMonth() + 1
            time = time.toString().length === 2 ? time : ('0' + time)
            break
        case 'day':
            time = date.getDate()
            time = time.toString().length === 2 ? time : ('0' + time)
            break
        case 'hour':
            time = date.getHours()
            time = time.toString().length === 2 ? time : ('0' + time)
            break
        case 'minute':
            time = date.getMinutes()
            time = time.toString().length === 2 ? time : ('0' + time)
            break
        case 'second':
            time = date.getSeconds()
            time = time.toString().length === 2 ? time : ('0' + time)
            break
    }
    return time
}

function dataTime() {
    var year = Time("year"); //获取系统的年；
    var month = Time("month"); //获取系统月份，由于月份是从0开始计算，所以要加1
    var day = Time("day"); //获取系统日
    var hour = Time("hour"); //获取系统时间
    var minute = Time("minute"); //分
    var second = Time("second"); //秒：
    var dayTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
    return dayTime;
}
// 参数
var params = {
        startWater: 543, //起度
        endWater: 560, //止度
        lastWaterAmounts: 30, //上次水量
        greaterThan: { //大于30,小于等于100 的量高和量低的倍数
            highVolume: 1.5, //量高
            lowVolume: 0.5, //量低
        },
        lessThan: { // 大于100 的
            highVolume: 1.3, //量高
            lowVolume: 0.7, //量低
        }

    }
    // // 请求方式
    // JudgeWaterAbnormal(params, function(text) {
    // 	console.log(text)
    // });

function JudgeWaterAbnormal(params, callback) { //判断水量是否异常
    var startWater = parseInt(params.startWater);
    var endWater = parseInt(params.endWater);
    var lastWaterAmounts = parseInt(params.lastWaterAmounts);
    var currentWaterAmounts = endWater - startWater;
    var greaterThan = params.greaterThan;
    var lessThan = params.lessThan;
    if (currentWaterAmounts > 30 && currentWaterAmounts <= 100) {
        switch (true) {
            case currentWaterAmounts > (lastWaterAmounts * greaterThan.highVolume):
                text = '量高';
                callback(text);
                break;
            case currentWaterAmounts < (lastWaterAmounts * greaterThan.lowVolume):
                text = '量低';
                callback(text);
                break;
            default:
                text = '正常';
                callback(text);
                break;
        }

    }
    if (currentWaterAmounts > 100) {
        switch (true) {
            case currentWaterAmounts > (lastWaterAmounts * lessThan.highVolume):
                text = '量高';
                callback(text);
                break;
            case currentWaterAmounts < (lastWaterAmounts * lessThan.lowVolume):
                text = '量低';
                callback(text);
                break;
            default:
                text = '正常';
                callback(text);
                break;
        }
    }
    if (currentWaterAmounts < 30) {
        text = '正常';
        callback(text);
    }

}

function JudgeWaterAbnormalResult(params) { //判断水量是否异常   0 正常  1 异常偏高  2 异常偏低
    var startWater = parseInt(params.startWater);//起度
    var endWater = parseInt(params.endWater);//止度
    var lastWaterAmounts = parseInt(params.lastWaterAmounts);//上月用量
    var currentWaterAmounts = endWater - startWater;//本月用量
    var greaterThan = params.greaterThan;//大于30,小于等于100 的量高和量低的倍数
    var lessThan = params.lessThan;// 大于100 的量高和量低的倍数
    var result = {
        value: 0,
        text: "正常"
    };
    if (currentWaterAmounts >= 30) {
        switch (true) {
            case currentWaterAmounts > (lastWaterAmounts * 2):
                result.text = '异常偏高';
                result.value = 1;
                return result;
                break;
            default:
                result.text = '正常';
                result.value = 0;
                return result;
                break;
        }

    }
    if (currentWaterAmounts <= 30 && currentWaterAmounts >=0) {
        result.text = '正常';
        result.value = 0;
        return result;
    }
    if (currentWaterAmounts < 0) {
        result.text = '异常偏低';
        result.value = 2;
        return result;
    }
}

function dataQuery() {
    var LoginName = $api.getStorage('loginData').userName;
    var db = api.require("db");
    //用户数据是否有未上传的数据
    var ret = db.selectSqlSync({
        name: 'CBtest',
        sql: 'SELECT * FROM MRM_USER_BEAN where CBBZ=1 and ZTSCCG=0 and CWXX=" " and userName="' + LoginName + '"'
    });
    if (ret.status) {
        if (ret.data.length > 0) {
            return true;
        }
    }
    //用户图片是否有未上传的数据
    var ret = db.selectSqlSync({
        name: 'CBtest',
        sql: 'select * from MRM_PHOTOS_BEAN where SFSC=0 and userName="' + LoginName + '" and YHBH in (select YHBH from MRM_USER_BEAN where CBBZ=1 and ZTSCCG=1)'
    });
    if (ret.status) {
        if (ret.data.length > 0) {
            return true;
        }
    }
    //工单数据是否有未上传的数据
    var ret = db.selectSqlSync({
        name: 'CBtest',
        sql: 'select * from MRM_WORKORDER_BEAN where SFSC="0" and userName="' + LoginName + '"'
    });
    if (ret.status) {
        if (ret.data.length > 0) {
            return true;
        }
    }
    //工单图片是否有未上传的数据
    var ret = db.selectSqlSync({
        name: 'CBtest',
        sql: 'select * from MRM_WORKORDERPHOTOS_BEAN where SFSC=0 and userName="' + LoginName + '" and YHBH in (select YHBH from MRM_WORKORDER_BEAN where SFSC=1)'
    });
    if (ret.status) {
        if (ret.data.length > 0) {
            return true;
        }
    }
    return false;
}
