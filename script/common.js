// console.log($api);
var apiUrl = 'http://' + $api.getStorage('apiUrl');
// console.log(apiUrl);

// var test = 'ceshi'
// var apiUrl = 'http://192.168.0.93:8002';
// var apiUrl = 'http://192.168.0.43:8889';
//字符串替换所有匹配字段
String.prototype.replaceAll = function(s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
}

/**
 * 日期转字符串
 * @param fmt
 * @returns
 */
Date.prototype.Format = function(fmt) {   
    var o = {       
        "M+": this.getMonth() + 1, //月份
               "d+": this.getDate(), //日
               "h+": this.getHours(), //小时
               "m+": this.getMinutes(), //分
               "s+": this.getSeconds(), //秒
               "q+": Math.floor((this.getMonth() + 3) / 3), //季度
               "S": this.getMilliseconds() //毫秒
               
    };   
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));   
    }
    for (var k in o) {      
        if (new RegExp("(" + k + ")").test(fmt)) {         
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));      
        }   
    }   
    return fmt;
}

//获取时分秒
function getTime(data) {
    var str = data;
    var num = str.indexOf("T");
    if (num != -1) {
        str = str.substr(num + 1);
        return str;
    } else {
        return "";
    }
}

//判断是否为空
function isEmpty(mixed_var) {
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

// 获取后端服务提供的公共参数
//     TenantId             租户ID，如果为null，则根据当前登录自动获取租户ID，为-1(这里假设ID都是从1开始的值)，则租户ID为null
//     OrgId                组织ID，如果为null，则根据当前登录自动获取组织ID
function getPublicParameter(TenantId, OrgId, ProductId, Code) {
    var result = null;
    var tenantId = TenantId;
    var orgId = OrgId;

    var loginInfo = $api.getStorage('UserLoginInfo');
    if (typeof loginInfo === 'object') {
        if (tenantId == null) tenantId = loginInfo.tenantInfo.tenantId;
        if (orgId == null) orgId = loginInfo.userInfo.orgId;
    }
    if (tenantId == -1) tenantId = null;

    var queryString = 'TenantId=' + tenantId + '&OrgId=' + orgId + '&ProductId=' + ProductId + '&Code=' + Code;
    var url = apiUrl + '/api/services/app/Authorization/GetPublicParameter?' + queryString;

    var obj = new XMLHttpRequest();
    obj.open('GET', url, false);
    obj.send(null);
    // alert('地址：' + url + '\r\n响应：' + obj.responseText);
    var ret = getResultfromXMLHttpRequest(obj);
    if (ret) result = ret.value;

    return result;
}

// 从XMLHttpRequest请求对象中返回结果，如果请求失败返回null
function getResultfromXMLHttpRequest(objXMLHttpRequest) {
    var result = null;
    var errCode = null;
    var errText = null;

    if (objXMLHttpRequest != null) {
        if (objXMLHttpRequest.readyState == 4 && objXMLHttpRequest.status == 200 || objXMLHttpRequest.status == 304) {
            var response = $api.strToJson(objXMLHttpRequest.responseText);
            if (response && response.success) {
                result = response.result;
            } else {
                errText = response.error;
            }
        } else {
            errCode = objXMLHttpRequest.status;
            errText = objXMLHttpRequest.statusText;
        }
    }

    if (errText) {
        api.toast({
            msg: '错误号：' + errCode + '\r\n描述：' + errText,
            duration: 5000,
            location: 'top'
        });
    }

    return result;
}

// 获取当前屏幕的方向，即是横屏还是竖屏显示
function getOrientation() {
    return (window.orientation == 90 || window.orientation == -90 ? 'landscape' : 'portrait');
}

// 设置屏幕横屏或竖屏显示
function setOrientation(orientation) {
    var curOrientation = getOrientation();
    if (orientation && orientation != curOrientation) {
        if (orientation == 'portrait') {
            api.setScreenOrientation({
                orientation: 'auto_portrait'
            });
        } else {
            api.setScreenOrientation({
                orientation: 'auto_landscape'
            });
        }
    }
}

//ios向右滑动时设置状态栏颜色
function setIOSBar() {
    api.addEventListener({
        name: 'viewdisappear'
    }, function(ret, err) {
        if (api.systemType == 'ios') {
            api.setStatusBarStyle({
                style: 'light',
            });
        }
    });
}

function changeFontSize(){
  var changeSize = $api.getStorage('fontSize');
  if(changeSize == undefined || changeSize == 'normal'){
    document.body.style.setProperty('--fontsize9', '0.9rem');
    document.body.style.setProperty('--fontsize85', '0.85rem');
    document.body.style.setProperty('--fontsize8', '0.8rem');
    document.body.style.setProperty('--fontsize75', '0.75rem');
    document.body.style.setProperty('--fontsize7', '0.7rem');
    document.body.style.setProperty('--fontsize65', '0.65rem');
    document.body.style.setProperty('--fontsize6', '0.6rem');
    document.body.style.setProperty('--fontsize55', '0.55rem');
    document.body.style.setProperty('--fontsize5', '0.5rem');
    document.body.style.setProperty('--fontsize45', '0.45rem');
    document.body.style.setProperty('--fontsize4', '0.4rem');
    document.body.style.setProperty('--width2', '2rem');
    document.body.style.setProperty('--width34', '3.4rem');
    document.body.style.setProperty('--width42', '4.2rem');
  }else if(changeSize == 'large'){
    document.body.style.setProperty('--fontsize9', '0.99rem');
    document.body.style.setProperty('--fontsize85', '0.935rem');
    document.body.style.setProperty('--fontsize8', '0.88rem');
    document.body.style.setProperty('--fontsize75', '0.825rem');
    document.body.style.setProperty('--fontsize7', '0.77rem');
    document.body.style.setProperty('--fontsize65', '0.715rem');
    document.body.style.setProperty('--fontsize6', '0.66rem');
    document.body.style.setProperty('--fontsize55', '0.605rem');
    document.body.style.setProperty('--fontsize5', '0.55rem');
    document.body.style.setProperty('--fontsize45', '0.495rem');
    document.body.style.setProperty('--fontsize4', '0.44rem');
    document.body.style.setProperty('--width2', '2.2rem');
    document.body.style.setProperty('--width34', '3.74rem');
    document.body.style.setProperty('--width42', '4.62rem');
  }else if(changeSize == 'small'){
    document.body.style.setProperty('--fontsize9', '0.81rem');
    document.body.style.setProperty('--fontsize85', '0.765rem');
    document.body.style.setProperty('--fontsize8', '0.72rem');
    document.body.style.setProperty('--fontsize75', '0.675rem');
    document.body.style.setProperty('--fontsize7', '0.63rem');
    document.body.style.setProperty('--fontsize65', '0.585rem');
    document.body.style.setProperty('--fontsize6', '0.54em');
    document.body.style.setProperty('--fontsize55', '0.495rem');
    document.body.style.setProperty('--fontsize5', '0.45rem');
    document.body.style.setProperty('--fontsize45', '0.405rem');
    document.body.style.setProperty('--fontsize4', '0.36rem');
    document.body.style.setProperty('--width2', '1.8rem');
    document.body.style.setProperty('--width34', '3.06rem');
    document.body.style.setProperty('--width42', '3.78rem');
  }
}

changeFontSize();

//图标颜色取值
var echatsColor = ['#9968F7','#F3983A','#5EBFF3','#70DD78','#3052F5','#ED536C','#DD5CF3','#8E8CC4','#FDF366'];

// 验证手机号码
function checkTrue( that) {
  // .replace(/:/g,'')去掉特殊字符
 var name = $(that).attr('attr-name').replace('',"");
 var value = $(that).val();
 if(!(value.match(/^((0\d{2,3}-\d{7,8})|(1[35847]\d{9}))$/))){
   api.toast({
       msg:''+name+'格式不正确',
       duration: 2000,
       location: 'top'
   });
    return false;
 }


}
// 验证手机号码
function checkPhone( name,value) {
 if(!(value.match(/^((0\d{2,3}-\d{7,8})|(1[35847]\d{9}))$/))){
   api.toast({
       msg:''+name+'格式不正确',
       duration: 2000,
       location: 'top'
   });
    return false;
 } else {
   return true;
 }
}

//
// // zxf 模拟弹窗
//    function dialogAlert(params,callback){
//        $('.dilogMark').show();
//        if(params.title!=null || params.title!=undefined){
//           $('.dialog_title span').text(params.title);
//        }
//        if(params.content!='' || params.content!=undefined){
//           $('.dialog_body span').text(params.content);
//        }
//        if(params.buttons.length != 0 || params.buttons!=undefined){
//          var buttons = params.buttons;
//          var str = ''
//           for(let i=0;i<buttons.length;i++){
//              str += `<div class="dialogBtn" data-attr='${i+1}'>${buttons[i]}</div>`;
//           }
//           $('.dialog_footer').html('');
//           $('.dialog_footer').append(str);
//        }
//       checkDialogBtn(callback);
//    };
//    function checkDialogBtn(callback){
//      var dialogBtn = $('.dialogBtn');
//       $(dialogBtn[dialogBtn.length-1]).addClass('noneBorder');
//      var isClose = false;
//      for(let i=0;i<dialogBtn.length;i++){
//        $(dialogBtn[i]).on('click',function(){
//            var index= $(this).attr('data-attr');
//             //  确定
//              var data ={
//                buttonIndex:index
//              }
//              callback(data);
//              $('.dilogMark').hide();
//              isClose =true;
//        });
//        if(isClose){
//          break;
//        }
//      }
//
//
//    }
//
//
//
   // zxf 模拟弹窗
      function dialogAlert(params,callback){
          var BtnNumbers = '';
          if(params.buttons.length != 0 || params.buttons!=undefined){
            var buttons = params.buttons;
             for(var i=0;i<buttons.length;i++){
                BtnNumbers += '<div class="dialogBtn" data-attr="'+ (i+1) + '">${buttons[i]}</div>';
             }
          }
          if(BtnNumbers == ''){
            BtnNumbers ='<div class="dialogBtn" data-attr="1">确定</div><div class="dialogBtn" data-attr="2">取消</div>';
          }
          var HtmlCentent = '<div class="dilogMark">' +
                '<div class="dialogBox">' +
                    '<div class="dialog_title"><span>' + (params.title!="" || params.title!=undefined  || params.title!= null ?params.title : "提示") + '</span></div>' +
                    '<div class="dialog_body"><span>' + (params.content !="" || params.content !=undefined ? params.content:"确定要操作吗") + '</span></div>'
                    '<div class="dialog_footer">'
                       + BtnNumbers +
                    '</div>'
                '</div>' +
            '</div>';
            // 在标签结束前添加html内容
         document.body.insertAdjacentHTML('beforeend', HtmlCentent);
          // 为按钮添加单击事件
         checkDialogBtn(callback);
      };
      function checkDialogBtn(callback){
        var dialogBtn = $('.dialogBtn');
         $(dialogBtn[dialogBtn.length-1]).addClass('noneBorder');
        var isClose = false;
        for(var i=0;i<dialogBtn.length;i++){
          $(dialogBtn[i]).on('click',function(){
               $(this).addClass("active");
              var index= $(this).attr('data-attr');
               //  确定
                var data ={
                  buttonIndex:index
                }
                callback(data);
              // 移除标签
                document.body.removeChild(document.querySelector('.dilogMark'));

                isClose =true;
          });
          if(isClose){
            break;
          }
        }
      }
