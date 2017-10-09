function playVideo(){
	this.wrap = document.getElementById("wrap");
	this.video = document.getElementById("video");
	this.pause = this.wrap.getElementsByClassName("pause")[0];
	this.playBtn = this.wrap.getElementsByClassName("play")[0].getElementsByTagName("i")[0];
	this.totalTimeEle = this.wrap.getElementsByClassName("totaltime")[0];
	this.nowTimeEle = this.wrap.getElementsByClassName("nowtime")[0];
	
	this.progressLine = this.wrap.getElementsByClassName("now")[0];
	this.progressParent = this.progressLine.parentNode;
	this.dragDot = this.progressLine.getElementsByTagName("span")[0];

	this.progressVoiceLine = this.wrap.getElementsByClassName('progressLine')[0];
	this.dragVoiceDot = this.progressVoiceLine.getElementsByTagName("span")[0];
	this.voice = this.wrap.getElementsByClassName("voice")[0];
	
	this.mouseEle = this.wrap.getElementsByClassName("mouse");
	this.speed = this.wrap.getElementsByClassName("speed")[0];
	this.definition = this.wrap.getElementsByClassName("definition")[0];
	
	this.allscreen = this.wrap.getElementsByClassName("allscreen")[0].getElementsByTagName("i")[0];
}
playVideo.prototype = {
	init : function(){
		this.play();  //判断播放还是暂停
		this.countTotalTime();  //计算视频总时间
		this.mouseShow();  //鼠标移入显示
		this.dragProgress();  //拖拽进度条
//		this.dragVoice();  //拖拽音量键	
		this.allScreen();  //进入全屏模式
	},
	play : function(){
		var that = this;
		that.status = true;
		that.video.addEventListener("click",playOrNot,false);
		that.playBtn.addEventListener("click",playOrNot,false);
		function playOrNot (e){
			var e = e || window.event;
			that.status = !that.status;
			if(that.status){  //暂停
				that.pause.style.display = "block";
				that.playBtn.innerHTML = "&#xe6c4;";
				that.video.pause();
			}else{   //播放
				that.pause.style.display = "none";
				that.playBtn.innerHTML = "&#xe6e7;";
				that.video.play();
			}
		}
	},
	countTotalTime : function(){
		var that = this;
		that.video.addEventListener("canplay",function(){
			that.countiNowTime();  //计算当前播放时间
			that.totalTime = that.video.duration;
			var sec = that.video.duration%60>>0;
			var min = Math.floor(that.video.duration /60);
			var hour = Math.floor(that.video.duration/3600);
			hour = hour / 10 < 1 ? "0" + hour : hour;
			min = min / 10 < 1 ? "0" + min : min;
			sec = sec / 10 < 1 ? "0" + sec : sec;
			that.totalTimeEle.innerText = hour + ":" + min + ":" + sec;
		},false);
	},
	countiNowTime : function(){
		var that = this;
		that.dotMove = function(){
			var nowtime = Math.ceil(that.video.currentTime);
			if(nowtime % 60 / 10 < 1){
				that.nowTimeEle.innerText = "00:"+"0"+Math.floor(nowtime/60)+":0"+nowtime % 60;
			}else{
				that.nowTimeEle.innerText = "00:"+"0"+Math.floor(nowtime/60)+":"+nowtime % 60;
			}
			that.progressLine.style.width = Math.floor(nowtime * 100 / that.totalTime + 2) + "%";
			that.dragDot.style.left = "";
			that.dragDot.style.right = "-4px";
		}
		clearInterval(that.timer);
		that.timer = setInterval(that.dotMove,1000);
	},
	mouseShow : function(){
		var that = this;
		that.showEle = null;
		for(var i=0;i<that.mouseEle.length;i++){
			that.mouseEle[i].addEventListener("mouseover",function(){
				that.showEle = this.getElementsByClassName("viewLine")[0];
				that.showEle.style.display = "block";
			},false);
			that.mouseEle[i].addEventListener("mouseout",function(){
				that.showEle.style.display = "none";
			},false);
		}
	},
	dragProgress : function(){
		var that = this;
		//添加拖拽事件
		draggable(that.dragDot,{
			y : false,
			paddingRight : -8,
			callback : function(section,distance){
				that.progressLine.style.width = distance.x + "px";
			},
			callbackEnd : function(pos){
				that.video.currentTime = pos.x * that.totalTime/pos.max>>0;
				that.countiNowTime();
			}
		});
		that.dragDot.addEventListener("mousedown",function(){
			clearInterval(that.timer);
		},false);
		that.dragDot.addEventListener("mouseup",function(){
			that.timer = setInterval(that.dotMove,1000);
		},false);
		var parentOffsetLeft = getOffset(that.progressParent).left;
		that.progressParent.addEventListener("click",function(e){
			var e = e || window.event;
			var clickLeft = e.pageX - parentOffsetLeft;
			that.progressLine.style.width = clickLeft + "px";
			that.video.currentTime = clickLeft * that.totalTime/this.offsetWidth>>0;
			that.countiNowTime();
		},false);
	},
	dragVoice : function(){
		var that = this;
		that.video.volume = 0.4;
		that.progressVoiceLine.style.height = 36 + "px";
		//添加拖拽事件
		draggable(that.dragVoiceDot,{
			x : false,
			paddingBottom : -8,
			callback : function(section,distance){
				console.log(distance.y)
				that.progressVoiceLine.style.height = distance.y + 36 +"px";
			},
			callbackEnd : function(pos){
				that.video.volume = Math.min((pos.y + 36) / pos.max,1);
			}
		});
		//静音
		var clientVoice = that.voice.getElementsByTagName("i")[0];
		var onOff = false;//是否静音
		clientVoice.addEventListener("click",function(){
			onOff = !onOff;
			if(onOff){//静音
				this.innerHTML = "&#xe609;";
				that.audio.volume = 0;
			}else{
				tthis.innerHTML = "&#xe6b1;";
				that.audio.volume = 0.4;
			}
		},false);
	},
	allScreen : function(){
		var that = this;
		var flag = false;
		that.allscreen.addEventListener("click",function(){
			console.log(12)
			flag = !flag;
			if(flag){  //全屏  兼容处理
				if(that.video.requestFullscreen){  //W3C
					that.video.requestFullscreen();
				}else if(that.video.mozRequestFullScreen){  //火狐
					that.video.mozRequestFullScreen();
				}else if(that.video.webkitRequestFullScreen){  //Chrome
					that.video.webkitRequestFullScreen();
				}else if(that.video.msRequestFullscreen){  // IE11
					that.video.msRequestFullscreen();
				}
			}else{
				if(that.video.exitFullscreen){  //W3C
					that.video.exitFullscreen();
				}else if(that.video.mozCancelFullScreen){  //火狐
					that.video.mozCancelFullScreen();
				}else if(that.video.webkitCancelFullScreen){  //Chrome
					that.video.webkitCancelFullScreen();
				}else if(that.video.msExitFullscreen){  // IE11
					that.video.msExitFullscreen();
				}
			}
		},false);
	}
}
//获取元素距离页面的距离
function getOffset(obj){
	var _left=0,_top = 0;
	while(obj){
		_left += obj.offsetLeft;
		_top += obj.offsetTop;
		obj = obj.offsetParent;
	}
	return{
		left:_left,
		top:_top
	}
}
new playVideo().init();
