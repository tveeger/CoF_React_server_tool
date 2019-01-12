//https://www.npmjs.com/package/js-crypto-rsa
import React from 'react';
import ethers from 'ethers';
import { encryptRSA, decryptRSA } from '@anvilco/encryption'; //https://www.npmjs.com/package/@anvilco/encryption
import AsyncStorage from '@callstack/async-storage';
import socketIOClient from 'socket.io-client';
import Textarea from 'muicss/lib/react/textarea';
import Input from 'muicss/lib/react/input';
import Button from 'muicss/lib/react/button';
import Paper from 'material-ui/Paper';
import NodeRSA from 'node-rsa';
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
			endpoint: "http://45.32.186.169:28475",
			submitMessage: '',
			walletAddress: '',
			message: '',
			errorMessage: '',
			hasWallet: false,
			isBusy: false,
			key: null,
			publicKey: '-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAhlkuorhOUGY8NJl8BSU6HYGMgYBv9ulbhGdSn/ZxEWJ6JpOGMpYWYPo4fivXEw+opBVNgGOXr9pKa18ITyTwaMFpZbA1U0s3d3UWwivYtdIYLUvrsPBtFRUpPrLdlMnEvxWbI4rf8c/YHmZSlS8uQfSLW86+SzG7Wn7YC8yQRR84vp16aOtRHYXMFRde2Ytn1dfCf734wc2TLBcaXIUfrcFveq4ute8eVMbf7D9zCHsHUTyFuFiGpS8EadASBhwPBWDXXtXDLV3TzaQYqce3+A3pdHJI66u1bxphZvCjhRGOA7NGobtzupKuEOwJFzhmg6D6rQTifC85Be2FNnZrRwIDAQAB\n-----END RSA PUBLIC KEY-----',
			hasPublicKey: false,
			privateKey: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEAhlkuorhOUGY8NJl8BSU6HYGMgYBv9ulbhGdSn/ZxEWJ6JpOGMpYWYPo4fivXEw+opBVNgGOXr9pKa18ITyTwaMFpZbA1U0s3d3UWwivYtdIYLUvrsPBtFRUpPrLdlMnEvxWbI4rf8c/YHmZSlS8uQfSLW86+SzG7Wn7YC8yQRR84vp16aOtRHYXMFRde2Ytn1dfCf734wc2TLBcaXIUfrcFveq4ute8eVMbf7D9zCHsHUTyFuFiGpS8EadASBhwPBWDXXtXDLV3TzaQYqce3+A3pdHJI66u1bxphZvCjhRGOA7NGobtzupKuEOwJFzhmg6D6rQTifC85Be2FNnZrRwIDAQABAoIBAHI3vcs/T+1QjZzWZDbnqFnPesnajNXpHRIa2Yb/eK8j/t9vCmdVbF80O/UghnBBHsmpBsPBaANsXVqdZ64JpI4a6OU4Ao3244getqOLrWke3ckcw5shPEvxOqiAXpuRUkB2OPflqHCnmIB303vbqcMPCa+au/OnqzXLoxec6YapQjVhouW0C7/k+m3FNjbOmQLGErUfmm88n2ihY8hHemBVaEe9x+nTzbn0YyInjMRQRFSG0FEp3pn4HUvwHKwqHQmDXoFX60rNQpqvfgSF8CpvagUMneoF0p8gBa1X4QVEnM9yy1CzgUmoGhrI9Auo7nf6/Etz/mSSs4zZn1Z655ECgYEAu2dzNuNmyfmWsWjMg5OA/PikNjg/AJIz/vY81VvPTE+00Wj9HM55k6BszODCEssxpQTDPZt/6G41scAYc0XiXUcUYZKMZnaRdEfixQg9iU/jTjZZfBWyP/d9275dXJbMXfPA6jWgFgzRX/deJvNkBVHEZHsra0hPVBChwTytKZ8CgYEAt4Yv+5mXiwXrHVNF01H29JGM0wk0dJwX0+VG9pZiYkMFHJBNMD+99Jy8HoK46ess8K26XsTcxc2PakBrerpCBgLLN5stUW97daMDce2U1rMopHURpFANBRieY3DC9WqaZlRTeqvSW2YnqBPL/8p++Bs8S+pmwHPXQYBE/NDOLVkCgYB3mK2OedE/VGk3Dwp1bc0DpCon7/1FAAjuzXZFMzI4ISXj/nyJxbsQ23CTz1wLYmFsTn3K81HNo4fgyBbSeebcYGBBZKT1PvXUn4u48mlTGAiYAVdaOP5olCld8z7ht9r0mnqi/VYMvGFiPRt5ABr0yhnrhi9PZ/Y4T+TqzS41QQKBgQCH8PTf+MCBMUwcN8+0HbXBKYNX2yyo5+raga4UAAc2ZBCIPPeAMuchJ2xNaWVRmGt8iCNSCZ7DQmXmPXufuBIp463mLaLe/KZF2A84N9UVSDZlw3Xi8Y0DZl4EqMUxBtsBy5rediHmo//iB3AHtFZir8H1NdcQ3X3oPfxcDMt8WQKBgQC55TE76hIgL8SY8h9HzMawRj2sL1504E/JZkiRlrtT1c4iPSrIH/oFQ8qsvILEOUKFuJrYKL/Yx4BLMwBL3syncq4TkjvNy2PhuDWp73aBiLWTZUfvugI78WO/azbDDZIvQnQy85WgxHU/HPthOtAim9D4WbUnQodwpfzjm/SHMw==\n-----END RSA PRIVATE KEY-----',
			hasPrivateKey: false,
			keySize: 0,
			maxMessageSize: 0,
			inputMessage: '',
			encryptedMessage1: '',
			encryptedMessage: '',
			decryptedMessage: '',
			inputMessage: '', 
		};
		this.cofSocket = socketIOClient(this.state.endpoint + "/redeem");
		this.handlePublicKey = this.handlePublicKey.bind(this);
		this.handlePrivateKey = this.handlePrivateKey.bind(this);
		this.handlePlainText = this.handlePlainText.bind(this);
		this.handleEncryptedText = this.handleEncryptedText.bind(this);
		this.encryptMessage = this.encryptMessage.bind(this);
		this.decryptMessage = this.decryptMessage.bind(this);
		this.key = new NodeRSA(this.state.privateKey);
		this.key.setOptions({ encryptionScheme: 'pkcs1' });
	}

	componentWillMount() {
		AsyncStorage.getItem("walletAddress").then(walletAddress => {
			if (walletAddress) {
				this.setState(() => ({ walletAddress: walletAddress }));
				this.setState(() => ({ hasWallet: true }));
			}
		});
		var self = this;
		self.cofSocket.on('connect', function() { 
			self.setState({socketId: self.cofSocket.id});
		});
		self.cofSocket.on('message', function(message) { self.incomingMessage(message) } );
		self.setState({keySize: this.key.getKeySize()});
		self.setState({maxMessageSize: this.key.getMaxMessageSize()});
	}

	componentWillUnmount() {
		
	}

	incomingMessage(msg) {
		this.setState({encryptedMessage1: msg});
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
		this.setState({decryptedMessage: ''});
		this.setState({encryptedMessage: e.target.value});
	}

	encryptMessage = async () => {
		try {
			this.setState({errorMessage: ''});
			let inputMessage = this.state.inputMessage;
			let publicKey = this.state.publicKey;
			//let encryptedMessage = encryptRSA(publicKey, inputMessage);
			let encryptedMessage = this.key.encrypt(inputMessage, 'base64');
			this.setState({encryptedMessage1: encryptedMessage});
		}
		catch(error) {
			this.setState({errorMessage: 'encrypt message: ' + error}); //TypeError: unknown key type
		}
	}

	decryptMessage = async () => {
		try {
			//error: Unknown key type: PRIVATE... (maar niet als private key hard coded in state.messages staat)
			//padding: crypto.RSA_PKCS1_OAEP_PADDING,
			this.setState({errorMessage: ''});
			let encryptedMessage = this.state.encryptedMessage;
			let encryptedMessageC = "E9oA9hExUuzzHPVV6BaPIcRIR62PBqb4TPKAdE0EBAOjE6uoGhH2daJuZd8Da8kpRsCaJ83OlvpIoi2FbN1EnDZ1vLfj8y32sfGZOlK8W2Desj70tWVVijGFgjqhHQhLD0dvIElEBbHte1qXKmwEuYtki+RS9setCfHDzHOsZLgzKXMQZmD/fM6eEgy5slQul+4ia3ZnH3QxKSg/9t4AsoHKBFABYq5KpfWqzOYnvVEOjOSjMyYwF2TUmzCX2/QQL8uacYNiHmFrAqDeTlEgxkPY+smfOyKc4WLjGoPRGiL5wJB/grZfJmEYFZf9U/friOrxtwpg+Co0BRbwIbi9Bw==";
			let encryptedMessageS = "MnLtt93zAz0cnRPbSsm3tcndnIvwOGWybdDsFfL6OARlIjGXGBjXpT2jwrONQ9hrwQv/J1VahtsFNP1ZstlxybStQBlX2+zgZZC4SIUC+r1gEcYodPJHeZlhbfyzmITpMkDX0Z36AhGdA5nqANPGOiJtqLpTM1wX0xwpcxyrBR2RhAAL35bhrAXXXcAWhcni91ViM6USLfHCwTtu9zGC8eqXqOA3hF6WtHB0NQWl2H+UvWSnK6YSlfFToD5NpNiEbaZKKFoBT96rWwIou/f9XyTK+6SV79JCkThSvbWHrI98d8bFET1cSGknE+Eud8JDUgi+blURbCYSMx9aat5JCQ==";
			encryptedMessage = encryptedMessage.replace(/\s/g, '');
			let privateKey = this.state.privateKey;
			//let decryptedMessage = decryptRSA(privateKey, encryptedMessage);
			let decryptedMessage = this.key.decrypt(encryptedMessage, 'utf8');
			this.setState({decryptedMessage: decryptedMessage});
			this.setState({encryptedMessage: ''});
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
			<p style={styles.prompt}>{this.state.encryptedMessage1}</p>
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

			{this.state.hasWallet && <p style={styles.prompt}>Private Key available: {this.state.hasPrivateKey.toString()}, Key size: {this.state.keySize.toString()}, max. message size: {this.state.maxMessageSize}</p>}
			
			{this.state.hasWallet && <Button type="submit" onClick={() => this.decryptMessage()} color="primary" variant="raised">Decrypt</Button>}
			<br/>
			<p>{this.state.message}</p>
			<p>{this.state.decryptedMessage}</p>
			<p style={styles.alarm_text}>{this.state.errorMessage.toString()}</p>
			{this.state.isBusy && <p style={styles.prompt}>Just a sec... We are recovering the wallet info.</p>}
			<p></p>
		</div>
    );
  }
};

export default DecryptRsa;