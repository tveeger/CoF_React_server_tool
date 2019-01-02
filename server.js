// To start: type: node server
const server = require('http').createServer();
const io = require('socket.io')(server);

var allClients = [];

var chat = io
.of('/chat')
.on('connection', (socket) => {

	socket.on('users', (data) => {
		allClients.push(data);
		chat.emit('users', allClients);
		console.info('came in:', JSON.stringify(allClients[0]));
	});

	socket.on('disconnect', () => {
		chat.emit('room', 'Client left: ' + socket.id);
		var i = allClients.indexOf(socket);
		allClients.splice(i, 1);
		chat.emit('users', allClients);
		console.info('has left', socket.id);
	});

	socket.on('message', function(msg){
		chat.to(msg.user).emit('message', msg);
		console.info('msg: ', msg);
	});
});

var acquire = io
.of('/acquire')
.on('connection', function (socket) {
	socket.on('message', function(msg){
		acquire.to(msg.user).emit('message', msg);
		console.info('acquire: ', msg);
	});
	socket.on('disconnect', function(){
		acquire.emit('user disconnected');
	});
});

var redeem = io
.of('/redeem')
.on('connection', function (socket) {
	socket.on('message', function(msg){
		redeem.to(msg.user).emit('message', msg);
		console.info('redeem: ', msg);
	});
	socket.on('disconnect', function(){
		redeem.emit('user disconnected');
	});
});

const port = 28475;
server.listen(port, function (err) {
	if (err) throw err;
	console.info('listening on port ', port);	
});
