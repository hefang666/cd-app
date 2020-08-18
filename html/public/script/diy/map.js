var map = api.require('bMap');
map.getLocation({
        accuracy: '100m',
        autoStop: true,
        filter: 1
    }, function(ret, err) {
        if (ret.status) {
            //获取用户位置
            console.log(JSON.stringify(ret));
            map.open({
                rect: {
                  x: 0,
                  y: 0,
                  w: '80%',
                  h:  'auto',
                  margin-left:'1rem'
                },
                center: {
                    // lon: ret.lon,
                    // lat: ret.lat
                },
                zoomLevel: 15, //地图缩放等级  取值范围3-18 值越大放大倍数越高
                showUserLocation: true, //是否显示用户位置
                fixedOn: api.frameName,
                fixed: true
            }, function(ret) {

                if (ret.status) {
                    // console.log("map open success");
                    //设置中心点的 图标
                      setcenter()
                      //viewchange监听
                      listening()

                } else {
                    //console.log('map open error');
                }
            });

            map.showUserLocation({
                isShow: true,
                trackingMode: 'none',
                // imagePath:'widget://image/mylocation.png'
            });

        } else {
            alert(err.code);
        }
    });

// 写死数据是的代码
function listening(){
map.addEventListener({
      name: 'viewChange'
  }, function(ret) {
      if (ret.status) {
          // alert(JSON.stringify(ret));
          console.log(JSON.stringify(ret));
          //清除标注
          // clearDeviceFromMap()
          map.getCenter(function(ret) {
              // alert(ret.lon + '*' + ret.lat);
              console.log(ret.lon + '*' + ret.lat);
              var devicewidthlocation = api.frameWidth;
              if (devicewidthlocation < 360) {
                map.addAnnotations({
                    annotations: [{
                        // id: id,
                        lon: ret.lon - 0,
                        lat: ret.lat - 0
                    }],
                    icon: 'widget://image/mylocation.png',
                    draggable: false
                }, function(ret) {
                    if (ret) {
                        // alert(ret.id);
                    }
                });
              }else {
                    map.addAnnotations({
                        annotations: [{
                            // id: id,
                            lon: ret.lon - 0,
                            lat: ret.lat - 0
                        }],
                        icon: 'widget://image/mylocation1.png',
                        draggable: false
                    }, function(ret) {
                        if (ret) {
                            // alert(ret.id);

                        }
                    });
                }

              //发送ajax请求数据
              //ajaxdata()
             annotationscontent = [{
                      "id": 2,
                      "lon": 120.147530,   //控制左右经度 数值越小越靠左
                      "lat": 30.282950,    //上下   数值越小越靠下
                  }, {
                      "id": 3,
                      "lon": 120.131600,
                      "lat": 30.282950,
                  }
                  ,{
                      "id": 1,
                      "lon": 120.140530,
                      "lat": 30.292950,
                  },{
                      "id": 5,
                      "lon": 120.140530,
                      "lat": 30.272950,
                  }];
                  //添加标注到地图
              // for (var i = 0; i < annotationscontent.length; i++) {
              //     addDeviceToMap(annotationscontent.id, annotationscontent.lon, annotationscontent.lat)
              // }
          })
      }
  });

}
function ajaxdata(){
  api.ajax({
      url: API_Path + '/api/GetChargingPileMap',
      method: 'post',
      headers: {
          'Content-Type': 'application/json',
          'token': $api.getStorage('Token')
      },
      data: {
          body: JSON.stringify({
            Version: "1.00",
            Platform: 1,
            Data: {
                "LongitudeMin":rets.lon - 0.1,
                "LatitudeMin":rets.lat - 0.15,
                "LongitudeMax":rets.lon + 0.1,
                "LatitudeMax":rets.lat + 0.15
             }
          })
      }
  },function(ret, err){
      if (ret) {
          // alert( JSON.stringify( ret ) );
          console.log(JSON.stringify( ret ));
          if (ret.Code == 200) {
            var data = ret.Data;
            console.log(JSON.stringify( data ));
            annotationscontent = transfer(data);
             console.log(JSON.stringify( annotationscontent ));
             for (var i = 0; i < annotationscontent.length; i++) {
                 addDeviceToMap(annotationscontent.id, annotationscontent.lon, annotationscontent.lat)
             }
          }
      } else {
          // alert( JSON.stringify( err ) );
      }
  });
}
var rets;
function setcenter() {
  map.getCenter(function(ret) {
      // alert(ret.lon + '*' + ret.lat);
      console.log(JSON.stringify(ret));
      rets = ret;
      console.log(ret.lon + '*' + ret.lat);
      var devicewidthlocation = api.frameWidth;
      if (devicewidthlocation < 360) {
        map.addAnnotations({
            annotations: [{
                // id: id,
                lon: ret.lon - 0,
                lat: ret.lat - 0
            }],
            icon: 'widget://image/mylocation.png',
            draggable: false
        }, function(ret) {
            if (ret) {
                // alert(ret.id);
            }
        });
      }else {
            map.addAnnotations({
                annotations: [{
                    // id: id,
                    lon: ret.lon - 0,
                    lat: ret.lat - 0
                }],
                icon: 'widget://image/mylocation1.png',
                draggable: false
            }, function(ret) {
                if (ret) {
                    // alert(ret.id);
                }
            });
        }
      //发送ajax请求数据
        //ajaxdata()
      /*annotationscontent = [{
              "id": 1,
              // "locationType": 0,
              "lon": 120.267530,   //控制左右 数值越小越靠左
              "lat": 30.283950,    //上下   数值越小越靠下
          }, {
              "id": 2,
              // "locationType": 1,
              "lon": 120.151600,
              "lat": 30.283950,
          }
          ,{
              "id": 3,
              // "locationType": 0,
              "lon": 120.140530,
              "lat": 30.292950,
          },{
              "id": 4,
              // "locationType": 1,
              "lon": 120.140530,
              "lat": 30.272950,
          }
        ]
          // alert(111)
          //添加标注到地图
      console.log(annotationscontent.length);
      for (var i = 0; i < annotationscontent.length; i++) {
          addDeviceToMap(annotationscontent.id, annotationscontent.lon, annotationscontent.lat)
      }*/
  })
}
