(function() {

	var animationTimerId = null;
	var socket = new io.Socket(location.host, { port: 3442 });
	socket.connect();

	jQuery(function($) {
		var channel = $("form").data("channel");
		var imageList = { add: [], remove: [] };
		var elemCache = []
		var $status = $("h2")
			.first()
			.css({
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center center"
			})
		;

		for (var i = 1; i <= 3; ++i) {
			var addImagePath = "/images/add_anime0" + channel + "_0" + i + ".png";
			var removeImagePath = "/images/remove_anime0" + channel + "_0" + i + ".png";
			
			var addImage = new Image();
			addImage.src = addImagePath;
			var removeImage = new Image();
			removeImage.src = removeImagePath;
			elemCache.push(addImage);
			elemCache.push(removeImage);
			
			imageList.add.push(addImagePath);
			imageList.remove.push(removeImagePath);
		}
		var blackImagePath = "/images/add_anime00_00.png";
		
		var addBlackImage = new Image();
		addBlackImage.src = blackImagePath;
		elemCache.push(addBlackImage);
		
		var removeBlackImage = new Image();
		removeBlackImage.src = blackImagePath;
		elemCache.push(removeBlackImage);
		
		imageList.add.push(blackImagePath);
		imageList.remove.push(blackImagePath);
		
		
		$("button").css({
			width: "10em",
			fontSize: "5em"
		});

		socket.send(JSON.stringify({
			method: "enter",
			params: {
				channel: channel
			}
		}));

		$("#add").live("click", function(event) {
			socket.send(JSON.stringify({
				method: "add",
				params: {
					channel: channel
				}
			}));
			
			var i = 0;
			clearInterval(animationTimerId);
			animationTimerId = setInterval(function() {
				if (i < imageList.add.length) {
					$status.css({
						backgroundImage: "url('" + imageList.add[i++] + "')"
					});
				}
				else {
					i = 0;
					clearInterval(animationTimerId);
				}
			}, 100);
			/*
			$status.text("Yeah!").stop()
				.css({
					scale: "0.5"
				//	rotate: "0deg"
				})
				.animate({
					scale: "1"
				//	rotate: "25deg"
				}, 250, "easeOutBounce")
			;
			*/
			return false;
		});

		$("#remove").live("click", function(event) {
			socket.send(JSON.stringify({
				method: "remove",
				params: {
					channel: channel
				}
			}));
			
			var j = 0;
			clearInterval(animationTimerId);
			animationTimerId = setInterval(function() {
				if (j < imageList.remove.length) {
					$status.css({
						backgroundImage: "url('" + imageList.remove[j++] + "')"
					});
				}
				else {
					j = 0;
					clearInterval(animationTimerId);
				}
			}, 150);
			/*
			$status.text("Oops!").stop()
				.css({
				//	scale: "0.5",
					rotate: "0deg"
				})
				.animate({
				//	scale: "2",
					rotate: "25deg"
				}, 250, "easeOutElastic")
			;
			*/
			return false;
		});

		$("form").first().bind("submit", function(event) {
			return false;
		});

		$("#exit").live("click", function(event) {
			socket.send(JSON.stringify({
				method: "exit",
				params: {
					channel: channel
				}
			}));

			location.href = this.href;
			return false;
		});
	});
})();
