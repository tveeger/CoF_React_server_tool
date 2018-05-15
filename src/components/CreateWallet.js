import React from 'react';
import ethers from 'ethers';
import AsyncStorage from '@callstack/async-storage';
import Button from 'muicss/lib/react/button';
import Divider from 'muicss/lib/react/divider';
import Paper from 'material-ui/Paper';
import {redA400} from 'material-ui/styles/colors';

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
};

class CreateWalletForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			mnemonicList: [],
			mnemonicArray: '',
			mnemonic: '',
			submitMessage: '',
			walletAddress: '',
			mnemonicCreated: false,
			walletSaved: false,
			isBusy: false,
			savedMnemonic: '',
			message: '',
			hasWallet: false,
		};
	}

	componentWillMount() {
		var self = this;
		self.getMnemonic();
	}

	componentWillUnmount() {
		this.setState({mnemonicList: ''});	
		this.setState({mnemonicCreated: false});
		this.setState({walletSaved: false});
	}

	getMnemonic = async () => {
		try {
			let mnemonic = await AsyncStorage.getItem('mnemonic');
			if (mnemonic !== null){
				this.setState({savedMnemonic: mnemonic});
			}
		}
		catch(error) {
			this.setState({message: 'Error: ' + error});
		}
	}

	createMnemonic() {
		let newMnemonic =  ethers.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16));
		this.setState({ 'mnemonic': newMnemonic });

		let mnemonicArray = newMnemonic.replace(/ /g, ',').split(',');
		this.setState({mnemonicList: mnemonicArray});
		this.setState({mnemonicCreated: true});
	}

	saveMnemonicWallet() {
		//self = this;
		let wallet = '';
		this.setState({isBusy: true});
		let newMnemonic =  this.state.mnemonic;
		let isValidMnemonic = ethers.HDNode.isValidMnemonic(newMnemonic);
		
		if (isValidMnemonic) {
			const daNetwork = ethers.providers.networks.rinkeby;
			const etherscanApiKey = "I1SAN6UTWZ644VM5X3GHEVWG1RD9ADFAHV";
			let etherscanProvider = new ethers.providers.EtherscanProvider(daNetwork, etherscanApiKey);
			wallet = ethers.Wallet.fromMnemonic(newMnemonic);
			wallet.provider = etherscanProvider;
			//AsyncStorage.setItem('mnemonic', newMnemonic);
			AsyncStorage.setItem('walletAddress', wallet.address);
			AsyncStorage.setItem('walletPk', wallet.privateKey);
			this.setState({walletAddress: wallet.address});
			this.setState({walletSaved: true});
			this.setState({isBusy: false});
		} else {
			this.setState({message: "Could not save " + newMnemonic});
		}
	}

  render() {
  	//let walletData = this.passTheInfo;
    return (
		<Paper style={styles.paper} zDepth={3} >
			<div style={styles.paper_content}>
				<h3 className="frente">Create a wallet</h3>
				<Divider /><br/>
				<p>The mnemonic will be created, after you press the button below. This is the passphrase of your new wallet.</p>
				{!this.state.walletSaved && <Button type="bubmit" onClick={() => this.createMnemonic()} color="primary" variant="raised">Create Wallet</Button>}
				{this.state.mnemonicCreated && <p style={styles.warningText}>!!! Note: This mnemonic will only be shown once. Wite it down and keep it on a safe place!</p>}
				{this.state.mnemonicCreated && <div style={styles.mnemonicBox}><p style={styles.mnemonicText}>{this.state.mnemonic}</p></div>}
				{this.state.mnemonicCreated && <Button type="button" onClick={() => this.saveMnemonicWallet()} color="primary" variant="raised">Save new Wallet</Button>}
				{this.state.isBusy && <p>Just a minute. Your transaction is being mined</p>}
				<p>{this.state.message}<br/>WalletAddress: {this.state.walletAddress}</p>
			</div>
		</Paper>

    );
  }
};

export default CreateWalletForm;