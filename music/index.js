/*
 
 * audio标签API
 * oAudio.currentTime 返回当前播放的时间
 * 
 * 
 * */

function audioPlay(){
	this.audio = document.getElementById("audiores");
	this.playBtn = document.getElementsByClassName("btn_play")[0];  //播放按钮
	this.endTime = document.getElementsByClassName("endTime")[0];	//结束时间
	this.nowTime = document.getElementsByClassName("nowTime")[0];	//当前时间
	this.progressLine = document.getElementsByClassName("player-nowprog")[0];	//进度条宽度
	this.progressParent = document.getElementsByClassName("player-progress")[0];	//进度条父元素
	this.progressVoiceParent = document.getElementsByClassName("player-progress-inner")[0];	//音量条父元素
	this.dragDot = this.progressLine.getElementsByTagName("i")[0];
	this.progressVoiceLine = document.getElementsByClassName("now-pro")[0];	//音量宽度
	this.dragVoiceDot = this.progressVoiceLine.getElementsByTagName("i")[0];
	this.oUl = document.getElementById("song_box");
	this.aLi = this.oUl.getElementsByTagName("li");
	this.rotateImgM = document.getElementsByClassName("rotate")[0];
	this.body = document.getElementsByTagName("body")[0];
}
audioPlay.prototype = {
	init : function(){
		//获取歌曲总时间
		var that = this;
		this.audio.addEventListener("canplay",function(){
			that.totalTime = that.audio.duration;
			var endTMin = Math.floor(that.totalTime/60);
			var endTSecond = Math.ceil(that.totalTime%60);
			if(endTSecond == 60){
				endTSecond = "0";
				endTMin += 1;
			}
			if(endTMin / 10 < 1) endTMin = "0"+endTMin;
			if(endTSecond / 10 < 1) endTSecond = "0"+endTSecond;
			that.endTime.innerText = endTMin + ":" + endTSecond;
			//图片开始旋转
			that.rotateImgM.style.animation = "rotation 3s linear infinite";
			that.simColorArr = ["#cfc5b9","#f49ccc","#394b93","#d8cec4","#0c2529","#e3c259","#fff"];
			that.body.style.backgroundColor = that.simColorArr[0];
		},false);
		//开始播放歌曲
		this.play();
		//点击切换歌曲
		this.liClick();
		//拖拽进度条
		this.draggab();
		//播放模式
		this.playMode();
		//检测歌曲 是否结束
		this.isEnd();
		//点击切换下一首
		this.playNext();
		this.playPrev();
		//改变音量
		this.dragVoice();
		//收藏歌曲
		this.showLike();
		this.progress();
		//控制歌词播放
		this.lyricPlayer();
	},
	play : function(){
		var that = this;
		var flag = true;   //判断当前状态是否在播放
		var rotateImg = document.getElementsByClassName("disc")[0];
		this.playBtn.addEventListener("click",function(){
			//暂停播放
			if(flag){
				this.className = "btn_play";
				flag = false;
				that.audio.pause();
				rotateImg.style.transform = "rotate(-21deg)";
				that.rotateImgM.style.animation = "rotation 3s linear 1";
				return;
			}
			//开始播放
			this.className = "btn_play btn-pause";
			flag = true;
			that.audio.play();
			that.progress();
			rotateImg.style.transform = "rotate(1deg)";
			that.rotateImgM.style.animation = "rotation 3s linear infinite";
		},false);
	},
	progress : function(){
		var that = this;
		that.dotMove = function(){
			var nowtime = Math.ceil(that.audio.currentTime);
			if(nowtime % 60 / 10 < 1){
				that.nowTime.innerText = "0"+Math.floor(nowtime/60)+":0"+nowtime % 60;
			}else{
				that.nowTime.innerText = "0"+Math.floor(nowtime/60)+":"+nowtime % 60;
			}
			that.progressLine.style.width = Math.floor(nowtime * 100 / that.totalTime) + "%";
			that.dragDot.style.left = "";
			that.dragDot.style.right = "-4px";
		}
		clearInterval(that.timer);
		that.timer = setInterval(that.dotMove,1000);
	},
	liClick : function(){
		var that = this;
		that.navSongName = document.getElementsByClassName("song-name")[0];
		that.navSongAuthor = document.getElementsByClassName("song-singer")[0];
		that.iNowPlay = 0;
		for(var i=0;i<that.aLi.length;i++){
			that.aLi[i].index = i;
			that.aLi[i].addEventListener("click",function(){
				//记录当前点击的LI
				that.iNowPlay = this.index;
				//点击事件，可复用
				that.liClickFunction(this);
			},false);
		}
	},
	liClickFunction : function(obj){
		var that = this;
		var songName = obj.getElementsByTagName("span")[0].innerText;
		var author = obj.getElementsByClassName("author")[0].innerText;
		var playing = obj.getElementsByClassName("number")[0];
		
		//遍历更改序号位置的wave图片
		for(var i=0;i<that.aLi.length;i++){
			that.aLi[i].getElementsByClassName("number")[0].className = "number";
		}
		playing.className = "number playing";
		//更改audio的src路径
		that.audio.src = "res/"+songName+".m4a";
		that.audio.autoplay = "autoplay";
		that.navSongName.innerText = songName;
		that.navSongAuthor.innerText = author;
		that.progress();
		that.lyricPlayer();
		that.changeTitle(songName,author);  //更换标题文字
	},
	draggab : function(){
		var that = this;
		//添加拖拽事件
		draggable(that.dragDot,{
			y : false,
			paddingRight : -8,
			callback : function(section,distance){
				that.progressLine.style.width = distance.x + "px";
			},
			callbackEnd : function(pos){
				that.audio.currentTime = pos.x * that.totalTime/pos.max>>0;
				that.progress();
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
			that.audio.currentTime = clickLeft * that.totalTime/this.offsetWidth>>0;
			that.progress();
		},false);
	},
	dragVoice : function(){
		var that = this;
		that.audio.volume = 0.4;
		that.progressVoiceLine.style.width = 33 + "px";
		//添加拖拽事件
		draggable(that.dragVoiceDot,{
			y : false,
			paddingRight : -8,
			callback : function(section,distance){
				that.progressVoiceLine.style.width = distance.x + 33 +"px";
			},
			callbackEnd : function(pos){
				that.audio.volume = Math.min((pos.x + 33) / pos.max,1);
			}
		});
		//静音
		var clientVoice = document.getElementsByClassName("btn-big-voice")[0];
		var onOff = false;//是否静音
		clientVoice.addEventListener("click",function(){
			onOff = !onOff;
			if(onOff){//静音
				this.style.backgroundPosition = "0 -182px";
				that.audio.volume = 0;
			}else{
				this.style.backgroundPosition = "0 -144px";
				that.audio.volume = 0.4;
			}
		},false);
	},
	playMode : function(){
		var that = this;
		var oMode = document.getElementById("play-mod");
		var allModes = ["btn-Loop-single","btn-Loop-order","btn-Loop-random","单曲循环","顺序播放","随机播放"];
		this.iNow = 0;
		oMode.addEventListener("click",function(){
			that.iNow++;
			that.iNow %= 3;
			this.className = allModes[that.iNow];
			this.title = allModes[that.iNow + allModes.length/2];
			that.isEnd();
		},false);
	},
	isEnd : function(){
		var that = this;
		switch(that.iNow){
			case 0 :
				//单曲循环
				that.audio.loop = true;
				break;
			case 1 :
				//顺序播放
				that.audio.loop = false;
				that.audio.addEventListener("ended",function(){
					that.iNowPlay += 1;
					if(that.iNowPlay == that.aLi.length) that.iNowPlay = 0;
					//获取下一个元素
					var thatEle = that.aLi[that.iNowPlay];
					that.liClickFunction(thatEle);
					that.lyricPlayer();
				},false);
				break;
			case 2 : 
				//随机播放
				that.audio.loop = false;
				that.audio.addEventListener("ended",function(){
					var random = Math.floor(Math.random()*that.aLi.length);
					that.iNowPlay = random;
					//获取下一个随机元素
					var thatEle = that.aLi[that.iNowPlay];
					that.liClickFunction(thatEle);
					that.lyricPlayer();
				},false);
		}
	},
	playNext : function(){
		var that =this;
		var nextBtn = document.getElementsByClassName("btn_next")[0];
		nextBtn.addEventListener("click",function(){
			that.iNowPlay += 1;
			if(that.iNowPlay == that.aLi.length) that.iNowPlay = 0;
			//获取下一个元素
			var thatEle = that.aLi[that.iNowPlay];
			that.liClickFunction(thatEle);
		},false);
	},
	playPrev : function(){
		var that =this;
		var nextBtn = document.getElementsByClassName("btn_prev")[0];
		nextBtn.addEventListener("click",function(){
			that.iNowPlay -= 1;
			if(that.iNowPlay <0) that.iNowPlay = that.aLi.length-1;
			//获取下一个元素
			var thatEle = that.aLi[that.iNowPlay];
			that.liClickFunction(thatEle);
		},false);
	},
	showLike : function(){
		var oGreat = document.getElementsByClassName("btn-great")[0];
		var flag = false;
		oGreat.addEventListener("click",function(){
			flag = !flag;
			if(flag){
				this.style.backgroundPosition = "-30px -96px";
			}else{
				this.style.backgroundPosition = "-0 -96px";
			}
		},false);
	},
	lyricPlayer : function(){
		var that = this;
		//通过ajax请求当前播放的音乐歌词文件
		var songName = that.aLi[that.iNowPlay].getElementsByTagName("span")[0].innerText;
		songName = encodeURI(songName);
		//发送ajax请求歌词文件
		var xhr = null;
		if(window.XMLHttpRequest){
			xhr = new XMLHttpRequest();
		}else{ // IE
			xhr = new ActiveXObject("Microsoft.XMLHTTP");
		}
		
		xhr.open("get","res/"+songName+".lrc",true);
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4){
				if(xhr.status == 200){
					var songRic = xhr.responseText;
					//获取时间
					that.totalTimeArr = [];
					songRic.replace(/\[(\d*):(\d*)\.(\d*)\]/g,function(){
						var secTime = arguments[2] | 0;  //秒
						var minTime = arguments[1] | 0;  //分
						var totalTime = minTime * 60 + secTime;  //总秒数
						that.totalTimeArr.push(totalTime);
					});
					//获取纯文本歌词
					var onlyRic = songRic.replace(/\[\d\d:\d\d\.\d*\]/g,"");
					//歌词分割成数组
					var everyRic = onlyRic.split("\n");
					//生成p标签
					var htmlStr = "";
					for(var i=2;i<everyRic.length;i++){
						htmlStr += "<p data-timeline="+that.totalTimeArr[i-2]+">"+everyRic[i]+"</p>";
					}
					that.parentRic = document.getElementsByClassName("allric")[0];
					that.parentRic.innerHTML = htmlStr;
					that.childrenRICp = that.parentRic.children;
					that.rollRic();   //歌词滚动
				}
			}
		}
		xhr.send();
	},
	rollRic : function(){
		var that = this;
		setInterval(function(){
			if(!that.audio.paused){  //正在播放时触发
				for(var i=0;i<that.totalTimeArr.length;i++){
					if(that.totalTimeArr[i-1] == Math.floor(that.audio.currentTime)){
						that.parentRic.style.top = -(i-3)*34 + "px";
						for(var j=0;j<that.childrenRICp.length;j++){
							that.childrenRICp[j].className = "";
						}
						that.childrenRICp[i-1].className = "on";
					}
				}
			}
		},500);
	},
	changeTitle : function(name,author){
		var songName = document.getElementsByClassName("msong-name")[0];
		var songAuthor = document.getElementsByClassName("author-name")[0];
		songName.innerText = name;
		songAuthor.innerText = author;
		this.rotateImgM.src = "img/maomao"+(this.iNowPlay+1)+".jpg";
		var oMask = document.getElementsByClassName("mask")[0];
		oMask.style.backgroundImage = "url(img/maomao"+(this.iNowPlay+1)+".jpg)";
		this.body.style.backgroundColor = this.simColorArr[this.iNowPlay];
	}
}

var audioP = new audioPlay().init();

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
function getStyle(obj,attr){
	return obj.currentStyle ? parseInt(obj.currentStyle[attr]) : parseInt(window.getComputedStyle(obj,null)[attr]);
}
/*问题1、如何判断audio中的src加载完毕  
*   解决：监听audio的canplay事件
* 问题2、如何在audio的src没有加载情况下，获取歌曲总时长，填写在.total-time
* 	解决：监听audio的canplay事件
* 问题3、监听音乐播放结束
* 	解决:监听audio的ended事件
* 问题4、解决歌词实时更新滚动问题
* 	解决：使用lrc歌词文件
* 
* 
* 
* */