//MARK - set the dependencies
var fs         = require("fs");					// file manipulation
var express    = require("express"); 			// routing
var crypto     = require('crypto');				// encryption
var moment     = require("moment"); 			// time manipulation
var _          = require("underscore"); 		// array handling
var app        = express(); 					// server
var redis      = require("socket.io-redis"); 	// redis

//MARK - load external javascript libraries
var constants  = require('./constant.js');
var util  = require('./util.js');
var model = require('./model.js');
var ssl = require('./ssl.js');
var db = require('./database.js');

//MARK - set socket configuration
var socketConfig = {
	'origins': ssl.origins, 
	'pingTimeout': 40000, 
	'pingInterval': 10000
};

//MARK - set server functions
var server     = require('http').createServer(app);
var io         = require("socket.io").listen(server, socketConfig);
var socket     = io.sockets;

//MARK: IO adapter
var redis_hostname = "127.0.0.1";
var redis_port = 6379;
var redis_password = "";

//MARK: publish and subscribe to these events
var pub = require('redis').createClient(redis_port, redis_hostname);
var sub = require('redis').createClient(redis_port, redis_hostname);

//MARK: add adapter
io.adapter(redis({pubClient: pub, subClient: sub}));

//MARK - listen to default port 0.0.0.0
var server = server.listen(constants.port, "0.0.0.0", function(){ 
	util.log("[SOCKET] listening to port " + constants.port, 'green');
});

//MARK - export
exports.io = io; 				// socket.io object
exports._ = _; 					// underscore object
exports.util = util; 			// common util library