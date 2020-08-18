function operationDom() {
    var antions=$api.domAll('[data-action]');
    // alert("数量为"+antions.length)
    for(var i=0;i<antions.length;i++){
        antions[i].onclick=function () {
            var target =this;
            var actionName = $api.attr(target, 'data-action');
            // var num=$api.attr(target,'data-id')
            // alert(actionName)
        var action=actionList[actionName]
        action.call(target);
        }
    }
}
operationDom();
