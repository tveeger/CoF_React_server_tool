import React from 'react';
import ethers from 'ethers';
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

class RecoverWalletForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			submitMessage: '',
			walletAddress: '',
			message: '',
			hasWallet: false,
			walletSaved: false,
			isBusy: false,
			etherscanLink: '',
		};
		this.wallet = null;
	}

	componentWillMount() {
		AsyncStorage.getItem("walletAddress").then(walletAddress => {
			if (walletAddress) {
				this.setState(() => ({ walletAddress: walletAddress }));
				this.setState(() => ({ hasWallet: true }));
			}
		})
	}

	componentWillUnmount() {
		this.setState({walletSaved: false});
		//this.passTheInfo();
	}

	unconnect() {
		AsyncStorage.removeItem('walletAddress')
		.then(() => { 
			this.setState({walletAddress: ''});
			this.setState({message: "Your wallet has been deleted but still exists on the blockchain. You can recover your wllet by entering your mnemonic here"});
			this.setState({hasWallet: false});
		})
	}

	/*generateEthersSignature = async (privateKey) => {
		let hasSigningKey = this.state.signingKey;
		const SigningKey = ethers._SigningKey;
		let signingKey = new ethers.SigningKey(privateKey);
		let message = 'Chains of Freedom';
		let messageBytes = ethers.utils.toUtf8Bytes(message);
		let messageDigest = ethers.utils.keccak256(messageBytes);
		let signature = signingKey.signDigest(messageDigest);
		AsyncStorage.setItem('myEthersSignature', JSON.stringify(signature));
		this.setState({signatureSaved: true});
	}*/

	submitMnemonic(ev) {
		//ev.preventDefault();
		let thisMnemonic = this.input.controlEl.value;
		const daNetwork = ethers.providers.networks.rinkeby;
		const etherscanApiKey = "I1SAN6UTWZ644VM5X3GHEVWG1RD9ADFAHV";
		let etherscanProvider = new ethers.providers.EtherscanProvider(daNetwork, etherscanApiKey);
		this.setState({isBusy: true});

		let isValidMnemonic = ethers.HDNode.isValidMnemonic(thisMnemonic);
		
		if (isValidMnemonic) {
			
			wallet = ethers.Wallet.fromMnemonic(thisMnemonic);
			wallet.provider = etherscanProvider;
			let walletObject = {
				address: wallet.address,
				privateKey: wallet.privateKey,
				provider: wallet.provider
			}
			this.setState({walletAddress: wallet.address});

			AsyncStorage.setItem('walletAddress', wallet.address)
			.then(() => { 
				this.setState({isBusy: false});
			})
			.catch(() => { this.setState({message: "Something went wrong!!!"});});

			AsyncStorage.setItem('walletObject', JSON.stringify(walletObject))
			.then(() => { 
				this.setState({walletSaved: true});
				this.setState({etherscanLink: "https://rinkeby.etherscan.io/address/" + walletObject.address});
				this.passTheWalletAddress();
			})
			.then(() => {
				this.input.controlEl.value = '';
			});
			
		} else {
			this.setState({message: "Invalid mnemonic"});
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
				<h3 className="frente">Recover your excisting wallet or create a new one</h3>
				<br/>
				{this.state.hasWallet && <p style={styles.prompt}>Current wallet address: {this.state.walletAddress}</p>}
				<p style={styles.prompt}>Enter your mnemonic  in the field below.</p>				
				<Input
					style={styles.input}
					placeholder = "Your 12 word mnemonic phrase, separated with a space"
					ref={el => { this.input = el; }}
				/>
				<Button type="submit" onClick={() => this.submitMnemonic(this.el)} color="primary" variant="raised">Recover</Button>			
				<Button type="button" onClick={() => this.unconnect(this.el)} color="primary" variant="raised">Clear</Button>
				<br/><Button type="button" onClick={() => this.passTheRoute()} color="accent" variant="flat">Create New Wallet</Button>
				{this.state.isBusy && <p>Just a sec... We are recovering the wallet info.</p>}
				<p>{this.state.message}</p>
				{this.state.walletSaved && <p style={styles.prompt}>Current wallet address:  <a href={this.state.etherscanLink} target='_new'>{this.state.walletAddress}</a> (link to Etherscan.io)</p>}
			</div>
		</Paper>

    );
  }
};

export default RecoverWalletForm;