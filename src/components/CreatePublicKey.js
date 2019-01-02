import React from 'react';
import ethers from 'ethers';
//import {Crypt, keyManager, RSA} from 'hybrid-crypto-js';
import VerifySignature from './VerifySignature.js';
//import VerifySignature from './EthersSigningKey.js';
import AsyncStorage from '@callstack/async-storage';
import Button from 'muicss/lib/react/button';
import Paper from 'material-ui/Paper';


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
		color: '#BCB3A2'
	},
	header: {
		color: '#2D4866'
	}
};

class CreatePublicKey extends React.Component {
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
				this.getSigningKey();
			}
		});
		
		
	}

	componentWillUnmount() {
		this.setState({hasSigningKey: false});
		
	}

	getSigningKey = async () => {
		try {
			const self = this;
			AsyncStorage.getItem("signingKey").then(signingKey => {
			if (signingKey) {
				self.setState(() => ({ signingKey: signingKey }));                                                                                           
				}
			});
		}
		catch(error) {
			this.setState({message: error});
		}
	}

	createPublicKey = async () => {
		try {
			const self = this;
			const walletObj = JSON.parse(self.state.walletObject);
			const wprivateKey = walletObj.privateKey;
			const SigningKey = ethers._SigningKey;
			const signingKey = new ethers.SigningKey(wprivateKey);
			this.setState({signingKey: signingKey});
			this.setState({hasSigningKey: true});
			const publicKey = signingKey.publicKey;
			this.setState({publicKey: publicKey});
			AsyncStorage.setItem('signingKey', JSON.stringify(signingKey));		
		}
		catch(error) {
			this.setState({message: error});
		}
	}

	verifyAddress = () => {
		try {
			const self = this;
			let publicKey = self.state.publicKey;
			let verifyAddress = ethers.SigningKey.publicKeyToAddress(publicKey);
			self.setState({verifyAddress: verifyAddress});
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
				<h3 className="frente">Create Ethers.js Public Key</h3>
				<br/>
				<p>{this.state.message}</p>
				<p style={styles.header}>Here you can create a new Key pair</p>				
				{!this.state.hasWallet && <p style={styles.prompt}>Please create or recover your address first</p>}
				{this.state.hasWallet && <Button type="submit" onClick={() => this.createPublicKey()} color="primary" variant="raised">Create New Key Pair</Button>}
				<br/>
				{this.state.isBusy && <p>Just a sec... We are recovering the wallet info.</p>}
				{this.state.hasSigningKey && <p>Public Key: {this.state.publicKey}</p>}
				<br/>
				{this.state.hasSigningKey && <h3 className="frente">Verify address</h3>}
				<br/>
				{this.state.hasSigningKey && <p style={styles.prompt}>Verify the address of the signature</p>}
				{this.state.hasSigningKey && <Button type="submit" onClick={() => this.verifyAddress()} color="primary" variant="raised">Verify</Button>}
				{this.state.hasSigningKey && <p style={styles.prompt}>Verification: {this.state.verifyAddress}</p>}
			</div>
			<VerifySignature/>
		</Paper>

    );
  }
};

export default CreatePublicKey;