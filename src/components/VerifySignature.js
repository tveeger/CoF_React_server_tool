import React from 'react';
import ethers from 'ethers';
import AsyncStorage from '@callstack/async-storage';
import socketIOClient from 'socket.io-client';
//import metacoin_artifacts from '../contracts/EntboxContract.json';
import Paper from 'material-ui/Paper';
//import ReportProblem from 'material-ui/svg-icons/action/report-problem';
//import Forward from 'material-ui/svg-icons/content/forward';
import Input from 'muicss/lib/react/input';
import Textarea from 'muicss/lib/react/textarea';
import Button from 'muicss/lib/react/button';

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
	logoSpace: {
		textAlign: 'center',
	},
	prompt: {
		color: '#BCB3A2'
	},
};

class VerifySignature extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			endpoint: "http://45.32.186.169:28475",
			socketId: '',
			incomingMessage: null,
			posts: [],
			message: '',
			signature: null,
			approvedSignature: false,
			recoveredAddress: '',
			inputSignature: '',
			inputSubmitCode: '',
			hasPosts: false,
		}
		this.cofSocket = socketIOClient(this.state.endpoint + "/acquire");
		
		this.componentWillMount = this.componentWillMount.bind(this);
		this.verifySignature = this.verifySignature.bind(this);
		this.handleSignature = this.handleSignature.bind(this);
		this.handleSubmitCode = this.handleSubmitCode.bind(this);
	}

	componentWillMount() {
		var self = this;
		self.cofSocket.on('connect', function() { 
			self.setState({socketId: self.cofSocket.id});
		});
		self.cofSocket.on('message', function(message) { self.incomingMessage(message) } );
		AsyncStorage.getItem("acquirePosts").then(acquirePosts => {
			if (acquirePosts) {
				this.setState(() => ({ posts: JSON.parse(acquirePosts) }));
				this.setState(() => ({ hasPosts: true }));
			}
		})
	}

	incomingMessage(msg) {
		this.setState({incomingMessage: msg});
		let posts = this.state.posts;
		posts = this.state.posts.slice();
		posts.push(msg);
		AsyncStorage.setItem('acquirePosts', JSON.stringify(posts))
		.then(() => { 
			this.setState({ posts: posts });
		})
		
	}

	verifySignature = async () => {
		let signature = JSON.parse(this.state.inputSignature);
		const SigningKey = ethers._SigningKey;
		let message = this.state.inputSubmitCode;
		let messageBytes = ethers.utils.toUtf8Bytes(message);
		let messageDigest = ethers.utils.keccak256(messageBytes);
		let recovered = ethers.SigningKey.recover(messageDigest, signature.r,
                    signature.s, signature.recoveryParam); //ethers v 3.0
		
		if (recovered !== '' && recovered !== null) {
			this.setState({recoveredAddress: recovered});
			this.setState({approvedSignature: true});
		} else {
			this.setState({recoveredAddress: 'No address found'});
		}
	}

	handleSubmitCode(e) {
		e.preventDefault();
		this.setState({inputSubmitCode: e.target.value});
	}

	handleSignature(e) {
		e.preventDefault();
		this.setState({inputSignature: e.target.value});
	}

	render() {
		return (
			<Paper style={styles.paper} zDepth={3} >
				<div style={styles.paper_content}>
					<h3 className="frente">Verify signature and DET acquire submit code</h3>
					<br/>
					<div style={styles.prompt}>Chat-ID: {this.state.socketId}</div>
					<Input
						style={styles.input}
						placeholder = "submit code"
						onChange={this.handleSubmitCode}
					/>
					<Textarea
						style={styles.input}
						placeholder = "Signature"
						onChange={this.handleSignature}
					/>
					<Button type="submit" onClick={() => this.verifySignature()} color="primary" variant="raised">Recover</Button>
					<br/><br/>
					<div style={styles.prompt}>Recovered address:</div>
					<div> {this.state.recoveredAddress}</div>
					<p>{this.state.message} </p>
					{this.state.signature !== null && <p style={styles.prompt}>{JSON.stringify(this.state.signature)}</p>}
					<p>{this.state.incomingMessage}</p>
					<p style={styles.prompt}>{JSON.stringify(this.state.posts)} </p>
				</div>
			</Paper>
		)
	}
}

export default VerifySignature