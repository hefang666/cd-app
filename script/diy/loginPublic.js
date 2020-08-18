function fnReadyOpenWin() {
    var buttons = $api.domAll('.open-win');

    for (var i = 0; i < buttons.length; i++) {
        $api.attr(buttons[i], 'tapmode', 'highlight');
        buttons[i].onclick = function() {
            var target = $api.closest(event.target, '.open-win');
            var winName = $api.attr(target, 'win'),
                isNeedLogin = $api.attr(target, 'login'),
								isLoginPage=$api.attr(target, 'loginPage'),
                param = $api.attr(target, 'param');

            if (isNeedLogin=='true' && !$api.getStorage('loginUser')) {
                winName = 'login';
            }

            var v_animation={};
            if (param) {
                param = JSON.parse(param);
            }

            if(winName=='login'){
                v_animation.type='push';
                v_animation.subType='from_bottom';
                v_animation.duration=400;
            }
						// alert(isLoginPage);
						// alert( 'html/' + winName + '.html');
						// alert(isLoginPage=='true');
						api.openWin({
										name: winName.replace('html/', ''),
										url: './html/' + winName + '.html',
										pageParam: param,
										animation:v_animation
						});


        };
    }
    api.parseTapmode();
};
