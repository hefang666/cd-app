/**
 * aui-scroll.js
 * @author  流浪男
 * @todo more things to abstract, e.g. Loading css etc.
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
(function(window) {
	'use strict';
	var isToBottom = false,isMoved = false;
	var moveTime = 0;
	var auiScroll = function (params,callback) {
		this.extend(this.params, params);
		this._init(params,callback);
	}
	auiScroll.prototype = {
		params: {
			listren:false,
            distance: 100
        },
		_init : function(params,callback) {
			var self = this;
			if(self.params.listen){
				document.body.addEventListener("touchmove", function(e){
					// self.scroll(callback);
					moveTime ++ ;
				});
				document.body.addEventListener("touchend", function(e){
					// 修改，新加判断是否是滚动而不是单击 （5.22 张雪飞）
					if (moveTime > 0) {
							self.scroll(callback);
							moveTime = 0;
					}

				});
			}
			window.onscroll = function(){
				self.scroll(callback);
			}
		},
		scroll : function (callback) {
			var self = this;
			var clientHeight = document.documentElement.scrollTop === 0 ? document.body.clientHeight : document.documentElement.clientHeight;
			var scrollTop = document.documentElement.scrollTop === 0 ? document.body.scrollTop : document.documentElement.scrollTop;
			var scrollHeight = document.documentElement.scrollTop === 0 ? document.body.scrollHeight : document.documentElement.scrollHeight;

			if (scrollHeight-scrollTop-self.params.distance <= window.innerHeight) {
	        	isToBottom = true;
	        	if(isToBottom){
	        		callback({
	        			"scrollTop":scrollTop,
	        			"isToBottom":true
	        		})
	        	}
	        }else{
	        	isToBottom = false;
	        	callback({
        			"scrollTop":scrollTop,
        			"isToBottom":false
        		})
	        }
		},
        extend: function(a, b) {
			for (var key in b) {
			  	if (b.hasOwnProperty(key)) {
			  		a[key] = b[key];
			  	}
		  	}
		  	return a;
		}
	}
	window.auiScroll = auiScroll;
})(window);
