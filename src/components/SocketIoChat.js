//https://itnext.io/building-a-node-js-websocket-chat-app-with-socket-io-and-react-473a0686d1e1
import React from 'react';
import Paper from 'material-ui/Paper';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';
import socketIOClient from 'socket.io-client';
import { MessageList } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import Option from 'muicss/lib/react/option';
import Select from 'muicss/lib/react/select';

const styles = {
	paper_content: {
		padding: 15,
		marginTop: 15,
		marginBottom: 15,
	},
	paper: {
		width: '100%',
		marginTop: 14,
		marginBottom: 0,
		padding: 15,
		textAlign: 'left',
		display: 'inline-block',
	},
	paper_chat: {
		padding: 5,
		marginTop: 10,
		marginBottom: 10,
		height: 230,
		overflowX: 'scroll'
	},
	logoSpace: {
		textAlign: 'center',
	},
	prompt: {
		color: '#BCB3A2'
	},
};

class SocketIoChat extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			message: '',
			walletAddress: '',
			hasWallet: false,
			response: false,
      		endpoint: "http://45.32.186.169:28475", // http://192.168.1.9:28475,
      		incomingMessage: '',
      		inputMessssage: '',
      		inputSocketId: '',
      		posts: [],
      		socketId: '',
      		toSocketId: '',
      		onlineUsers: [],
      		hasOnlineUsers: false,
      		hasNickname: false,
      		myNickname: '',
      		room: '',
		}
		
		this.cofSocket = socketIOClient(this.state.endpoint + "/chat");

		this.componentWillMount = this.componentWillMount.bind(this);
		this.handleInputMessage = this.handleInputMessage.bind(this);
		this.incomingMessage = this.incomingMessage.bind(this);
		this.handleToSocketId = this.handleToSocketId.bind(this);
		this.sendMessage2client = this.sendMessage2client.bind(this);
		this.registerUser = this.registerUser.bind(this);
		this.setNickname = this.setNickname.bind(this);
	}

	componentWillMount() {
		var self = this;
		self.cofSocket.on('connect', function() { 
			self.setState({socketId: self.cofSocket.id});
		});
		self.cofSocket.on('message', function(message) { self.incomingMessage(message) } );
		self.cofSocket.on('users', function(users) { self.setState({onlineUsers: JSON.stringify(users)}) } );
		self.cofSocket.on('room', function(msg) { self.setState({room: msg}) } );
	}

	componentWillUnmount() {
		var self = this;
		self.cofSocket.emit('disconnect', this.state.myNickname);
		self.setState({hasNickname: false});
	}

	incomingMessage(msg) {
		this.setState({response: true});
		this.setState({incomingMessage: JSON.stringify(msg)});
		let posts = this.state.posts;
		let postsAmount = posts.length + 1;
		posts = this.state.posts.slice();
		posts.push({position: 'left', type: 'text', text: msg.data, date: new Date(), 'id': postsAmount});
		this.setState({ posts: posts });
	}

	setNickname(event) {
		this.setState({myNickname: event.target.value});
	}

	registerUser() {
		const self = this;
		self.setState({hasNickname: true});
		let myNickname = self.state.myNickname;
		self.cofSocket.emit('users', {'username': myNickname, 'id': self.state.socketId});
	}

	handleInputMessage(event) {
		this.setState({inputMessssage: event.target.value});
	}

	handleToSocketId(event) {
		this.setState({inputSocketId: event.target.value});
	}

	sendMessage2client() {
		let posts = this.state.posts;
		let postsAmount = posts.length + 1;
		let inputSocketId = this.state.inputSocketId;
		let inputMessssage = this.state.inputMessssage;
		let messageObject = {'user': inputSocketId, 'data': inputMessssage};
		this.cofSocket.emit('message', messageObject);
		posts = this.state.posts.slice();
		posts.push({position: 'right', type: 'text', text: inputMessssage, date: new Date(), 'id': postsAmount});
		this.setState({ posts: posts });
		this.setState({inputMessssage: ''});
	}

	render() {
		return (
			<Paper style={styles.paper} zDepth={3} >
				<div style={styles.paper_content}>
					<h3 className="frente">Socket.io Chat</h3>
					<br/>
					{this.state.hasNickname && <div style={styles.prompt}>online: {this.state.socketId}</div>}
					{!this.state.hasNickname && <Input ref="myNickname" type="text" value={this.state.myNickname} label="Nickname" onChange={this.setNickname} required={false} />}
					{!this.state.hasNickname && <Button type="submit" onClick={() => this.registerUser()} color="primary" variant="raised">Register me</Button>}
					{this.state.hasNickname && <Input ref="inputSocketId" type="text" label="Client ID" value={this.state.inputSocketId} onChange={this.handleToSocketId} required={false} />}
					{this.state.hasNickname && <Input ref="inputMessssage" type="text" label="Your message" value={this.state.inputMessssage} onChange={this.handleInputMessage} required={true} />}
					{this.state.hasNickname && <Button type="submit" onClick={() => this.sendMessage2client()} color="primary" variant="raised">Submit to Client</Button>}
					<p style={styles.prompt}>{this.state.room} {this.state.message} </p>
					<p style={styles.prompt}>Users: {this.state.onlineUsers}</p>
					<div style={styles.paper_chat}>
						<MessageList
							className='message-list'
							lockable={true}
							toBottomHeight={'100%'}
							dataSource={this.state.posts}
						/>
					</div>
				</div>
			</Paper>
		)
	}
}

export default SocketIoChat