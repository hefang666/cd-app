function navigation(start_lon, start_lat, start_name, end_lon, end_lat, end_name) {
    api.actionSheet({
        buttons: ['百度地图', '高德地图', '谷歌地图']
    }, function(ret, err) {
        var index = ret.buttonIndex;
        if (index == 1) {
            bMap_navigation(start_lon, start_lat, start_name, end_lon, end_lat, end_name);
        } else if (index == 2) {
            aMap_navigation(start_lon, start_lat, start_name, end_lon, end_lat, end_name);
        } else if (index == 3) {
            gMap_navigation(start_lon, start_lat, start_name, end_lon, end_lat, end_name);
        }
    });

}

function bMap_navigation(startLon, startLat, startName, endLon, endLat, endName) {
    if (startLon == null || startLon == "" || startLat == null || startLat == "") {
        alert("没有起点信息");
        return;
    }
    if (endLon == null || endLon == "" || endLat == null || endLat == "") {
        alert("没有终点信息");
        return;
    }

    var navigator = api.require('navigator');
    navigator.installed({
        target: 'bMap'
    }, function(ret, err) {
        if (ret.status) {
            //安装有百度地图
            navigator.bMapNavigation({
                start: { // 起点信息.
                    lon: startLon, // 经度.
                    lat: startLat, // 纬度.
                    name: startName
                },
                end: { // 终点信息.
                    lon: endLon, // 经度
                    lat: endLat, // 纬度
                    name: endName
                },
                mode: 'driving'
            });
        } else {
            //没有安装百度地图
            api.toast({
                msg: '当前手机未安装百度地图，无法进行百度地图导航',
                duration: 2000,
                location: 'bottom'
            });

        }
    });
}

function aMap_navigation(startLon, startLat, startName, endLon, endLat, endName) {
    if (startLon == null || startLon == "" || startLat == null || startLat == "") {
        alert("没有起点信息");
        return;
    }
    if (endLon == null || endLon == "" || endLat == null || endLat == "") {
        alert("没有终点信息");
        return;
    }

    var navigator = api.require('navigator');
    navigator.installed({
        target: 'aMap'
    }, function(ret, err) {
        if (ret.status) {
            //安装有高德地图
            navigator.aMapPath({
                start: {
                    lon: startLon,
                    lat: startLat
                },
                end: {
                    lon: endLon,
                    lat: endLat
                },
                mode: 'driving',
                strateggy: 'drive_fast'
            });
        } else {
            //没有安装高德地图
            api.toast({
                msg: '当前手机未安装高德地图，无法进行高德地图导航',
                duration: 2000,
                location: 'bottom'
            });

        }
    });
}

function gMap_navigation(startLon, startLat, startName, endLon, endLat, endName) {
    if (startLon == null || startLon == "" || startLat == null || startLat == "") {
        alert("没有起点信息");
        return;
    }
    if (endLon == null || endLon == "" || endLat == null || endLat == "") {
        alert("没有终点信息");
        return;
    }

    var navigator = api.require('navigator');
    navigator.installed({
        target: 'gMap'
    }, function(ret, err) {
        if (ret.status) {
            //安装有谷歌地图
            navigator.gMapNavigation({
                start: {
                    lon: startLon,
                    lat: startLat
                },
                end: {
                    lon: endLon,
                    lat: endLat
                },
                mode: 'driving'
            });
        } else {
            //没有安装谷歌地图
            api.toast({
                msg: '当前手机未安装谷歌地图，无法进行谷歌地图导航',
                duration: 2000,
                location: 'bottom'
            });

        }
    });
}
