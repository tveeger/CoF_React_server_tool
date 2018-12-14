import React from 'react';
import ethers from 'ethers';
import AsyncStorage from '@callstack/async-storage';
import metacoin_artifacts from '../contracts/EntboxContract.json';
import Paper from 'material-ui/Paper';
import ReportProblem from 'material-ui/svg-icons/action/report-problem';
import Forward from 'material-ui/svg-icons/content/forward';
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
	}
};

class VerifySignature extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			message: '',
			signature: null,
			approvedSignature: false,
			connected: false,
			recoveredAddress: '',
			inputMessage: '',
		}
		this.componentWillMount = this.componentWillMount.bind(this);
		this.verifySignature = this.verifySignature.bind(this);
		this.handleChange = this.handleChange.bind(this);

		//this.socket = new WebSocket('ws://45.32.186.169:28475'); //CoF website
		this.socket = new WebSocket('ws://127.0.0.1:28475/cof');	//test local
		//this.socket = new WebSocket('ws://echo.websocket.org'); //test
		this.socket.onopen = () => {
			this.setState({connected:true})
		};
		this.socket.onmessage = (e) => {
			//this.setState({incoming:e.data})
			this.handleIncommingSignature(e.data)
		};
		this.socket.onerror = (e) => {
			this.setState({errorMessage: e.message})
		};
		this.socket.onclose = (e) => {
			this.setState({connected:false})
		};
	}

	componentWillMount() {
		var self = this;
	}

	handleIncommingSignature(message) {
		if( (typeof message === "object") && (message !== null) )
			{
				let signature = JSON.parse(message);
				this.setState({ signature: signature });
			}
	}

	verifySignature = async () => {
		let signature = JSON.parse(this.state.inputMessage);
		const SigningKey = ethers._SigningKey;
		let message = 'hello world';
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

	handleChange(e) {
		e.preventDefault();
		this.setState({inputMessage: e.target.value});
	}

	render() {
		return (
			<Paper style={styles.paper} zDepth={3} >
				<div style={styles.paper_content}>
					<h3 className="frente">Verify sig signature sender</h3>
					<p>Connected: {this.state.connected.toString()}</p>
					<br/>
					<Textarea
						style={styles.input}
						placeholder = "Signature"
						onChange={this.handleChange}
					/>
					<Button type="submit" onClick={() => this.verifySignature()} color="primary" variant="raised">Recover</Button>
					{this.state.approvedSignature && <p>Recovered address: {this.state.recoveredAddress}</p>} 
					<p>{this.state.message}</p>
					{this.state.signature !== null && <p>{JSON.stringify(this.state.signature)}</p>}
				</div>
			</Paper>
		)
	}
}

export default VerifySignature