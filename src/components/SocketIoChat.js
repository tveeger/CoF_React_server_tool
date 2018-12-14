import React from 'react';
import ethers from 'ethers';
import AsyncStorage from '@callstack/async-storage';
import Paper from 'material-ui/Paper';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';
import socketIOClient from 'socket.io-client';
import { MessageBox, ChatItem, MessageList } from 'react-chat-elements';

//https://itnext.io/building-a-node-js-websocket-chat-app-with-socket-io-and-react-473a0686d1e1
//import server from 'http' ;
//import io from 'socket.io';

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
	}
};

class SocketIoChat extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			message: '123',
			walletAddress: '',
			hasWallet: false,
			response: false,
      		endpoint: "http://localhost:8000",
      		incomingMessage: '',
      		inputMessssage: '',
      		inputSocketId: '',
      		posts: [],
      		socketId: '',
      		toSocketId: '',
		}
		this.componentWillMount = this.componentWillMount.bind(this);
		//this.socket = socketIOClient(this.state.endpoint);
		//this.newsSocket = socketIOClient(this.state.endpoint + "/news");
		this.cofSocket = socketIOClient(this.state.endpoint + "/chat");

		this.handleInputMessage = this.handleInputMessage.bind(this);
		this.incomingMessage = this.incomingMessage.bind(this);
		this.handleToSocketId = this.handleToSocketId.bind(this);
		this.sendMessage2client = this.sendMessage2client.bind(this);
	}

	componentWillMount() {
		var self = this;
		self.cofSocket.on('connect', function() { 
			self.setState({socketId: self.cofSocket.id});
		});
		self.cofSocket.on('message', function(message) { self.incomingMessage(message) } );
		self.cofSocket.on('users', function(message) { self.incomingMessage({data: message}) } );
		//let clients = self.cofSocket.of('/chat').clients();

	}

	componentWillUnmount() {
		var self = this;
		self.cofSocket.on('disconnect', true);
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
		//this.setState({inputMessssage: ''});
	}

	render() {
		return (
			<Paper style={styles.paper} zDepth={3} >
				<div style={styles.paper_content}>
					<h3 className="frente">Socket.io Chat</h3>
					<br/>
					<p>ID: {this.state.socketId}</p>
					<Input ref="inputSocketId" type="text" label="Client ID" value={this.state.inputSocketId} onChange={this.handleToSocketId} required={false} />
					<Input ref="inputMessssage" type="text" label="Your message" value={this.state.inputMessssage} onChange={this.handleInputMessage} required={true} />
					<Button type="submit" onClick={() => this.sendMessage2client()} color="primary" variant="raised">Submit to Client</Button>
					<p>{this.state.message}</p>
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