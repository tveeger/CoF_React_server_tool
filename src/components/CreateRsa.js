import React from 'react';
import ethers from 'ethers';
//import NodeRSA from 'node-rsa'; //https://www.npmjs.com/package/node-rsa
import AsyncStorage from '@callstack/async-storage';

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
	}
};

class CreateRsa extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			submitMessage: '',
			walletAddress: '',
			walletObject: null,
			signingKeyAddress: '',
			message: '',
			hasWallet: false,
			hasSigningKey: false,
			isBusy: false,
			publicKey: '',
			signature: null,
			signingKey: '',
			verifyAddress: '',
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

		AsyncStorage.getItem("walletObject").then(walletObject => {
			if (walletObject) {
				this.setState(() => ({ walletObject: walletObject }));
				this.getWalletInfo();
			}
		});
		
	}

	componentWillUnmount() {
		this.setState({hasSigningKey: false});
		
	}

	getWalletInfo = async () => {
		try {
			const self = this;
			

			
		}
		catch(error) {
			this.setState({message: error});
		}
	}

	createPublicKey = async () => {
		try {
			const self = this;
			const key = new NodeRSA({b: 512});
			const text = 'Hello RSA!';
			const encrypted = key.encrypt(text, 'base64');
			this.setState({hasSigningKey: true});
			console.log('encrypted: ', encrypted);
			this.setState({encryptedMessage: encrypted});
			const decrypted = key.decrypt(encrypted, 'utf8');
			//console.log('decrypted: ', decrypted);
			this.setState({decryptedMessage: decrypted});
		}
		catch(error) {
			this.setState({message: error});
		}
	}

	submitCreate = () => {
		try {
			const self = this;

		}
		catch(error) {

		}
	}

	passTheWalletAddress = () => {
		try {
			this.props.callbackFromParent(this.state.walletAddress);

		}
		catch(error) {

		}
	}

	passTheRoute = () => {
		try {
			this.props.callbackFromParent2(4);
		}
		catch(error) {

		}
	}

  render() {
  	//let walletData = this.passTheInfo;
    return (
		<Paper style={styles.paper} zDepth={3} >
			<div style={styles.paper_content}>
				<h3 className="frente">Create RSA PublicKey</h3>
				<br/>
				<p>{this.state.message}</p>
				<p style={styles.prompt}>Here you can create a new Key pair</p>				
				{!this.state.hasWallet && <p>Please create or recover your address first</p>}
				{this.state.hasWallet && <Button type="submit" onClick={() => this.createPublicKey()} color="primary" variant="raised">Create New Key Pair</Button>}
				<br/>
				{this.state.isBusy && <p>Just a sec... We are recovering the wallet info.</p>}
				{this.state.hasSigningKey && <p>SigningKey Address: {this.state.signingKey.address}</p>}
				{this.state.hasSigningKey && <p>Public Key: {this.state.publicKey}</p>}
				{this.state.hasSigningKey && <p>Verification: {this.state.verifyAddress}</p>}
			</div>
		</Paper>

    );
  }
};

export default CreateRsa;