import React from 'react';
import ethers from 'ethers';
import { encryptRSA, decryptRSA } from '@anvilco/encryption'; //https://www.npmjs.com/package/@anvilco/encryption
import AsyncStorage from '@callstack/async-storage';
import Textarea from 'muicss/lib/react/textarea';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';
import Paper from 'material-ui/Paper';

let wallet = '';

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
	prompt: {
		color: '#2D4866'
	},
	header: {
		color: '#BCB3A2'
	},
	prompt: {
		color: '#BCB3A2'
	},
	alarm_text: {
		color: 'red'
	}
};

class DecryptRsa extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			submitMessage: '',
			walletAddress: '',
			message: '',
			errorMessage: '',
			hasWallet: false,
			isBusy: false,
			key: null,
			publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnSphR0n/zCyljDa22th2w0GB/dn51YeXeN9ASftkdflnx3X8H3+M8NowsstckdSw8UbbyE4YRtsKckG4fYwbynjUO1WjFRpTlcXCELHdhQI7PJefFA1kQasPmLvR1nEO3AULdBLP+Ow//OmO7xuxBcg8WwdevFHmYQH6B5V009TKMJWP2wMNxTDdTdrj17Eq5VpSKSEUe/1SQRxOj8vZqE4/emJI9xuVfugsf0HePxbu2cSsF2QOQpU7+LQ96KPKq3KcfaskFffpI8tUinOB9erNcnBZ9VIPdJxIJpwK1fPsvkh09oW0g0z3/ENsUsjMHm/f/MNBrYmf28DsMIgrDQIDAQAB\n-----END PUBLIC KEY-----',
			hasPublicKey: false,
			privateKey: '',
			hasPrivateKey: true,
			inputMessage: '',
			encryptedMessage: '',
			decryptedMessage: '',
			inputMessage: '', 
		};
		this.handlePublicKey = this.handlePublicKey.bind(this);
		this.handlePrivateKey = this.handlePrivateKey.bind(this);
		this.handlePlainText = this.handlePlainText.bind(this);
		this.handleEncryptedText = this.handleEncryptedText.bind(this);
		this.encryptMessage = this.encryptMessage.bind(this);
		this.decryptMessage = this.decryptMessage.bind(this);
	}

	componentWillMount() {
		AsyncStorage.getItem("walletAddress").then(walletAddress => {
			if (walletAddress) {
				this.setState(() => ({ walletAddress: walletAddress }));
				this.setState(() => ({ hasWallet: true }));
			}
		});
	}

	componentWillUnmount() {
		
	}

	handlePublicKey(e) {
		e.preventDefault();
		this.setState({publicKey: e.target.value});
		this.setState({hasPublicKey: true});
	}

	handlePlainText(e) {
		e.preventDefault();
		this.setState({inputMessage: e.target.value});
	}

	handlePrivateKey(e) {
		e.preventDefault();
		this.setState({privateKey: e.target.value});
		this.setState({hasPrivateKey: true});
	}

	handleEncryptedText(e) {
		e.preventDefault();
		this.setState({encryptMessage: e.target.value});
	}

	encryptMessage = async () => {
		try {
			let inputMessage = this.state.inputMessage;
			let publicKey = this.state.publicKey;
			let encryptedMessage = encryptRSA(publicKey, inputMessage);
			this.setState({encryptedMessage: encryptedMessage});
		}
		catch(error) {
			this.setState({errorMessage: 'encrypt message: ' + error}); //TypeError: unknown key type
		}
	}

	decryptMessage = async () => {
		try {
			//error: Unknown key type: PRIVATE... (maar niet als private key hard coded in state.messages staat)
			let encryptedMessage = this.state.encryptedMessage;
			let privateKey = this.state.privateKey;
			let decryptedMessage = decryptRSA(privateKey, encryptedMessage);
			this.setState({decryptedMessage: decryptedMessage});
		}
		catch(error) {
			this.setState({errorMessage: 'decrypt message: ' + error});
		}
	}

  render() {
  	//let walletData = this.passTheInfo;
    return (
		<div>
			<h3 className="frente">Encrypt / Decrypt Message</h3>
			<br/>
			{this.state.hasWallet && <p style={styles.prompt}>Decrypt a RSA encrypted text here</p>}			
			{!this.state.hasWallet && <p style={styles.prompt}>Please create or recover your address first</p>}
			
			{this.state.hasWallet && <Textarea
				style={styles.input}
				placeholder = "Your text"
				onChange={this.handlePlainText}
			/>}

			{this.state.hasWallet && <Textarea
				style={styles.input}
				placeholder = "public key"
				value={this.state.publicKey}
			/>}
			
			{this.state.hasWallet && <Button type="submit" onClick={() => this.encryptMessage()} color="primary" variant="raised">Encrypt</Button>}
			
			<br/>
			<p style={styles.prompt}>{this.state.encryptedMessage}</p>
			<br/>

			{this.state.hasWallet && <Textarea
				style={styles.input}
				placeholder = "Encrypted text"
				onChange={this.handleEncryptedText}
			/>}

			{this.state.hasWallet && <Textarea
				style={styles.input}
				placeholder = "Your private key"
				onChange={this.handlePrivateKey}
			/>}

			{this.state.hasWallet && <p style={styles.prompt}>Private Key available: {this.state.hasPrivateKey.toString()}</p>}
			
			{this.state.hasWallet && <Button type="submit" onClick={() => this.decryptMessage()} color="primary" variant="raised">Decrypt</Button>}
			<br/>
			<p>{this.state.message}</p>
			<p>{this.state.decryptedMessage}</p>
			<p style={styles.alarm_text}>{this.state.errorMessage.toString()}</p>
			{this.state.isBusy && <p style={styles.prompt}>Just a sec... We are recovering the wallet info.</p>}
		</div>
    );
  }
};

export default DecryptRsa;