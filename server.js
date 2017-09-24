var connect = require("./connect.js");
var handler = require("./handler.js");
var util = require("./util.js");
var moment = require("moment");
var ut = require('./util.js');
var constant = require('./constant.js');

//MARK: output log
util.log("[SERVER] STARTING SIGNALLING SERVER", 'green');
util.log("[HANDLER] HANDLERS LOADED", 'green');

//MARK: get namespace
var nsp = connect.io.of("/development");

//MARK: catch when someone connects to the room
nsp.on('connection', function(socket){
	/**
	 * MARK: room connection logic
	 * @param data -> configuration of connecting peer
	 */
	socket.on('broadcast_connect_to_room', function(data){
		//MARK: result container
		var obj = {error: false, content: ''};

		//MARK: set results
		var user_config = data.user_config || {};
		var content = data.content || {};
		var broadcast_hash = data.broadcast_hash || "";
		var command = data.command || "";

		//MARK: STEP 1 - create new promise, perform user_type specific logic
		util.try(function(resolve, reject){
			//MARK: check if chathash is undefined
			if (typeof data.broadcast_hash === 'undefined') {
				obj.content = "reason_unknown_broadcast_hash";
				obj.error = true;
				return reject(obj);
			}
			
			//MARK: if member type is not valid
			if (typeof user_config.user_type === 'undefined') {
				obj.content = "reason_unknown_member_type";
				obj.error = true;
				return reject(obj);
			}

			//MARK: set the try block as 'successful'
			return resolve();
		})

		//MARK: STEP 2 - when the 'try' phase was successful, join room
		.then(function(){
			//MARK: set result of room connection
			obj.error = false;
			obj.content = socket.id;
			
			//MARK: set socket information
			socket.user_data = data;

			//MARK: join socket room
			socket.join(data.broadcast_hash);

			//MARK: announce your arrival to the other peers inside the room
			socket.broadcast.to(data.broadcast_hash).emit("broadcast_general_command",
				{
					command: "broadcast_receive_user_join",
					content: content,
					broadcast_hash: broadcast_hash,
					user_config: user_config
				}
			);
		})

		//MARK: EXCEPTION CASE - catch any errors that may occur during the 'try' phase
		.catch(function(errors){
			util.logError(" [ROOM_CONNECTION] " + JSON.stringify(errors));
			obj.error = true;
			obj.content = errors;
		})
	
		//MARK: STEP 3 - this block must always be called, trigger a callback emitter to the point of origin
		.then(function(){ 
			//MARK: trigger callback/receiver event to originator
			return socket.emit('broadcast_receive_conected_to_room', obj); 
		});
	});

	/**
	 * broadcast_general_command
	 * @param data: object
	 * @param data.command: type of command to be executed
	 * @param data.content: content of command, will depend on the command source
	 * @data.broadcast_hash: the broadcast room's unique identifier
	 * @data.user_config: user's information
	 */
	socket.on('broadcast_general_command', function(data){
		//MARK: result container
		var obj = {error: false, content: ''};
		
		// MARK: check if the data variable contains
		// valid values
		if (
			typeof data.command === undefined || 
			typeof data.broadcast_hash === undefined || 
			typeof data.user_config === undefined || 
			typeof data.content === undefined
		) {
			obj.error = true;
			obj.content = "reason_invalid_room_command";
			return socket.emit('room.generalCommandSent', obj);
		}
		
		//MARK: set vars
		var command = data.command;
		var content = data.content;
		var user_config = data.user_config;
		var broadcast_hash = data.broadcast_hash;
		var mode = data.mode;

		util.log(JSON.stringify(data));

		//MARK: try executing general command
		util.try(function(resolve, reject){
			// identify the command
			switch (command) {
				//MARK: catch if broadcaster started the publish
				case 'broadcast_publish':
					break;

				//MARK: catch if a message is shared inside a channel
				case 'broadcast_channel_message':
					break;

				//MARK: if command received is not in any of the cases above, reject promise.
				default:
					resolve();
			}

		})

		//MARK: when the 'try' phase was successful
		.then(function(response){
			//MARK: if broadcast to all, excluding sender
			if (mode == 'to_room') {
				socket.broadcast.to(broadcast_hash).emit('broadcast_general_command', data);
			
			//MARK: if broadcast to room, including sender
			} else {
				nsp.in(broadcast_hash).emit('broadcast_general_command', data);
				
			}
			
			// set content
			obj.command = command;
			obj.error = false;
			obj.content = data;
		})

		//MARK: catch any errors that may occur during the 'try' phase
		.catch(function(errors){
			util.logError(" [GENERAL_COMMAND] " + errors);
		})

		//MARK: always trigger this function
		.then(function(){
			//MARK: trigger callback/receiver event to originator
			return socket.emit('broadcast_general_command_sent', data);
		});
	});

	//MARK: 'socket' disconnection event listener
	socket.on('disconnect', function(action){
		//MARK: log actions
		util.log("[DISCONNECTION] " + socket.id + " action -> " + action, "red");
		util.log(JSON.stringify(socket.user_data), "red");
		var user_data = socket.user_data;
		var disconnection_type = "user_sudden_disconnection";

		//MARK: is has no user_data, return
		if (!user_data) {
			return false;
		}
		
		//MARK: leave room
		if (
			user_data !== null &&
			typeof user_data.broadcast_hash !== 'undefined'
		) { socket.leave(user_data.broadcast_hash); }
		
		//MARK: try executing the disconnection logic
		util.try(function(resolve, reject){

			//MARK: send sudden user disconnection emit
			//client namespace disconnect = manually disconnected by user
			//server namespace disconnect = manually disconnected by server
			//everything else is considered an outlier event such as refreshing or protocol error in the browser's side
			if (action == "client namespace disconnect") {
				disconnection_type = "user_manual_disconnection";

			} else if (action == "server namespace disconnect") {
				disconnection_type = "server_manual_disconnection";

			}
			
			//MARK: emit disconnection to everyone inside the room
			nsp.in(user_data.broadcast_hash).emit('broadcast_general_command', {
				command: "broadcast_receive_user_disconnect",
				user_data,
				content: {
					disconnection_type: disconnection_type
				}
			});

			//MARK: resolve function
			return resolve();
		})
		
		// catch any errors that may occur during the 'try' phase
		.catch(function(errors){
		})
	});
});
