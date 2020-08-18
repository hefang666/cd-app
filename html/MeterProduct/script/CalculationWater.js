// 计算水费
var money = 0,
    sfmoney, ljmoney = 0,
    qtmoney = 0,
    dangemoney = 0;
var zxmoney = 0,
    zxsfmoney, zxljmoney = 0,
    zxqtmoney = 0,
    zxdangemoney = 0;
var Identification = 1 //在线计费是否成功标识1成功0失败，其他null不管
function fuContent(formula,WaterVolume,callback) {
    var yl = WaterVolume
    money = 0
    var blcontent;
    var contentwoter; //大括号水量水量与比例
    var woterbl //混合比例大括号里的比例
    var jsgsvalue = formula//公式
    console.log(JSON.stringify(jsgsvalue))
    var jsgs1 = jsgsvalue.split('{')
    var jsgs2 = jsgs1[1].split('}')
    var wacjsgs = jsgs2[0].split('}{') //循环大括号大括号可能多个
    for (var a = 0; a < wacjsgs.length; a++) {
        var firstString = wacjsgs[a].substr(0, wacjsgs[a].indexOf('[')) //获取10000~10000~1~0~
        var firstStringarr = firstString.split('~') //成数组得到比例要用
        var Proportion = firstStringarr[2] //比例
        var Proportionwoter = firstStringarr[3] //水量
        var lastString = wacjsgs[a].substr(wacjsgs[a].indexOf('['), wacjsgs[a].lastIndexOf(']')) //获取到后一段字符串
        var lastone = lastString.substr(lastString.indexOf('[') + 1, lastString.lastIndexOf(']') - 1)
            //1为非混合用水，0为固定水量，其他为混合用水

        if (Proportion == 1) {
            // 非混合用水
            xunhuan(yl, lastone)
        } else if (Proportion == 0) {

            if (yl <= Proportionwoter) {
                xunhuan(yl, lastone)
            } else {
                // yl-Proportionwoter;
                money += xunhuan(Proportionwoter, lastone)
            }
        } else {
            blcontent += Proportion
            if (blcontent != 1) { //标识还有一成大括号
                contentwoter = yl * Proportion
                var testfloat = /.*\..*/;
                if (testfloat.test(contentwoter)) { //判断是否为folat转成整形再复制
                    contentwoter = parseInt(contentwoter)
                } else {
                    contentwoter
                }
                xunhuan(contentwoter, lastone)
                woterbl += contentwoter
            } else { //等于1最后一个
                yl = yl - woterbl
                xunhuan(yl, lastone)
            }

        }

    }
    var obj = {
        money: money,
        dangemoney: dangemoney,
        ljmoney: ljmoney,
        qtmoney: qtmoney
    }
    callback(obj);
}
// 在线
function xunhuan(yl, lastone) {
    var lasttwo = lastone.split('][') //得到序号如[08@(0^116^2)(0^116^2),03@(0^116^2)]的数组
    for (var i = 0; i < lasttwo.length; i++) { //循环外层08@(0^116^2),03@(0^116^2)
        var dataarr = lasttwo[i].split('@')
        var xuCode = dataarr[0]
        var alongSF = 0
        var dataarrdata = dataarr[1]
        var ladder = dataarrdata.substr(dataarrdata.indexOf('(') + 1, dataarrdata.lastIndexOf(')') - 1) //去掉(0^116^2)(0^116^2)第一个（和最后一个）
        var ladderarrdata = ladder.split(')(') //得到0^116^2)(0^116^2用0)(拆分成数组0^116^2，0^116^2
        for (var j = 0; j < ladderarrdata.length; j++) { //循环阶级(0^116^2)(0^116^2)

            var dataarr1 = ladderarrdata[j].split('^') //拆分0^116^2
            var jsgsnumer = dataarr1[0]
            var jsgsworter = Number(dataarr1[1]) //阶梯水量
            var jsgsprice = Number(dataarr1[2]) //阶梯单价
            if (jsgsnumer == 0 && jsgsworter == -1) { //没阶梯算法
                sfmoney = yl * jsgsprice;
                money += yl * jsgsprice;
                alongSF += yl * jsgsprice;
            } else { //有阶梯算法
                if (jsgsworter != -1) {

                    if (yl - jsgsworter > 0) { //大于0当前比例*单价
                        money += jsgsworter * jsgsprice;
                        alongSF += jsgsworter * jsgsprice;
                        yl -= jsgsworter //
                    } else {
                        money += yl * jsgsprice;
                        alongSF += yl * jsgsprice;
                        break;
                    }

                } else {
                    money += yl * jsgsprice;
                    alongSF += yl * jsgsprice;
                    break;
                }

            }
        }
        if (xuCode == '01') {
            dangemoney = alongSF
        } else if (xuCode == '05') {
            ljmoney = alongSF
        } else {
            qtmoney += alongSF
        }
    }
}
// 在线计费
// 在线计费
var objdata = {};
function onlinejf(userCode,formula,WaterVolume,callback) {//用户编号，水量计算公式，用量，回调函数
    var yl = WaterVolume
    var retjf = db.selectSqlSync({
        name: 'CBtest',
        sql: 'select VALUE from MRM_DEPLOYS_BEAN WHERE CODE= "MRM_ONLINE_OFFLINE"'
    });
    if (retjf.status) {
        if (retjf.data[0].VALUE != '1') {
          if(api.connectionType!="none"){
            var Parameter = {
                "ClientId": api.deviceId,
                "ClientName": api.deviceModel,
                "OperatorId": $api.getStorage('cbOperatorId'),
                "OperatorName": $api.getStorage('cbOperatorName'),
                "YL": yl,
                "Type": "303",
                "YHBH": userCode
            };

            var Parameterdata = JSON.stringify(Parameter)
            var body = {
                body: JSON.stringify({
                    "UserName": $api.getStorage('cbOperatorName'),
                    "Password": $api.getStorage('cbPassword'),
                    "SerialNo": dataTime(),
                    "Method": "R999",
                    "Parameter": JSON.stringify(Parameter)
                })
            }
            fnPost1('', body, 'application/json', false, function(ret, err) {
                objdata.dangemoney = 0
                objdata.ljmoney = 0
                objdata.qtmoney = 0
                    // api.hideProgress();
                if (ret) {
                    if (ret.Status != 0) {
                        objdata.money = 0;
                        objdata.Identification = 0
                    } else {
                        var data = JSON.parse(ret.Data)
                        objdata.money = Number(data[0].MONEY)
                        objdata.Identification = 1;
                        var ret = objdata
                        callback(ret)
                    }
                } else {
                    fuContent(formula,WaterVolume,function(obj){
                      console.log(JSON.stringify(obj))
                      var ret = obj;
                      callback(ret)
                    })
                }

            })
          }else {
            fuContent(formula,WaterVolume,function(obj){
              console.log(JSON.stringify(obj))
              var ret = obj;
              callback(ret)
            })
          }

        } else {
          fuContent(formula,WaterVolume,function(obj){
            console.log(JSON.stringify(obj))
            var ret = obj;
            callback(ret)
          })
        }
    }
}


// 打印功能引用
  function printingText(text){//text：打印类容
    var orderInfo = text
    var printModule = api.require('posPrinter');
    var param = {
        'status': 'bonded'
    };
    printModule.getBluetoothPrinters(param, function(ret, err) {//要打印什么样的格式见orderInfo
        if (ret.length > 0) {
            var names = [];
            var addresss = [];
            for (var i = 0; i < ret.length; i++) {
                names.push(ret[i].name);
                addresss.push(ret[i].address);
            }

            api.actionSheet({
                buttons: names
            }, function(ret, err) {
                var index = ret.buttonIndex;
                if (index <= names.length) {
                    var name = names[index - 1];
                    var address = addresss[index - 1];

                    var param = {
                        printerAddr: address
                    };
                    printModule.getPrinterStatus(param, function(ret, err) {
                        if (!ret.online) {
                          alert(name + "未连接");
                          return;
                        }
                        if (!ret.paper) {
                          alert(name + "打印纸已用尽");
                          return;
                        }
                        //alert("是否联机：" + ret.online + ", 有打印纸：" + ret.paper + ", 钱箱开启：" + ret.cashboxOpen);

                        // var orderInfo;
                        // orderInfo = "<CA>通知单</CA><BR>";
                        // orderInfo += " <BR>";
                        // orderInfo += "用户编号:" + dataList.YHBH + "<BR>";
                        // orderInfo += "用户名称:" + dataList.YHMC + "<BR>";
                        // orderInfo += "用户地址:" + dataList.YHDZ + "<BR>";
                        // orderInfo += "表    号:" + dataList.SBBH + "<BR>";
                        // orderInfo += "上月水量:" + dataList.SCSL + "<BR>";
                        // orderInfo += "用 水 量:" + dataList.YL + "<BR>";
                        // orderInfo += "用水性质:" + dataList.YSXZ + "<BR>";
                        // //orderInfo += "污水金额:" + dataList.WSFJE + "<BR>";
                        // //orderInfo += "水费金额:" + dataList.SFJE + "<BR>";
                        // orderInfo += "合计金额:" + dataList.FY + "<BR>";
                        // orderInfo += "欠费金额:" + dataList.QFJE + "<BR>";
                        // orderInfo += "预存余款:" + dataList.YCYE + "<BR>";
                        // orderInfo += "合计应交金额:" + dataList.FYHJ + "<BR>";
                        // orderInfo += " <CUT>";

                        var printModule = api.require('posPrinter');
                        var param = {
                            taskList: [{
                                printerAddr: address,
                                content: orderInfo,
                                keepAlive: true, //蓝牙打印机，建议把keepAlive设为true
                                copyNum: 1
                            }]
                        };
                        printModule.printOnSpecifiedPrinters(param);
                    });
                }
            });
        } else {
            api.toast({
                msg: '请确定是否连接蓝牙打印机',
                duration: 2000,
                location: 'bottom'
            });

        }
    });

  }
