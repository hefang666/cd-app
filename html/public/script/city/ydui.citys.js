! function() {
    var citys = $api.getStorage('citys');
    // console.log(JSON.stringify(citys));
    if (typeof define === "function") {
        define(citys)
    } else {
        window.YDUI_CITYS = citys
    }
}();
