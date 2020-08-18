function fnIntVue() {
    window.MeterReadVue = new Vue({
        el: '#MeterRead',
        data: {//数据渲染
            UserList: [], //当前抄表册所有用户数据
            UserNumber: 0, //当前用户的索引
            FromPage: api.pageParam.name, //从哪个页面点击进来
            cbch: api.pageParam.userCode, //抄表册编号
            YHBH: api.pageParam.useryhbh, //用户编号
            sendUpload:$api.getStorage("sendUpload"), // 是否自动上传数据
            sendUploadPicture:$api.getStorage("sendUploadPicture"), //是否自动上传图片
            sendNext:$api.getStorage("sendNext"),  //是否自动跳转到下一户
            ImgType: [], //图片类型
            ImgData: [], //图片数据
            editDegrees: true, //编辑读数
            editConsumption: false, //编辑用量
            editSJBM: false, //编辑实际表码
            editNewMeterNo:false, //编辑新表表号
            showLight: false, //是否打开闪光灯
            SLLRFS: 1, //水量录入方式（正常、估抄）  非正常时需强制拍照
            AbnormalParams: { //判断异常水量的参数
                startWater: 0, //起度
                endWater: 0, //止度
                lastWaterAmounts: 0, //上次水量
                greaterThan: { //大于30,小于等于100 的量高和量低的倍数
                    highVolume: 1.5, //量高
                    lowVolume: 0.5, //量低
                },
                lessThan: { // 大于100 的
                    highVolume: 1.3, //量高
                    lowVolume: 0.7, //量低
                }
            },
            BYXZT: 1, //水表运行状态编码
            SBYXZT: "正常", //水表运行状态
            ZD: 0, //读数
            YL: 0, //用量
            SJBM: 0, //实际表码
            XBBH:"", //新表表号
            PATH:"",//表位图片
            timer:null,
            preventRepeatTouch:false
        },
        computed: {
            UserDetails: function() { //用户详情数据
                if (this.UserList.length == 0) {
                    return {};
                } else {
                    var details = this.clearObjectSpace(this.UserList[this.UserNumber]);
                    return details;
                }
            },
            // 对象语法<div v-bind:class="{changeDegrees:NeedDegrees,Required:NeedDegrees}"></div>
            NeedDegrees: function() { //是否需要录入读数
                if((this.BYXZT == 1 || this.BYXZT == 10040 || this.BYXZT == " " || this.BYXZT == "") && this.UserDetails.CBBZ != "1") {
                    return true;
                } else {
                    return false;
                }
            },
            NeedConsumption: function() { //是否需要录入用量
                if ((this.BYXZT == 3 || this.BYXZT == 5 || this.BYXZT == 11 || this.BYXZT == 20 || this.BYXZT == 21 || this.BYXZT == 6 || this.BYXZT == 7 || this.BYXZT == 22 || this.BYXZT == 23 || this.BYXZT == 24) && this.UserDetails.CBBZ != "1") {
                    return true;
                } else {
                    return false;
                }
            },
            NeedSJBM: function() { //是否需要录入实际表码
                if ((this.BYXZT == 11 || this.BYXZT == 4 || this.BYXZT == 10 || this.BYXZT == 27) && this.UserDetails.CBBZ != "1") {
                    return true;
                } else {
                    return false;
                }
            },
            NeedXBBH: function() { //是否需要录入新表表号
                if (this.BYXZT == 4 && this.UserDetails.CBBZ != "1") {
                    return true;
                } else {
                    return false;
                }
            },
            hasChanged() { //判断双向绑定的数据是否发生了改变
                if (this.PATH != this.UserDetails.PATH || this.XBBH != this.UserDetails.XBBH || this.BYXZT != this.UserDetails.BYXZT || this.SBYXZT != this.UserDetails.SBYXZT || this.ZD != this.UserDetails.ZD || this.YL != this.UserDetails.YL || this.SJBM != this.UserDetails.SJBM || this.ImgData.length != 0) {
                    return true;
                } else {
                    return false;
                }
            },
            JSYPJL: function() { //近三月平均用水量
                if (this.hasUserDetails) {

                    if (this.UserDetails.JSYYSL !="") {
                        var JSYPJLs = this.UserDetails.JSYYSL.split("/");
                        return parseInt((parseInt(JSYPJLs[0]) + parseInt(JSYPJLs[1]) + parseInt(JSYPJLs[2])) / 3);
                    } else {
                        return 0;
                    }
                } else {
                    return 0;
                }
                // console.log()
            },
            hasUserDetails: function() { //是否获取到了用户详情数据
                return !this.isEmptyObject(this.UserDetails);
            },
            showActualCode: function() { //是否显示实际表码
                if (this.BYXZT == 11 || this.BYXZT == 4 || this.BYXZT == 10 || this.BYXZT == 27) {
                    return true;
                } else {
                    return false;
                }
            },
            showDegreesAndAmount: function() { //是否显示用量
                if (this.BYXZT == 27) {
                    return false;
                } else {
                    return true;
                }
            },
            NeedPhotograph: function() { //是否需要强制拍照
                if (this.UserDetails.SFQZPZ == "1" || (this.SLLRFS != 1 && this.SLLRFS != "1") || (this.BYXZT != 1 && this.BYXZT != 10040 && this.BYXZT != "" && this.BYXZT != " ")) {
                    return true;
                } else {
                    return false;
                }
            },
            AbnormalStatus: function() { //用量异常判断
                this.AbnormalParams.startWater = this.UserDetails.QD;
                this.AbnormalParams.endWater = this.ZD;
                this.AbnormalParams.lastWaterAmounts = this.UserDetails.SCSL;
                var abnormal = JudgeWaterAbnormalResult(this.AbnormalParams);
                if (abnormal == undefined) {
                    abnormal = {
                        text: "正常",
                        value: 0
                    }
                };
                if (this.BYXZT == 4 || this.BYXZT == 10 || this.BYXZT == 12 || this.BYXZT == 25 || this.BYXZT == 26 || this.BYXZT == 27 || abnormal.value == 0) {
                    return {
                        status: true,
                        text: "正常",
                        value: 0
                    }
                } else {
                    return {
                        status: false,
                        text: abnormal.text,
                        value: abnormal.value
                    }
                }
            },
            isAppendImg: function() { //已抄状态下是否追加了抄表图片
                for (var i = 0; i < this.ImgData.length; i++) {
                    if (this.ImgData[i].isAppend) {
                        return true;
                    }
                }
                return false;
            },
            hasMeterLocationImg(){  //是否添加了表位图片
              for (var i = 0; i < this.ImgData.length; i++) {
                  if (this.ImgData[i].data.NotLoction != "0") {
                      return true;
                  }
              }
              return false;
            }
        },
        watch: {
            UserDetails: {
                handler: function(val, oldVal) {
                    if (this.isEmptyObject(oldVal) || val.YHBH != oldVal.YHBH) {
                        this.BYXZT = val.BYXZT;
                        this.SBYXZT = val.SBYXZT;
                        this.ZD = val.ZD;
                        this.YL = val.YL;
                        this.XBBH = val.XBBH;
                        this.PATH = val.PATH;
                        if (val.BYXZT == 11) { //故障-倒装状态  止度自动录入=起度
                            this.ZD = val.QD;
                        } else if (val.BYXZT == 4) { //换表-换表状态  止度和用量自动录入=0
                            this.ZD = 0;
                            this.YL = 0;
                        } else if (val.BYXZT == 10 || val.BYXZT == 12) { //无量-多录多抄和无表状态  止度自动录入=起度，用量=0
                            this.ZD = val.QD;
                            this.YL = 0;
                        }
                        this.SJBM = val.SJBM;
                        this.SLLRFS = val.SFGC == "0" ? 1 : 2;
                        this.getImgData();
                        this.resetInputActive();
                        var ret = db.executeSqlSync({
                            name: 'CBtest',
                            sql: 'UPDATE MRM_BOOKS_BEAN SET XCYH="' + val.YHBH + '" WHERE CBCH="' + this.cbch + '"'
                        });
                    }
                    if (val.CBBZ == '1') { //抄表标志为1时代表离线已保存本地，未重新抄表前不能进行修改
                        this.editDegrees = false;
                        this.editConsumption = false;
                        this.editSJBM = false;
                        this.editNewMeterNo = false;
                    }
                },
                deep: true,
                immediate: true
            },
            BYXZT: {
                handler: function(val, oldVal) {
                    if (val != oldVal && val != this.UserDetails.BYXZT) {
                        this.resetValue();
                    }
                    if (val == 11) { //故障-倒装状态  止度自动录入=起度
                        this.ZD = this.UserDetails.QD;
                    } else if (val == 4) { //换表-换表状态  止度自动录入=起度  用量自动录入=0
                        this.ZD = this.UserDetails.QD;
                        this.YL = 0;
                    } else if (val == 10 || val == 12 || val == 25 || val == 26) { //无量-多录多抄、无表、暂停拆表、停水拆表状态  止度自动录入=起度，用量=0
                        this.ZD = this.UserDetails.QD;
                        this.YL = 0;
                    }
                },
                deep: true
            }
        },
        methods: {
            back() { //返回上一个页面
                _this = this;
                var backWinName = "已下载抄表本";
                // if (this.FromPage == "cbqueryUser") {
                //     backWinName = "已下载抄表本";
                // }
                if (this.hasChanged && this.UserDetails.CBBZ != "1") {
                    vant.Dialog.confirm({
                            title: '提示',
                            message: '当前用户数据尚未保存，是否回到' + backWinName + '？',
                        })
                        .then(function() {
                            _this.clearImgData();
                            _this.closeWin();

                        })
                        .catch(function() {
                            return
                        });
                } else {
                  _this.closeWin();
                }
            },
            search(){
              api.openWin({
                  name: 'queryUser',
                  url: './queryUser.html',
                  pageParam: {
                      name: 'test'
                  }
              });
            },
            closeWin() { //关闭当前页面并刷新抄表列表页面
                var jsfun = 'show();';
                api.execScript({
                    name: "MeterReading_userList",
                    script: jsfun
                });
                if(api.pageParam.name!="MeterReading_userList"){
                  api.closeToWin({
                      name: 'MeterReading_userList'
                  });

                }else {
                  api.closeWin();
                }

            },
            clearImgData(){ //清除图片数据
              for (var i = 0; i < _this.ImgData.length; i++) {
                  var path = _this.ImgData[i].path;
                  fs.remove({
                      path: path
                  }, function(ret, err) {
                  });
              };
              _this.ImgData = [];
            },
            resetValue() { //切换状态 清空数据
                this.YL = "0";
                this.ZD = "0";
                this.SJBM = "";
                this.XBBH = "";
            },
            isEmptyObject(obj) { //判断是否为空对象
                for (var key in obj) {
                    return false
                };
                return true
            },
            clearObjectSpace(obj) { //清除空格
                Object.keys(obj).forEach(function(key) {　　 // 可进行逻辑判断，或者重新赋值
                    var item = obj[key];
                    if (typeof(item) == "string") {
                        obj[key] = item.replace(/\s/g, "");
                    }
                })
                return obj;
            },
            initData() { //初始化获取用户数据
                this.getUserData();
                this.getImgType();
                this.setXuChaoUser();
            },
            getUserData() { //获取用户数据
                var cbch = api.pageParam.userCode;
                var sql = ""; //查询语句
                var userState = api.pageParam.userState;
                _this = this;
                if (this.FromPage == "MeterReading_userList") { //抄表列表页面点击进入
                    switch (true) {
                        case userState == "ContinuedCopy": //续抄
                            sql = sql = `SELECT * FROM MRM_USER_BEAN WHERE CBCH=${cbch} ORDER BY CBXH`;
                            break;
                        case userState == "SequentialCopy": //顺序抄
                            sql = `select * from MRM_USER_BEAN where CBCH=${cbch} ORDER BY CBXH`;
                            break;
                        default://漏抄
                            sql = `SELECT * FROM MRM_USER_BEAN WHERE CBCH = ${cbch} AND CBBZ="0" ORDER BY CBXH`;
                            break;
                    }
                } else if (this.FromPage == "cbqueryUser") {
                    sql = 'SELECT * FROM MRM_USER_BEAN WHERE CBCH="' + cbch + '"  ORDER BY CBXH'
                }
                var ret = db.selectSqlSync({
                    name: 'CBtest',
                    sql: sql
                });
                this.UserList = ret.data;
                if (this.UserList.length == 0 || this.UserList == '') {
                    // api.alert({
                    //     title: '提示',
                    //     msg: '暂无抄表数据请前往下载',
                    // }, function(ret, err) {
                    //     if (ret) {
                    //
                    //     }
                    // });
                    vant.Dialog.alert({
                      title:"提示",
                      message:"暂无抄表数据请前往下载"
                    }).then(()=>{
                      api.closeWin({});
                    })
                }
                var UserNumber = this.UserList.findIndex(function(item) {
                    return item.YHBH == _this.YHBH;
                });
                if(UserNumber == -1){
                  this.UserNumber = 0;
                }else{
                  this.UserNumber = UserNumber;
                }
            },
            getImgType() { //获取图片类型数据
                _this = this;
                db.selectSql({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_ONLINE_BEAN where TYPEID="GDTPLX"'
                }, function(ret, err) {
                    if (ret.status) {
                        if (ret.data.length > 0) {
                            var list = ret.data;
                            _this.ImgType = list.map(function(item) {
                                return {
                                    ID: item.ID,
                                    NAME: item.NAME
                                }
                            })
                        }
                    }
                });
            },
            setXuChaoUser(){ //设置当前抄表册续抄用户

              var ret = db.executeSqlSync({
                  name: 'CBtest',
                  sql: 'UPDATE MRM_BOOKS_BEAN SET XCYH="' + this.YHBH + '" WHERE CBCH="' + this.cbch + '"'
              });
            },
            openDetails() { //用户信息区域向左滑动打开用户详情页
                api.openWin({
                    name: 'MeterReading_information2',
                    url: './MeterReading_information2.html',
                    pageParam: this.UserDetails
                });
            },
            turnToNextOrPrev(turnFun) {
                if (this.hasChanged  && this.UserDetails.CBBZ != "1") {
                    vant.Dialog.confirm({
                            title: '提示',
                            message: '当前用户数据尚未保存，是否跳转？',
                        })
                        .then(function() {
                            _this.clearImgData();
                            turnFun();
                        })
                        .catch(function() {
                            return
                        });
                } else {
                    turnFun();
                }
            },
            previousHousehold() { //上一户
                if (this.UserNumber == 0) {
                    api.toast({
                        msg: '没有上一户了',
                        duration: 2000,
                        location: 'bottom'
                    });
                    return;
                } else {
                    this.UserNumber--;
                }
            },
            nextHousehold() { //下一户
                if (this.UserNumber == (this.UserList.length - 1)) {
                    api.toast({
                        msg: '没有下一户了',
                        duration: 2000,
                        location: 'bottom'
                    });
                    return;
                } else {
                    this.UserNumber++;
                }
            },
            viewLastMonthPhoto() { //查看上月照片
                if (api.connectionType != 'none') {
                  api.showProgress({
                      title: '加载中',
                      modal: false
                  });

                  var Parameter = {
                      "ClientId": api.deviceId,
                      "ClientName": api.deviceModel,
                      "OperatorId": $api.getStorage('cbOperatorId'),
                      "OperatorName": $api.getStorage('cbOperatorName'),
                      "Required": "YHBH=" + this.UserDetails.YHBH,
                      "Type": "155"
                  };
                  var body = {
                          body: JSON.stringify({
                              "UserName": $api.getStorage('cbOperatorName'),
                              "Password": $api.getStorage('cbPassword'),
                              "SerialNo": dataTime(),
                              "Method": "R999",
                              "Parameter": JSON.stringify(Parameter)
                          })
                      };
                  fnPostNoProcess('', body, 'application/json', false, function(ret, err) {
                      api.hideProgress();
                      if (ret) {
                          if (ret.Status != 0) {
                              api.toast({
                                  msg: '获取上月图片失败',
                                  duration: 2000,
                                  location: 'top'
                              });
                          } else {
                             var imgData;
                             if (ret.Data == "") {
                                 imgData = [];
                             } else {
                                 imgData = JSON.parse(ret.Data);
                             };
                             if (imgData.length > 0) {
                                 var images = imgData.map((item) => {
                                    //  return $api.getStorage('cbapipath') + item.URL;  //开发环境是抄表接口地址
                                    return apiUrl + item.URL;  //生产环境是云平台接口地址
                                 });
                                 api.openWin({
                                     name: 'photoBrowser_fram_New',
                                     url: './photoBrowser_fram_New.html',
                                     pageParam: {
                                         images: images,
                                         startPosition: 0
                                     },
                                     animation: {
                                         type: "fade",
                                         subType: "from_right",
                                         duration: 300
                                     }
                                 });
                             } else {
                                 api.toast({
                                     msg: '暂无图片',
                                     duration: 2000,
                                     location: 'top'
                                 });
                             }
                          }
                      } else {
                          api.toast({
                              msg: '网络连接超时',
                              duration: 2000,
                              location: 'top'
                          });

                      }
                  });
                } else {
                    vant.Toast("未连接网络,无法查看上月图片");
                }
            },
            photograph() { // 抄表拍照图片
                _this = this;
                gpsmodel.gpsstate(function(ret) {
                    if (ret.gps == true) {
                        var state = 0; //标志是表位图片还是抄表图片
                        if ((_this.ImgData.length > 0 && !_this.hasMeterLocationImg) || (_this.ImgData.length > 1 && _this.hasMeterLocationImg)) {
                            var typeNames = _this.ImgType.map(function(item) {
                                return item.NAME;
                            })
                            api.actionSheet({
                                buttons: typeNames
                            }, function(ret, err) {
                                var index = ret.buttonIndex;
                                if (index <= _this.ImgType.length) {
                                    var id = _this.ImgType[index - 1].ID;
                                    var name = _this.ImgType[index - 1].NAME;
                                    _this.getCamera(id, name, state);
                                }
                            });
                        } else {
                            var itemIndex = _this.ImgType.findIndex(function(item) {
                                return item.NAME == "表盘";
                            });
                            if (itemIndex != -1) {
                                var id = _this.ImgType[itemIndex].ID;
                                var name = _this.ImgType[itemIndex].NAME;
                                _this.getCamera(id, name, state);
                            } else {
                                _this.getCamera("", "", state);
                            }
                        }
                    } else {
                        vant.Dialog.alert({
                          title:"提示",
                          message:"无法进行拍照操作,请先打开gps"
                        }).then(()=>{

                        })
                    }
                });
            },
            getCamera(id, name, state) { //拍照以及添加水印和经纬度
                var _this = this;
                var _this = this;
                var text, NotLoction;
                var text2
                var text
                var options
                if (state == 0) {
                    NotLoction = 0;
                    options = {
                        type: 'camera',
                        waterMark: true,
                        waterMarkData: {
                            code: _this.UserDetails.YHBH,
                            text2:name
                        }
                    }
                } else {
                    NotLoction = 1;
                    options = {
                        type: 'camera',
                        waterMark: true,
                        waterMarkData: {
                            code: _this.UserDetails.YHBH
                        }
                    }
                }
                pGetPicture(options, function(ret, err) {//调用公共方法拍照
                    if (ret.status) {
                        var imgPicture = ret.imgList[0];
                        fs.copyTo({
                            oldPath: imgPicture,
                            newPath: 'fs://MeterTablePicture'
                        }, function(ret, err) {
                            if (ret.status) {

                                fs.remove({
                                    path: imgPicture
                                }, function(ret, err) {

                                });

                                var picName = imgPicture.substring(imgPicture.lastIndexOf("/") + 1);
                                var url = api.fsDir + "/MeterTablePicture/" + picName;

                                var cbch = _this.UserDetails.CBCH;
                                var yhbh = _this.UserDetails.YHBH;
                                var zplj = url;
                                var zpmc = zplj.substr(zplj.lastIndexOf('/') + 1, zplj.lastIndexOf('.') + 3);

                                var lon = ""; //经度
                                var lat = ""; //维度
                                bMap.getLocation({
                                    accuracy: '100m',
                                    autoStop: true,
                                    filter: 1
                                }, function(ret, err) {
                                    if (ret.status) {
                                        lon = ret.lon;
                                        lat = ret.lat;
                                    } else {

                                    }
                                    var img = {
                                        path: zplj,
                                        isAppend: false,
                                        data: {
                                            cbch: cbch,
                                            yhbh: yhbh,
                                            zpmc: zpmc,
                                            zplj: zplj,
                                            id: id,
                                            name: name,
                                            lon: lon,
                                            lat: lat,
                                            time: dataTime(),
                                            NotLoction: NotLoction
                                        }
                                    };
                                    if (state == 0) {
                                        if (_this.UserDetails.CBBZ == "1") {
                                            img.isAppend = true;
                                        }
                                        _this.ImgData.push(img);
                                        setTimeout(function() {
                                            var ele = document.getElementById('flex-vertical');
                                            ele.scrollTop = ele.clientHeight;
                                        }, 50);
                                    } else {
                                        _this.PATH = zplj;
                                        _this.ImgData.push(img);
                                    }
                                });
                            }
                        });
                    }
                });
            },
            insertPhotoIntoDB() { //保存时将图片添加到本地数据库中
                for (var i = 0; i < this.ImgData.length; i++) {
                    var item = this.ImgData[i];
                    var photoData = item.data;
                    var existData = db.selectSqlSync({
                        name: "CBtest",
                        sql: "SELECT * FROM MRM_PHOTOS_BEAN WHERE ZPLJ = '" + photoData.zplj + "' AND YHBH = '" + photoData.yhbh + "'"
                    });
                    if (!existData.status || existData.data.length == 0) {
                        var photodata = db.executeSqlSync({
                            name: 'CBtest',
                            sql: 'INSERT INTO MRM_PHOTOS_BEAN(ID,CBCH,YHBH,ZPMC,ZPLJ,ZPLX,ZPLXMC,SFSC,JD,WD,CBRQ,' +
                                'NotLoction) VALUES ("' + $api.getStorage('cbOperatorId') + '",' +
                                '"' + photoData.cbch + '",' +
                                '"' + photoData.yhbh + '",' +
                                '"' + photoData.zpmc + '",' +
                                '"' + photoData.zplj + '",' +
                                '"' + photoData.id + '",' +
                                '"' + photoData.name + '",' +
                                '"0",' +
                                '"' + photoData.lon + '",' +
                                '"' + photoData.lat + '",' +
                                '"' + photoData.time + '",' +
                                '"' + photoData.NotLoction + '")'
                        });
                    }
                }
            },
            getImgData() { //获取本地数据库已保存的图片
                this.ImgData = [];
                _this = this;
                db.selectSql({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_PHOTOS_BEAN WHERE YHBH ="' + this.UserDetails.YHBH + '" AND NotLoction="0"'
                }, function(ret, err) {
                    if (ret.status) {
                        if (ret.data.length > 0) {
                            for (var i = 0; i < ret.data.length; i++) {
                                var item = ret.data[i];
                                var img = {
                                    path: item.ZPLJ,
                                    isAppend:false,
                                    data: {
                                        cbch: item.CBCH,
                                        yhbh: item.YHBH,
                                        zpmc: item.ZPMC,
                                        zplj: item.ZPLJ,
                                        id: item.ZPLX,
                                        name: item.ZPLXMC,
                                        lon: item.JD,
                                        lat: item.WD,
                                        time: item.CBRQ,
                                        NotLoction: item.NotLoction
                                    }
                                }
                                _this.ImgData.push(img);
                            }
                        }
                    }
                });
            },
            imgPreView(path, index) { //图片预览
                var images = this.ImgData.map(function(item) {
                    return item.path;
                });
                api.openWin({
                    name: 'photoBrowser_fram_New',
                    url: './photoBrowser_fram_New.html',
                    pageParam: {
                        images: images,
                        startPosition: index
                    },
                    animation: {
                        type: "fade",
                        subType: "from_right",
                        duration: 300
                    }
                });
            },
            deleteImg(index) { // 图片删除
                var path = this.ImgData[index].path;
                _this = this;
                gpsmodel.gpsstate(function(ret) {
                    if (ret.gps == true) {
                        if (_this.UserDetails.CBBZ != '1' || _this.ImgData[index].isAppend) {
                            api.confirm({
                                title: '提示',
                                msg: '确认删除照片',
                                buttons: ['确定', '取消']
                            }, function(ret, err) {
                                var buttonIndex = ret.buttonIndex;
                                if (buttonIndex == 1) {
                                    fs.remove({
                                        path: path
                                    }, function(ret, err) {
                                        if (ret.status) {
                                            var photos = db.executeSqlSync({
                                                name: 'CBtest',
                                                sql: 'delete from MRM_PHOTOS_BEAN where ZPLJ="' + path + '" AND NotLoction="0"'
                                            });
                                            _this.ImgData.splice(index, 1);
                                        }
                                    });

                                }
                            });
                        }
                    } else {
                      vant.Dialog.alert({
                        title:"提示",
                        message:"无法进行抄表操作,请先打开gps"
                      }).then(()=>{

                      })
                    }
                });

            },
            waterLocationImg() { //表位图片
                var _this = this;
                if ((_this.PATH == ' ' || _this.PATH == '' || _this.PATH == 'null' || _this.PATH == null || _this.PATH.length == 0) && this.UserDetails.CBBZ != "1") {
                  gpsmodel.gpsstate(function(ret) {
                      if (ret.gps == true) {
                        vant.Dialog.confirm({
                            title: '提示',
                            message: '是否上传表位照片'
                        }).then(() => {
                            _this.getCamera(" ", " ", 1);
                        }).catch(() => {

                        });
                      }else{
                        vant.Dialog.alert({
                          title:"提示",
                          message:"无法进行抄表操作,请先打开gps"
                        }).then(()=>{

                        })
                      }
                  });
                } else {
                   if(this.PATH == ' ' || this.PATH == ""){
                     api.toast({
                         msg: '暂无表位图片',
                         duration: 2000,
                         location: 'top'
                     });
                   }else{
                     api.openWin({
                         name: 'photoBrowser_fram',
                         url: './photoBrowser_fram.html',
                         pageParam: {
                             src: _this.PATH,
                             statu: _this.UserDetails.YHBH
                         }
                     });
                   }
                }
            },
            selectMeterStates() { //选择水表状态
                _this = this;
                gpsmodel.gpsstate(function(ret) {
                    if (ret.gps == true) {
                        if (_this.UserDetails.CBBZ != '1') {
                          api.openFrame({
                              name: 'statselectr_fram',
                              url: './statselectr_fram.html',
                              rect: {
                                  x: 0,
                                  y: 0,
                                  w: 'auto',
                                  h: 'auto'
                              },
                              pageParam: {
                                  name: 'test'
                              },
                              bounces: false,
                              bgColor: 'rgba(243,243,243.1)',
                              vScrollBarEnabled: true,
                              hScrollBarEnabled: true,
                          });
                        }
                    } else {
                      vant.Dialog.alert({
                        title:"提示",
                        message:"无法进行抄表操作,请先打开gps"
                      }).then(()=>{

                      })
                    }
                });
            },
            changeDegrees(noToast) { //点击读数，切换键盘输入为录入读数
                // 自抄和正常
                if (this.UserDetails.CBBZ != "1") {
                    if (this.NeedDegrees) {
                        this.editDegrees = true;
                        this.editConsumption = false;
                        this.editSJBM = false;
                        this.editNewMeterNo = false;
                    } else {
                        if (!noToast) {
                            vant.Toast("该状态下无法录入读数");
                        }
                        this.editDegrees = false;
                    }
                }
            },
            changeConsumption(noToast) { //点击用量，切换键盘输入为录入用量
                //故障：表糊、表停、倒装、表坏、其他、
                //特殊表位：堆埋、车压、水淹、闭门围挡、其他
                if (this.UserDetails.CBBZ != "1") {
                    if (this.NeedConsumption) {
                        this.editConsumption = true;
                        this.editDegrees = false;
                        this.editSJBM = false;
                        this.editNewMeterNo = false;
                    } else {
                        if (!noToast) {
                            vant.Toast("该状态下无法录入用量");
                        }
                        this.editConsumption = false;
                    }
                }
            },
            changeSJBM(noToast) { //点击实际表码，切换键盘输入为录入实际表码
                //故障：倒装
                //换表
                //无量：多录多抄、其他
                if (this.UserDetails.CBBZ != "1") {
                    if (this.NeedSJBM) {
                        this.editSJBM = true;
                        this.editConsumption = false;
                        this.editDegrees = false;
                        this.editNewMeterNo = false;
                    } else {
                        if (!noToast) {
                            vant.Toast("该状态下无法录入实际表码");
                        }
                        this.editSJBM = false;
                    }
                }
            },
            changeNewMeterNo(noToast) { //点击新表表号，切换键盘输入为新表表号
                //换表-换表
                if (this.UserDetails.CBBZ != "1") {
                    if (this.NeedXBBH) {
                        this.editNewMeterNo = true;
                        this.editSJBM = false;
                        this.editConsumption = false;
                        this.editDegrees = false;
                    } else {
                        if (!noToast) {
                            vant.Toast("该状态下无法录入新表表号");
                        }
                        this.editNewMeterNo = false;
                    }
                }
            },
            ScanCode() { //扫码识别水表表号
                if (this.UserDetails.CBBZ != "1") {
                    FNScanner.open({
                        rect: {
                            x: 0,
                            y: 0,
                            w: api.winWidth,
                            h: api.winHeight,
                        },
                        autorotation: true,
                        hintText: "扫码获取水表表号",
                        font: {
                            lightText: {
                                size: 13,
                            }
                        }
                    }, (ret, err) => {
                        if (ret.eventType == 'success') {
                            var content = ret.content;
                            this.XBBH = content;
                            this.editNewMeterNo = true;
                            this.editSJBM = false;
                            this.editConsumption = false;
                            this.editDegrees = false;
                        }
                    });
                }
            },
            resetInputActive() { //重置读数、实际表码、用量的输入框状态
                this.editDegrees = false;
                this.editConsumption = false;
                this.editSJBM = false;
                this.editNewMeterNo = false;
                if (this.NeedDegrees) {
                    this.editDegrees = true;
                } else if (this.NeedConsumption) {
                    this.editConsumption = true;
                } else if (this.NeedSJBM) {
                    this.editSJBM = true;
                } else if (this.NeedXBBH) {
                    this.editNewMeterNo = true;
                }
            },
            openLight() { //打开/关闭手电筒
                this.showLight = !this.showLight;
                if (this.showLight) {
                    DVTorch.open({});
                } else {
                    DVTorch.close({});
                }
            },
            applyWorkOrder() { // 发起工单
              _this = this;
              gpsmodel.gpsstate(function(ret) {
                  if (ret.gps == true) {
                    var workorderdata = db.selectSqlSync({
                        name: 'CBtest',
                        sql: 'select * from MRM_WORKORDER_BEAN where YHBH="' + _this.UserDetails.YHBH + '"'
                    });
                    if (workorderdata.data) {
                        if (workorderdata.data.length > 0) {
                            api.openWin({
                                name: 'workOrder',
                                url: '../workOrder/workOrder.html',
                                pageParam: {
                                    YHBH: _this.UserDetails.YHBH,
                                    WinName: 'MeterReading_userList'
                                }
                            });
                        } else {
                            api.openWin({
                                name: 'workOrder',
                                url: '../workOrder/workOrder.html',
                                pageParam: {
                                    YHBH: _this.UserDetails.YHBH,
                                    WinName: 'MeterReading_userList'
                                }
                            });
                        }
                    }
                  } else {
                    vant.Dialog.alert({
                      title:"提示",
                      message:"无法发起工单,请先打开gps"
                    }).then(()=>{

                    })
                  }
              });
            },
            contactsPhone() { //点击键盘上的更多
                // 电话拨打和短信
                var telponeNumer = this.UserDetails.YDDH;
                var userCode = this.UserDetails.YHBH;
                var userCh = this.UserDetails.CBCH;
                _this = this;
                api.actionSheet({
                    style: {
                        fontNormalColor: '#FF5A5A5A',
                        fontPressColor: '#FF2F81F6'
                    },
                    buttons: ['联系用户', '更新表位', '修改已抄', '备忘录', '导航','查看上月图片']
                }, function(ret, err) {
                    if (ret) {
                        var index = ret.buttonIndex;
                        if (index == 1) {
                            api.actionSheet({
                                style: {
                                    fontNormalColor: '#FF5A5A5A',
                                    fontPressColor: '#FF2F81F6'
                                },
                                buttons: ['电话', '短信']
                            }, function(ret, err) {
                                var index = ret.buttonIndex;
                                if (index == 1) {
                                    if (telponeNumer == "") {
                                        api.toast({
                                            msg: '该用户没有录入联系方式',
                                            duration: 2000,
                                            location: 'top'
                                        });
                                        return;
                                    }
                                    api.call({
                                        type: 'tel_prompt',
                                        number: telponeNumer
                                    });

                                }
                                if (index == 2) {
                                    db.selectSql({
                                        name: 'CBtest',
                                        sql: 'SELECT * FROM MRM_SHORT_MEESSAGE_BEAN'
                                    }, function(ret, err) {
                                        if (ret.status) {
                                            var dataList = ret.data
                                            if (dataList.length > 0) {
                                                var Message = []
                                                var MessageId = []
                                                for (var i = 0; i < dataList.length; i++) {
                                                    MessageId.push(dataList[i]);
                                                    Message.push(dataList[i].MBMC);
                                                }
                                                api.actionSheet({
                                                    buttons: Message
                                                }, function(ret, err) {
                                                    var index = ret.buttonIndex;
                                                    if (index <= Message.length) {
                                                        var id = MessageId[index - 1];
                                                        var name = Message[index - 1];
                                                        api.openWin({
                                                            name: 'Messageing_fram',
                                                            url: './Messageing_fram_New.html',
                                                            pageParam: {
                                                                StatseValue: id,
                                                                telpone: telponeNumer,
                                                                userCode: _this.UserDetails.YHBH
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    });

                                }
                            });
                        }
                        if (index == 2) {
                            // 定位
                            gpsmodel.gpsstate(function(ret) {
                                if (ret.gps == true) {
                                  _this.upLoction()
                                } else {
                                    vant.Dialog.alert({
                                        title: "提示",
                                        message: "无法更新表位,请先打开gps"
                                    }).then(() => {

                                    })
                                }
                            });
                        }
                        if (index == 3) {
                            // 重新抄表
                            gpsmodel.gpsstate(function(ret) {
                                if (ret.gps == true) {
                                    vant.Dialog.confirm({
                                            title: '修改提示',
                                            message: '确认修改将清空抄表录入与图片',
                                        })
                                        .then(function() {
                                            _this.reReadMeter();
                                        })
                                        .catch(function() {
                                            return
                                        });
                                } else {
                                  vant.Dialog.alert({
                                    title:"提示",
                                    message:"无法修改已抄,请先打开gps"
                                  }).then(()=>{

                                  })
                                }
                            });
                        }
                        if (index == 4) {
                            api.openWin({
                                name: 'MeterReading_Note',
                                url: './MeterReading_Note.html',
                                pageParam: _this.UserDetails
                            });
                        }
                        if (index == 5) {
                          gpsmodel.gpsstate(function(ret) {
                              if (ret.gps == true) {
                                api.openWin({
                                    name: 'baiduMap',
                                    url: '../baiduMap/baiduMap.html',
                                    pageParam: {
                                        YHBH: _this.UserDetails.YHBH
                                    }
                                });
                              } else {
                                  vant.Dialog.alert({
                                      title: "提示",
                                      message: "无法导航,请先打开gps"
                                  }).then(() => {

                                  })
                              }
                          });
                        }
                        if (index == 6) {
                            _this.viewLastMonthPhoto();
                        }
                    }
                });
            },
            reReadMeter() { //重新抄表，清空数据
                //  清除数据
                var yhbh = this.UserDetails.YHBH;
                var DELETEimg = db.executeSqlSync({
                    name: 'CBtest',
                    sql: 'DELETE FROM MRM_PHOTOS_BEAN WHERE YHBH ="' + yhbh + '" AND NotLoction="0"'
                });
                var ret = db.executeSqlSync({
                    name: 'CBtest',
                    sql: 'UPDATE MRM_USER_BEAN SET CBRQ="", ZD="0", YL="0", CBBZ="0",BYXZT="1", CWXX="",ZTSCCG="0", CBYSZJD=" ",CBYSZWD=" ",FY=" ",FYHJ=" ",SJBM="",XBBH = "",SBYXZT="正常" WHERE YHBH="' + yhbh + '"'
                });
                var retUser = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_USER_BEAN WHERE CBCH=\'' + this.UserDetails.CBCH + '\' AND CBBZ="1"'
                });
                var retUsers = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_USER_BEAN WHERE CBCH=\'' + this.UserDetails.CBCH + '\''
                });
                var YSCUsers = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_USER_BEAN WHERE CBCH=\'' + this.UserDetails.CBCH + '\' AND ZTSCCG="1"'
                });

                var wcusers = retUsers.data.length - retUser.data.length
                var retBooks = db.executeSqlSync({
                    name: 'CBtest',
                    sql: 'UPDATE MRM_BOOKS_BEAN SET YC=\'' + retUser.data.length + '\' , WC=\'' + wcusers + '\' , YSC=\'' + YSCUsers.data.length + '\' WHERE CBCH=\'' + this.UserDetails.CBCH + '\''
                });
                api.sendEvent({
                    name: 'gxMeterRing',
                    extra: {
                        yc: retUser.data.length,
                        wc: wcusers,
                        cbch: this.UserDetails.CBCH
                    }
                });
                this.UserDetails.ZD = "0";
                this.UserDetails.YL = "0";
                this.UserDetails.BYXZT = "1";
                this.UserDetails.SBYXZT = "正常";
                this.UserDetails.SJBM = "";
                this.UserDetails.XBBH = "";
                this.UserDetails.CBBZ = '0';
                this.BYXZT = "1";
                this.SBYXZT = "正常";
                this.resetValue();
                this.ImgData = [];
                this.resetInputActive();
            },
            upLoction() { //更新表位
                //获取当前用户信息
                _this = this;
                bMap.getLocation({
                    accuracy: '100m',
                    autoStop: true,
                    filter: 1
                }, function(ret, err) {
                    if (ret.status) {
                        var lon = ret.lon;
                        var lat = ret.lat;
                        // 更新经纬度
                        var jwd = lon + ',' + lat
                        var retdb = db.executeSqlSync({
                            name: 'CBtest',
                            sql: 'UPDATE MRM_USER_BEAN SET JWD="' + jwd + '" WHERE YHBH="' + _this.UserDetails.YHBH + '"'
                        });
                        api.showProgress({
                            title: '上传中',
                            modal: false
                        });

                        _this.upLoctionAjax(lon,lat, function(ret, err) {
                           api.hideProgress();
                            if (ret) {
                                if (ret.Status == 0) {
                                    api.toast({
                                        msg: '表位上传成功',
                                        duration: 2000,
                                        location: 'top'
                                    });
                                    _this.UserDetails.DWSFSC = "1";
                                    var retdb = db.executeSqlSync({
                                        name: 'CBtest',
                                        sql: 'UPDATE MRM_USER_BEAN SET DWSFSC="1" WHERE YHBH="' + _this.UserDetails.YHBH + '"'
                                    });
                                } else {
                                    vant.Toast(ret.Message)
                                }
                            } else {
                                // 上传超时存储到本地
                                db.selectSql({
                                    name: 'CBtest',
                                    sql: 'SELECT * FROM MRM_METER_LOCATION_BEAN WHERE YHBH= "' + _this.UserDetails.YHBH + '"'
                                }, function(ret, err) {
                                    if (ret.status) {
                                        db.executeSql({
                                            name: 'CBtest',
                                            sql: 'UPDATE MRM_METER_LOCATION_BEAN SET ID=\'' + $api.getStorage("cbOperatorId") + '\',CBCH=\'' + userCh + '\',YHBH=\'' + _this.UserDetails.YHBH + '\',JD=\'' +
                                                lon + '\',WD=\'' +
                                                lat + '\',CBSJ=\'' + dataTime() + '\' WHERE YHBH= "' + _this.UserDetails.YHBH + '"'
                                        }, function(ret, err) {
                                            if (ret.status) {
                                              vant.Toast("网络错误，已存储本地")
                                            }
                                        });
                                    } else {
                                        db.executeSql({
                                            name: 'CBtest',
                                            sql: 'INSERT INTO MRM_METER_LOCATION_BEAN(ID,CBCH,YHBH,JD,WD,SFGX,CBSJ) VALUES ("' + $api.getStorage("cbOperatorId") + '","' + userCh + '",' +
                                                '"' + _this.UserDetails.YHBH + '",' +
                                                '"' + lon + '",' +
                                                '"' + lat + '",' +
                                                '"' + dataTime() + '")'
                                        }, function(ret, err) {
                                            if (ret.status) {
                                                vant.Toast("网络错误，已存储本地")
                                            }
                                        });

                                    }
                                });
                                // 存储到本地完成
                            }
                        })
                    } else {
                        api.toast({
                            msg: '获取定位失败，请重试',
                            duration: 2000,
                            location: 'top'
                        });
                    }
                });
            },
            upLoctionAjax(lon,lat,callback){ //上传表位信息调用接口
              //获取当前用户信息
              var telponeNumer = this.UserDetails.YHDH;
              var userCode = this.UserDetails.YHBH;
              var userCh = this.UserDetails.CBCH;
              _this = this;
              var Records = [{
                  "JD": lon,
                  "WD": lat,
                  "YHBH": userCode
              }];
              var Parameter = {
                  "ClientId": api.deviceId,
                  "ClientName": api.deviceModel,
                  "OperatorId": $api.getStorage("cbOperatorId"),
                  "OperatorName": $api.getStorage("cbOperatorName"),
                  "Required": "",
                  "Type": '221',
                  "Records": Records
              }
              var body = {
                  body: JSON.stringify({
                      "UserName": $api.getStorage("cbOperatorName"),
                      "Password": $api.getStorage("cbPassword"),
                      "SerialNo": dataTime(),
                      "Method": "R999",
                      "Parameter": JSON.stringify(Parameter)
                  })
              }
              fnPostNoProcess('', body, 'application/json', false, function(ret, err) {
                  callback(ret, err);
              });
            },
            getKeyboardNumbers(newValue) {//数字输入修改
                //读数
                if (this.editDegrees) {
                    if (this.ZD == 0) {
                        this.ZD = "";
                    }
                    if (this.ZD.length - 1 >= 7) {
                        api.toast({
                            msg: '输入超过限制',
                            duration: 2000,
                            location: 'bottom'
                        });
                        return
                    }
                    this.ZD += newValue;
                    if (this.BYXZT == 1 || this.BYXZT == "" || this.BYXZT == 10040) {
                        this.YL = parseInt(this.ZD) - parseInt(this.UserDetails.QD);
                        // this.SJBM = this.ZD;
                    }
                }
                //用量
                if (this.editConsumption) {
                    if (this.YL == 0) {
                        this.YL = "";
                    }
                    if (this.YL.length - 1 >= 7) {
                        api.toast({
                            msg: '输入超过限制',
                            duration: 2000,
                            location: 'bottom'
                        });
                        return
                    }
                    this.YL += newValue;
                    if (this.BYXZT != 11) {
                        this.ZD = parseInt(this.YL) + parseInt(this.UserDetails.QD);
                    }
                }
                //  实际表码
                if (this.editSJBM) {
                    if (this.SJBM == 0) {
                        this.SJBM = "";
                    }
                    if (this.SJBM.length - 1 >= 7) {
                        api.toast({
                            msg: '输入超过限制',
                            duration: 2000,
                            location: 'bottom'
                        });
                        return
                    } else {
                        this.SJBM += newValue;
                    }
                }
                // 新表表号
                if (this.editNewMeterNo) {
                    this.XBBH += newValue;
                }
            },
            longTapDelete() { //长按一直删除
                this.deleteNumber();
                this.timer = setInterval(() => {
                    this.deleteNumber();
                }, 100);
            },
            stopDelete() { //停止长按删除
                clearInterval(this.timer);
            },
            deleteNumber() { //删除
              _this = this;
              if(this.UserDetails.CBBZ != "1"){
                if (this.editDegrees) { //读数
                    this.ZD = this.ZD.slice(0, this.ZD.length - 1);
                    if (this.ZD.length == 0) {
                        this.YL = "";
                        this.SJBM = this.ZD;
                    } else {
                        if (this.BYXZT == 1 || this.BYXZT == "" || this.BYXZT == 10040) { //正常和自抄
                            this.YL = parseInt(this.ZD) - parseInt(this.UserDetails.QD);
                            this.SJBM = this.ZD;
                        }
                    }
                }

                if (this.editConsumption) { //用量
                    this.YL = this.YL.slice(0, this.YL.length - 1);
                    if (this.YL.length == 0) {
                        this.YL = "";
                        if (this.BYXZT == 3 || this.BYXZT == 5 || this.BYXZT == 20 || this.BYXZT == 21 || this.BYXZT == 6 || this.BYXZT == 7 || this.BYXZT == 22 || this.BYXZT == 23 || this.BYXZT == 24) {
                            this.ZD = "";
                        }
                    } else {
                        if (this.BYXZT == 3 || this.BYXZT == 5 || this.BYXZT == 20 || this.BYXZT == 21 || this.BYXZT == 6 || this.BYXZT == 7 || this.BYXZT == 22 || this.BYXZT == 23 || this.BYXZT == 24) {
                            this.ZD = parseInt(this.YL) + parseInt(this.UserDetails.QD);
                        }
                    }

                }
                if (this.editSJBM) { //实际表码
                    this.SJBM = this.SJBM.slice(0, this.SJBM.length - 1);
                    if (this.SJBM.length == 0) {
                        this.SJBM = ""
                    }
                }
                if(this.editNewMeterNo){ //新表表号
                  this.XBBH = this.XBBH.slice(0, this.XBBH.length - 1);
                  if (this.XBBH.length == 0) {
                      this.XBBH = ""
                  }
                }
              }else{

              }
            },
            setDefaultNumbers() { //设置默认数据
                if (this.BYXZT == 10 || this.BYXZT == 12 || this.BYXZT == 25 || this.BYXZT == 26 || this.BYXZT == 17) {
                    this.YL = 0;
                }
                if (this.BYXZT == 4) {
                    this.ZD = 0;
                    this.YL = 0;
                }
                // 无表和多录多抄
                if (this.BYXZT == 10 || this.BYXZT == 12 || this.BYXZT == 25 || this.BYXZT == 26 || this.BYXZT == 11) {
                    this.ZD = this.UserDetails.QD;
                }
            },
            allSave() { //保存数据并上传
                if (!this.preventRepeatTouch && this.UserDetails.CBBZ != "1") {
                    this.preventRepeatTouch = true;
                    if (this.NeedPhotograph && ((this.ImgData.length == 0 && !this.hasMeterLocationImg) || (this.ImgData.length == 1 && this.hasMeterLocationImg))) {
                        vant.Toast("当前抄表用户必须拍照");
                        this.preventRepeatTouch = false;
                        return;
                    }

                    if (!this.AbnormalStatus.status && ((this.ImgData.length == 0 && !this.hasMeterLocationImg) || (this.ImgData.length == 1 && this.hasMeterLocationImg))) {
                        vant.Toast("当前用户水量" + this.AbnormalStatus.text + ",请拍摄抄表水量照片");
                        this.preventRepeatTouch = false;
                        return;
                    }

                    _this = this;
                    objdata = {};
                    onlinestatus = ''
                    yhbh = this.UserDetails.YHBH;
                    cbch = this.cbch;
                    var yl = parseInt(this.YL);
                    var qd = this.UserDetails.QD;
                    var zd = this.ZD;
                    var qidu = Number(qd);
                    var zhidu = parseInt(zd);

                    if (this.NeedDegrees && isNaN(parseInt(this.ZD))) {
                        api.toast({
                            msg: '请填写读数',
                            duration: 2000,
                            location: 'top'
                        });
                        this.preventRepeatTouch = false;
                        return;
                    } else if (this.NeedDegrees && zhidu < qidu) {
                        api.toast({
                            msg: '水表读数少于起度',
                            duration: 2000,
                            location: 'top'
                        });
                        this.preventRepeatTouch = false;
                        return;
                    }
                    if (this.NeedConsumption && isNaN(parseInt(this.YL))) {
                        api.toast({
                            msg: '请填写用量',
                            duration: 2000,
                            location: 'top'
                        });
                        this.preventRepeatTouch = false;
                        return;
                    }
                    if (this.NeedSJBM && isNaN(parseInt(this.SJBM))) {
                        api.toast({
                            msg: '请填写实际表码',
                            duration: 2000,
                            location: 'top'
                        });
                        this.preventRepeatTouch = false;
                        return;
                    }
                    if (this.NeedXBBH && isNaN(parseInt(this.XBBH))) {
                        api.toast({
                            msg: '请填写新表表号',
                            duration: 2000,
                            location: 'top'
                        });
                        this.preventRepeatTouch = false;
                        return;
                    }

                    gpsmodel.gpsstate(function(ret) {
                        if (ret.gps == true) {
                            if (!_this.AbnormalStatus.status) {
                                vant.Dialog.confirm({
                                        title: '提示',
                                        message: '当前用户水量' + _this.AbnormalStatus.text + ',确认保存？',
                                    })
                                    .then(function() {
                                      api.showProgress({
                                          title: '保存中',
                                          modal: false
                                      });
                                      _this.saveAndUploadLocation();
                                    })
                                    .catch(function() {
                                        _this.preventRepeatTouch = false;
                                        return;
                                    });
                            } else {
                                api.showProgress({
                                    title: '保存中',
                                    modal: false
                                });
                                _this.saveAndUploadLocation();
                            }
                        } else {
                            vant.Toast("无法进行抄表操作,请先打开gps");
                            _this.preventRepeatTouch = false;
                        }
                    });
                } else if (!this.preventRepeatTouch && this.isAppendImg) {
                    this.preventRepeatTouch = true;
                    this.appendImg();
                } else if(this.preventRepeatTouch && !(this.UserDetails.CBBZ == '1' && !this.isAppendImg)){
                    api.toast({
                        msg: '正在保存，请勿重复点击',
                        duration: 2000,
                        location: 'top'
                    });
                }
            },
            saveAndUploadLocation() { //上传保存表位信息
                _this = this;
                var retUser = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_USER_BEAN WHERE YHBH=\'' + this.UserDetails.YHBH + '\''
                });
                var jwd = retUser.data[0].JWD;
                var JWDData = jwd.split(",");
                bMap.getLocation({
                    accuracy: '100m',
                    autoStop: true,
                    filter: 1
                }, function(ret, err) {
                    if (ret.status) {
                        var lon = ret.lon;
                        var lat = ret.lat;
                        if (_this.UserDetails.DWSFSC != "1") {
                            _this.saveAndUploadLocationPublic(JWDData,lon, lat);
                        } else { //表位信息已上传时保存不再更新表位信息
                            _this.saveData(lon, lat);
                        }
                    } else {
                        vant.Toast("获取定位失败，请重试");
                        _this.preventRepeatTouch = false;
                        return;
                    }
                });
            },
            saveAndUploadLocationPublic(JWDData, lon, lat) { //上传和保存表位信息公共方法
                _this = this;
                var meterLon = lon;
                var meterLat = lat;
                if (JWDData.length > 1) {  //本地有表位信息时取本地数据
                    meterLon = JWDData[0];
                    meterLat = JWDData[1];
                }
                this.upLoctionAjax(meterLon, meterLat, function(ret, err) {
                    var resData;
                    if(ret.Data == "" || ret.Data == " " || ret.Data == undefined || ret.Data == "undefined"){
                      resData = [];
                    }else{
                      resData = JSON.parse(ret.Data);
                    }
                    if (ret && ret.Status == 0 && ((resData.length >0 && resData.IS_SCCG == "1") || resData.length == 0)) {
                        _this.UserDetails.DWSFSC = "1";
                        var retdb = db.executeSqlSync({
                            name: 'CBtest',
                            sql: 'UPDATE MRM_USER_BEAN SET DWSFSC="1" WHERE YHBH="' + _this.UserDetails.YHBH + '"'
                        });
                    }
                });
                this.saveData(lon, lat);
            },
            saveData(lon, lat) { //保存用户数据到本地
                var yl = Number(this.YL);
                var qd = this.UserDetails.QD;
                var zd = Number(this.ZD);
                var sjbm = Number(this.SJBM);
                var xbbh = this.XBBH;
                var path = this.PATH;
                var sfgc = this.SLLRFS == 1 ? "0":"1";
                var byxzt = this.BYXZT == "" ? 1:this.BYXZT;
                var sbyxzt = this.SBYXZT == "" ? "正常":this.SBYXZT;
                var slzt = this.AbnormalStatus.value;
                // onlinejf(this.UserDetails.YHBH,this.UserDetails.DJC,yl,function(ret){
                //   console.log(JSON.stringify(ret))
                // })//计费功能保留待后端接口修改完成

                var ret = db.executeSqlSync({
                    name: 'CBtest',
                    sql: 'UPDATE MRM_USER_BEAN SET ZD="' + zd + '",SFGC="' + sfgc + '",YL="' + yl + '",CBRQ="' + dataTime() + '",CBBZ="1",BYXZT="' + byxzt + '",CBYSZJD="' + lon + '",CBYSZWD="' + lat + '",SBYXZT="' +
                        sbyxzt + '",SJBM="' + sjbm + '",XBBH = "'+ xbbh +'",SLZT = "'+slzt+'",PATH = "'+path+'" WHERE YHBH="' + this.UserDetails.YHBH + '"'
                });
                _this = this;
                if (ret.status = true) {
                    // 保存成功修改抄表本已抄和未抄
                    var retUser = db.selectSqlSync({
                        name: 'CBtest',
                        sql: 'SELECT * FROM MRM_USER_BEAN WHERE CBCH=\'' + this.cbch + '\' AND CBBZ="1"'
                    });
                    var retUsers = db.selectSqlSync({
                        name: 'CBtest',
                        sql: 'SELECT * FROM MRM_USER_BEAN WHERE CBCH=\'' + this.cbch + '\''
                    });

                    var wcusers = retUsers.data.length - retUser.data.length
                    var retBooks = db.executeSqlSync({
                        name: 'CBtest',
                        sql: 'UPDATE MRM_BOOKS_BEAN SET YC=\'' + retUser.data.length + '\' , WC=\'' + wcusers + '\' WHERE CBCH=\'' + this.cbch + '\''
                    });
                    api.sendEvent({
                        name: 'gxMeterRing',
                        extra: {
                            yc: retUser.data.length,
                            wc: wcusers,
                            cbch: this.cbch
                        }
                    });
                    this.UserDetails.ZD = this.ZD;
                    this.UserDetails.SFGC = sfgc;
                    this.UserDetails.YL = this.YL;
                    this.UserDetails.CBRQ = dataTime();
                    this.UserDetails.CBBZ = '1';
                    this.UserDetails.BYXZT = byxzt;
                    this.UserDetails.CBYSZJD = lon;
                    this.UserDetails.CBYSZWD = lat;
                    this.UserDetails.SBYXZT = sbyxzt;
                    this.UserDetails.SJBM = this.SJBM;
                    this.UserDetails.XBBH = this.XBBH;
                    this.UserDetails.PATH = this.PATH;
                    this.insertPhotoIntoDB();
                    // vant.Toast("保存成功");
                    if (api.connectionType != 'none') {
                        _this.uploaderMeterLocationImg();
                        if (this.sendUpload != "true" && this.sendUploadPicture != "true") {
                            vant.Toast("保存本地成功");
                            api.hideProgress();
                            if (this.sendNext == "true") {
                                setTimeout(function() {
                                    _this.nextHousehold();
                                    _this.preventRepeatTouch = false;
                                }, 300);
                            }else{
                               _this.preventRepeatTouch = false;
                            }
                        } else {
                            if (this.sendUpload == "true" && this.sendUploadPicture == "true") {
                                //保存后自动上传数据和图片
                                _this.uploader(0);
                            } else {
                                if (this.sendUpload == "true") {
                                    // 保存后自动上传数据
                                    _this.uploader(1);
                                }
                                if (this.sendUploadPicture == "true") {
                                    // 保存后自动上传照片
                                    _this.uploaderImg(false,true);
                                }
                            }
                        }
                    }
                    else {
                        vant.Toast("保存本地成功");
                        api.hideProgress();
                        if (this.sendNext == "true") {
                            setTimeout(function() {
                                _this.nextHousehold();
                                _this.preventRepeatTouch = false;
                            }, 300);
                        }else{
                           _this.preventRepeatTouch = false;
                        }
                    }
                }
            },
            uploader(status) { //上传数据
                _this = this;
                var statusOne = status;
                var ret1 = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_USER_BEAN WHERE YHBH=\'' + this.UserDetails.YHBH + '\' AND CBBZ="1"'
                });
                var retbooks = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_BOOKS_BEAN WHERE CBCH=\'' + this.UserDetails.CBCH + '\''
                });
                var UsersDatalisYHBH = this.UserDetails.YHBH;
                var checkCode = retbooks.data[0].YZM;
                var cUserDetails = ret1.data[0];

                if (ret1.status) {
                    var records = [];
                    if (cUserDetails.SFXG == "1") {
                        var user = {
                            "YHBH": cUserDetails.YHBH,
                            "CBBZ": cUserDetails.CBBZ,
                            "QD": cUserDetails.QD,
                            "ZD": cUserDetails.ZD,
                            "YL": cUserDetails.YL,
                            "CBRQ": cUserDetails.CBRQ,
                            "BYXZT": cUserDetails.BYXZT,
                            "SJBM": cUserDetails.SJBM,
                            "JD": cUserDetails.CBYSZJD,
                            "WD": cUserDetails.CBYSZWD,
                            "CJDZ": cUserDetails.CJDZ,
                            "SFXG": cUserDetails.SFXG,
                            "YHMC": cUserDetails.YHMC,
                            "YHDZ": cUserDetails.YHDZ,
                            "SBWZ": cUserDetails.SBWZ,
                            "YDDH": cUserDetails.YDDH,
                            "GDDH": cUserDetails.GDDH,
                            "SBBH": cUserDetails.SBBH,
                            "XBBH": cUserDetails.XBBH,
                        }
                        records.push(user);
                    } else {
                        var user = {
                            "YHBH": cUserDetails.YHBH,
                            "CBBZ": cUserDetails.CBBZ,
                            "QD": cUserDetails.QD,
                            "ZD": cUserDetails.ZD,
                            "YL": cUserDetails.YL,
                            "CBRQ": cUserDetails.CBRQ,
                            "BYXZT": cUserDetails.BYXZT,
                            "SJBM": cUserDetails.SJBM,
                            "XBBH": cUserDetails.XBBH,
                            "JD": cUserDetails.CBYSZJD,
                            "WD": cUserDetails.CBYSZWD,
                            "CJDZ": cUserDetails.CJDZ
                        }
                        records.push(user);
                    }
                    var Parameter = {
                        "ClientId": api.deviceId,
                        "ClientName": api.deviceModel,
                        "OperatorId": $api.getStorage('cbOperatorId'),
                        "OperatorName": $api.getStorage('cbOperatorName'),
                        "Required": "BookId=" + cUserDetails.CBCH + "&CheckCode=" + checkCode + "&Rewrite=true",
                        "Type": "202",
                        "Records": records
                    };
                    var body = {
                        body: JSON.stringify({
                            "UserName": $api.getStorage('cbOperatorName'),
                            "Password": $api.getStorage('cbPassword'),
                            "SerialNo": dataTime(),
                            "Method": "R999",
                            "Parameter": JSON.stringify(Parameter)
                        })
                    }
                    fnPostNoProcess('', body, 'application/json', false, function(ret, err) {
                        if (statusOne != 0) {
                            // 开启一个，开启了数据上传就隐藏
                            api.hideProgress();
                        }
                        if (ret) {
                            var resData;
                            if (ret.Data == "" || ret.Data == undefined || ret.Data == "undefined" || ret.Data == " ") {
                                resData = [];
                            } else {
                                resData = JSON.parse(ret.Data);
                            }
                            if (ret.Status == 0 && ((resData.length > 0 && resData.IS_SCCG == "1") || resData.length == 0)) {
                                var ret = db.executeSqlSync({
                                    name: 'CBtest',
                                    sql: 'update MRM_USER_BEAN set CWXX="", ZTSCCG=1, XGXXSC=1, SFXG=0 where YHBH="' + cUserDetails.YHBH + '"'
                                });
                                var YSCUsers = db.selectSqlSync({
                                    name: 'CBtest',
                                    sql: 'SELECT * FROM MRM_USER_BEAN WHERE CBCH=\'' + cUserDetails.CBCH + '\' AND ZTSCCG="1"'
                                });
                                var retBooks = db.executeSqlSync({
                                    name: 'CBtest',
                                    sql: 'UPDATE MRM_BOOKS_BEAN SET YSC=\'' + YSCUsers.data.length + '\' WHERE CBCH=\'' + cUserDetails.CBCH + '\''
                                });

                                if (statusOne == 0) {
                                    _this.uploaderImg(false, true)
                                } else {
                                    api.toast({
                                        msg: '数据上传成功',
                                        duration: 2000,
                                        location: 'top'
                                    });
                                    if (_this.sendNext == "true") {
                                        setTimeout(function() {
                                            _this.nextHousehold();
                                            _this.preventRepeatTouch = false;
                                        }, 300);
                                    } else {
                                        _this.preventRepeatTouch = false;
                                    }
                                }
                            } else {
                                api.hideProgress();
                                api.toast({
                                    msg: '数据上传失败，已保存本地',
                                    duration: 2000,
                                    location: 'top'
                                });
                                _this.preventRepeatTouch = false;
                            }
                        } else {
                            api.hideProgress();
                            api.toast({
                                msg: '网络连接超时,数据已保存本地',
                                duration: 2000,
                                location: 'top'
                            });
                            _this.preventRepeatTouch = false;
                        }
                    });
                }
            },
            uploaderImg(showProgress,turnToNext) { //上传抄表图片
                _this = this;
                if (showProgress) {
                    api.showProgress({
                        title: '保存图片中',
                        modal: false
                    });
                }
                var retimage = db.selectSqlSync({
                    name: 'CBtest',
                    sql: 'SELECT * FROM MRM_PHOTOS_BEAN WHERE YHBH="' + this.UserDetails.YHBH + '" and SFSC="0" AND NotLoction = "0"'
                });
                if (retimage.status) {
                    if (retimage.data.length > 0) {
                        loaderdata = retimage.data;
                        loader = retimage.data.length;
                        _this.imguploader(loaderdata, loader, 0,loader,turnToNext,false);
                    } else {
                        api.hideProgress();
                        if (_this.sendNext == "true" && turnToNext) {
                            setTimeout(function() {
                                _this.nextHousehold();
                                _this.preventRepeatTouch = false;
                            }, 300);
                        } else {
                            _this.preventRepeatTouch = false;
                        }
                    }
                }
            },
            uploaderMeterLocationImg(){  //上传表位图片
              _this = this;
              var retimage = db.selectSqlSync({
                  name: 'CBtest',
                  sql: 'SELECT * FROM MRM_PHOTOS_BEAN WHERE YHBH="' + this.UserDetails.YHBH + '" and SFSC="0" AND NotLoction = "1"'
              });
              if (retimage.status) {
                  if (retimage.data.length > 0) {
                      loaderdata = retimage.data;
                      loader = retimage.data.length;
                      _this.imguploader(loaderdata, loader, 0,loader, false,true);
                  }
              }
            },
            imguploader(loaderdata, loader, n,falseNum,turnToNext,isMeterLocation) {  //调用上传图片接口
                var PhotoType;
                if (loaderdata[n].NotLoction == '0') {
                    PhotoType = '1';  //抄表图片
                } else {
                    PhotoType = '4';  //表位图片
                }
                var photoList = loaderdata[n];
                _this = this;
                trans.decodeImgToBase64({
                    imgPath: photoList.ZPLJ
                }, function(ret, err) {
                    if (ret.status) {
                        var PhotoInfo = ret.base64Str
                        var Parameter = {
                            "ClientId": api.deviceId,
                            "ClientName": api.deviceModel,
                            "OperatorId": $api.getStorage('cbOperatorId'),
                            "OperatorName": $api.getStorage('cbOperatorName'),
                            "Yhbh": photoList.YHBH,
                            "PhotoName": photoList.ZPMC,
                            "PhotoType": PhotoType,
                            "Longitude": photoList.JD,
                            "Latitude": photoList.WD,
                            "OrderNo": "",
                            "Errtype": "",
                            "Remark": "",
                            "Type": "302",
                            "PhotoInfo": PhotoInfo
                        };
                        var body = {
                            body: JSON.stringify({
                                "UserName": $api.getStorage('cbOperatorName'),
                                "Password": $api.getStorage('cbPassword'),
                                "SerialNo": dataTime(),
                                "Method": "R999",
                                "Parameter": JSON.stringify(Parameter)
                            })
                        };
                        fnPostNoProcess('', body, 'application/json', false, function(ret, err) {
                            if (ret) {
                                if (ret.Status == 0) {
                                    var ret = db.executeSqlSync({
                                        name: 'CBtest',
                                        sql: 'update MRM_PHOTOS_BEAN set SFSC=1 where _id="' + photoList._id + '"'
                                    });
                                    _this.ImgData.forEach(function(item) {
                                        if (item.path == photoList.ZPLJ) {
                                            item.isAppend = false;
                                        }
                                    });
                                    falseNum--;
                                }
                            }
                            if ((n + 1) < loader) {
                                n++;
                                _this.imguploader(loaderdata, loader, n, falseNum, turnToNext, isMeterLocation);
                            } else {
                                if (!isMeterLocation) {
                                    api.hideProgress();
                                    if (falseNum == 0) {
                                        api.toast({
                                            msg: '上传成功',
                                            duration: 2000,
                                            location: 'top'
                                        });
                                        if (_this.sendNext == "true" && turnToNext) {
                                            setTimeout(function() {
                                                _this.nextHousehold();
                                                _this.preventRepeatTouch = false;
                                            }, 300);
                                        } else {
                                            _this.preventRepeatTouch = false;
                                        }
                                    } else {
                                      vant.Dialog.alert({
                                              title: '提示',
                                              message: '存在上传失败的图片，请到数据上传页面重新上传',
                                          })
                                          .then(function() {
                                            if (_this.sendNext == "true" && turnToNext) {
                                                setTimeout(function() {
                                                    _this.nextHousehold();
                                                    _this.preventRepeatTouch = false;
                                                }, 300);
                                            } else {
                                                _this.preventRepeatTouch = false;
                                            }
                                          })
                                    }
                                }
                            }
                        })
                    }
                });
            },
            appendImg() { //已抄追加图片
                this.insertPhotoIntoDB();
                if (this.sendUploadPicture == "true" && api.connectionType != "none") {
                    this.uploaderImg(true, false);
                } else {
                    for (var i = 0; i < this.ImgData.length; i++) {
                        this.ImgData[i].isAppend = false;
                    }
                    api.toast({
                        msg: '图片保存本地成功',
                        duration: 2000,
                        location: 'top'
                    });
                    this.preventRepeatTouch = false;
                }
            },
        },
        mounted: function() {//调用initData()函数挂载了一个文档内元素，含文档元素
            this.initData();
        }
    })
}
