import React from 'react';
import ethers from 'ethers';
import AsyncStorage from '@callstack/async-storage';
import Button from 'muicss/lib/react/button';
import Divider from 'muicss/lib/react/divider';
import Paper from 'material-ui/Paper';
import {redA400} from 'material-ui/styles/colors';
import Input from 'muicss/lib/react/input';
import 'react-chat-elements/dist/main.css';
import { MessageBox, ChatItem, MessageList } from 'react-chat-elements';
//https://reactnativeexample.com/reactjs-chat-elements-chat-ui/
//npm install ws https://github.com/websockets/ws
//import WebSocket from 'ws';


const styles = {
	paper_content: {
		padding: 15,
		marginTop: 15,
		marginBottom: 15,
	},
	paper: {
		width: '100%',
		marginTop: 50,
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
	warningText: {
		color: 'red',
		fontWeight: 'bold'
	},
	mnemonicText: {
		color: 'whitesmoke',
		fontFamily: 'Oswald',
		fontSize: '160%'
	},
	mnemonicBox: {
		marginTop: 20,
		marginBottom: 20,
		paddingLeft: 20,
		paddingRight: 20,
		paddingTop: 10,
		paddingBottom: 10,
		backgroundColor: '#2D4866',
	},
	prompt: {
		color: '#BCB3A2'
	},
};

class MessagingForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			submitMessage: '',
			walletAddress: '',
			isBusy: false,
			message: '',
			errorMessage: '',
			inputMessssage: '',
			hasWallet: false,
			connected: false,
			incoming: '',
			remoteAddress: '',
			posts: [],
		};

		this.handleInputMessage = this.handleInputMessage.bind(this);
		this.sendMessage = this.sendMessage.bind(this);

		//this.socket = new WebSocket('ws://45.32.186.169:28475'); //CoF website
		this.socket = new WebSocket('ws://127.0.0.1:28475/cof');	//test local
		//this.socket = new WebSocket('ws://echo.websocket.org'); //test
		this.socket.onopen = () => {
			this.setState({connected:true});
		};
		this.socket.onmessage = (e) => {
			//this.setState({incoming:e.data})
			this.handleIncommingMessage(e.data)
		};
		this.socket.onerror = (e) => {
			this.setState({errorMessage: e.message})
		};
		this.socket.onclose = (e) => {
			this.setState({connected:false})
			//this.setState({errorMessage: e.code + ', ' + e.reason});
		};
	}

	componentWillMount() {
		var self = this;
		AsyncStorage.getItem("walletAddress").then(walletAddress => {
			if (walletAddress) {
				let posts = this.state.posts;
				this.setState(() => ({ walletAddress: walletAddress }));
				this.setState(() => ({ hasWallet: true }));
				//this.setState(() => ({ posts: [{position: 'left', type: 'text', text: 'Write your message', date: new Date()}] }))
			}
		});
	}

	componentWillUnmount() {
		
	}

	handleInputMessage(event) {
		this.setState({inputMessssage: event.target.value});
	}

	handleIncommingMessage(message) {
		let posts = this.state.posts;
		let postsAmount = posts.length + 1;
		posts = this.state.posts.slice();
		posts.push({position: 'left', type: 'text', text: message, date: new Date(), 'id': postsAmount});
		this.setState({ posts: posts });
	}

	sendMessage() {
		let posts = this.state.posts;
		let postsAmount = posts.length + 1;
		let inputMessssage = this.state.inputMessssage;
		this.socket.send(inputMessssage);
		posts = this.state.posts.slice();
		posts.push({position: 'right', type: 'text', text: inputMessssage, date: new Date(), 'id': postsAmount});
		this.setState({ posts: posts });
		this.setState({postsAmount: postsAmount});
		this.setState({inputMessssage: ''});
	}


  render() {
  	//let walletData = this.passTheInfo;
    return (
		<Paper style={styles.paper} zDepth={3} >
			<div style={styles.paper_content}>
				<h3 className="frente">Create a message</h3>
				<Divider /><br/>
				{!this.state.hasWallet && <p style={styles.prompt}>Please create or recover your wallet first</p>}
				{this.state.hasWallet && <p>Connected: {this.state.connected.toString()}, {this.state.remoteAddress}</p>}
				{this.state.hasWallet && <Input ref="inputMessssage" type="text" label="Your message" value={this.state.inputMessssage} onChange={this.handleInputMessage} required={false} />}
				{this.state.hasWallet && <Button type="submit" onClick={() => this.sendMessage()} color="primary" variant="raised">Submit</Button>}
				<p>{this.state.message}{this.state.errorMessage}</p>
				<div style={styles.paper_chat}>
					{this.state.connected && <MessageList
						className='message-list'
						lockable={true}
						toBottomHeight={'100%'}
						dataSource={this.state.posts} 
					/>}
				</div>
				<p></p>
			</div>
		</Paper>

    );
  }
};

export default MessagingForm;