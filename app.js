/*!
 * N3D demo server-side program
 * @author Uniba Inc.
 * @dependency node.js v0.2.3, socket.io v0.6.1, express v1.0.0, jade v0.5.6
 */

/**
 * Module dependencies.
 */
var
	express = require('express'),
	io = require("socket.io"),
	net = require("net"),
	sys = require("sys")
;

var
	app = module.exports = express.createServer(),
	websocket = io.listen(app),
	count = 0
;

// socket server for swf
var
	proxy,
	clients = {},
	server = net.createServer(function(stream) {
		console.log("tcp client: " + stream.remoteAddress);
		stream.setEncoding("utf8");

		stream.on("connect", function() {
			if (stream.remoteAddress != "127.0.0.1") {
				clients[stream.remoteAddress] = stream;
			}
		});
		stream.on("data", function(data) {
			if (stream.remoteAddress == "127.0.0.1") {
				for (var key in clients) {
					clients[key].write(data + "\n");
				}
			}
		});
		stream.on("end", function() {
			if (stream.remoteAddress != "127.0.0.1") {
				delete clients[stream.remoteAddress];
			}
		});
		stream.on("error", function() {
			sys.log("ignoring exception on stream");
		});
	})
;

// web socket server

websocket.on("connection", function(client) {
	count++;
	console.log("websocket client up");
	client.on("message", function(message) {
		proxy.write(message);
	});
	client.on("disconnect", function() {
	});
	client.on("error", function() {
		sys.log("ignoring exception on websocket client");
	});
});

// Configuration

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyDecoder());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.staticProvider(__dirname + '/public'));
});

app.configure('development', function() {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function() {
	app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res) {
	res.render('index', {
		locals: {
		title: 'n3d-demo'
		}
	});
});

app.get("/console/:channel", function(req, res) {
	var channel = req.params.channel;
	res.render("smartphone/console.ejs", {
		locals: {
			title: "n3d-demo",
			channel: channel
		}
	});
});

app.get("/enter", function(req, res) {
	res.render("cellphone/index", {
		locals: {
			title: "n3d-demo",
			message: "入室すべし"
		}
	});
});

app.get("/enter/:channel", function(req, res) {
	var channel = req.params.channel;
	proxy.write(JSON.stringify({
		method: "enter",
		params: {
			channel: channel
		}
	}));
	res.render("cellphone/console.ejs", {
		layout: false,
		locals: {
			title: "n3d-demo",
			channel: channel,
			image: "blank.gif"
		}
	});
});

app.get("/exit/:channel", function(req, res) {
	var channel = req.params.channel;
	proxy.write(JSON.stringify({
		method: "exit",
		params: {
			channel: channel
		}
	}));
	/*
	res.render("cellphone/index", {
		locals: {
			title: "n3d-demo",
			channel: channel,
			message: "出た"
		}
	});
	*/
	res.redirect('/legacy_gameover.html', 302);
});

app.get("/add/:channel", function(req, res) {
	var channel = req.params.channel;
	proxy.write(JSON.stringify({
		method: "add",
		params: {
			channel: channel
		}
	}));
	res.render("cellphone/console.ejs", {
		locals: {
			title: "n3d-demo",
			channel: channel,
			image: "add_anime0" + channel + ".gif"
		}
	});
});

app.get("/remove/:channel", function(req, res) {
	var channel = req.params.channel;
	proxy.write(JSON.stringify({
		method: "remove",
		params: {
			channel: channel
		}
	}));
	res.render("cellphone/console.ejs", {
		locals: {
			title: "n3d-demo",
			channel: channel,
			image: "remove_anime0" + channel + ".gif"
		}
	});
});

// Only listen on $ node app.js

if (!module.parent) {
	server.listen(9337, function() {
		proxy = net.createConnection(9337);
		app.listen(3442);
		console.log("Express server listening on port %d", app.address().port);
	});
}

