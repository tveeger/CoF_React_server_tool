import React from 'react';
import ethers from 'ethers';
import NodeRSA from 'node-rsa'; //https://www.npmjs.com/package/node-rsa
import AsyncStorage from '@callstack/async-storage';
import DecryptRsa from './DecryptRsa.js';
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
};

class CreateRsa extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			submitMessage: '',
			walletAddress: '',
			message: '',
			hasWallet: false,
			hasSigningKey: false,
			isBusy: false,
			key: null,
			publicKey: '',
			privateKey: '',
			encryptedMessage: '',
			decryptedMessage: '',
		};
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
		this.setState({hasSigningKey: false});
		
	}

	createNewPublicKey = async () => {
		try {
			const key = new NodeRSA()
			key.generateKeyPair(2048, 65537);
			//const key = new NodeRSA({b: 512});
			if(!key.isEmpty()) {
				//key.generateKeyPair(4096); //4096
				//key.setOptions({encryptionScheme: 'pkcs1'}); //https://stackoverflow.com/questions/33837617/node-rsa-errors-when-trying-to-decrypt-message-with-private-key
				let maxKeySize = key.getMaxMessageSize(); //512: 22 bytes
				const publicKey = key.exportKey('pkcs8-public-pem');
				this.setState({publicKey: publicKey});
				const privateKey = key.exportKey('pkcs8-private-pem');
				this.setState({privateKey: privateKey});
			}
		}
		catch(error) {
			this.setState({message: error});
		}
	}

  render() {
  	//let walletData = this.passTheInfo;
    return (
		<Paper style={styles.paper} zDepth={3} >
			<DecryptRsa/>
			<div style={styles.paper_content}>
				<h3 className="frente">Create RSA PublicKey</h3>
				<p>{this.state.message}</p>
				{this.state.hasWallet && <p style={styles.prompt}>Here you can create a new Key pair</p>}			
				{!this.state.hasWallet && <p style={styles.prompt}>Please create or recover your address first</p>}
				{this.state.hasWallet && <Button type="submit" onClick={() => this.createNewPublicKey()} color="primary" variant="raised">Create New Key Pair</Button>}
				{this.state.isBusy && <p>Just a sec... We are recovering the wallet info.</p>}
				{this.state.hasSigningKey && <p>Public Key: {this.state.publicKey}</p>}
				{this.state.hasSigningKey && <p style={styles.prompt}>Private Key: {this.state.privateKey}</p>}
			</div>
		</Paper>

    );
  }
};

export default CreateRsa;