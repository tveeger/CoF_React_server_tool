import React from 'react';
import ethers from 'ethers';
import AsyncStorage from '@callstack/async-storage';
import metacoin_artifacts from '../contracts/EntboxContract.json';
import Paper from 'material-ui/Paper';
import LogoImage from '../img/logo_dblue_transp_304x170.png';
import ReportProblem from 'material-ui/svg-icons/action/report-problem';
import Forward from 'material-ui/svg-icons/content/forward';
import {redA400} from 'material-ui/styles/colors';
import {blueGrey200} from 'material-ui/styles/colors';

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

class TokenInfo extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			message: '',
			symbol: '',
			tokenId: '4a4fbcf3',
			tokenAddress: '',
			tokenName: '',
			tokenSymbol: '',
			tokenDecimals: '',
			tokenVersion: '',
			tokenBalance: 0,
			totalDetsAmount: '',
			totalDetsSupply: '',
			web3: null,
			showHome: true,
			walletAddress: '',
			hasWallet: false,
			etherscanLink: '',
		}
		this.componentWillMount = this.componentWillMount.bind(this);
		this.getWalletInfo = this.getWalletInfo.bind(this);
	}

	componentWillMount() {
		var self = this;
		AsyncStorage.getItem("walletAddress").then(walletAddress => {
			if (walletAddress) {
				this.setState(() => ({walletAddress: walletAddress}));
				this.setState(() => ({etherscanLink: "https://rinkeby.etherscan.io/address/" + walletAddress}))
				this.setState(() => ({hasWallet: true}))
				self.getWalletInfo();
			} else {this.setState({hasWallet: false});}
		})
		.catch(() => { this.setState(() => ({message: "Something went wrong!!!"})); });
		//self.getWalletInfo();
	}

	getWalletInfo = async () => {
		try {
			const self = this;
			const tokenAddress = "0x492b5F5Eb71c56df81A0E92DAC653d3f0Bdfb896";
			const daNetwork = ethers.providers.networks.rinkeby;
			const etherscanApiKey = "I1SAN6UTWZ644VM5X3GHEVWG1RD9ADFAHV";
			self.setState({tokenAddress:tokenAddress});
			let etherscanProvider = new ethers.providers.EtherscanProvider(daNetwork, etherscanApiKey);
			
			const contract = new ethers.Contract(tokenAddress, metacoin_artifacts, etherscanProvider);
			contract.connect(etherscanProvider);
		
			if(contract !== null) {
				//name
				contract.name().then(function(result){
					self.setState({tokenName: result});
				});
				//symbol
				contract.symbol().then(function(result){
					self.setState({tokenSymbol: result});
				});
				//decimals
				contract.decimals().then(function(result){
					self.setState({tokenDecimals: result.toString()});
				});
				//version
				contract.version().then(function(result){
					self.setState({tokenVersion: result});
				});
				//my total amount
				contract.getTotalDetsAmount().then(function(result){
					self.setState({totalDetsAmount: result.toString()});
				});
				//total DETs supply
				contract.totalSupply().then(function(result){
					self.setState({totalDetsSupply: result.toString()});
				});
				//DET balance
				contract.getDetsBalance(this.state.walletAddress).then(function(result){
					self.setState({tokenBalance: parseInt(result, 10)});
				});
			} else { self.setState({message: 'No contract info'}); }
		}
		catch(error) {
			this.setState({message: error});
		}
	}

	render() {
		return (
			<Paper style={styles.paper} zDepth={3} >
				<div style={styles.paper_content}>
					<div style={styles.logoSpace}><img src={LogoImage} alt="" /></div>
					<p></p>
					<br/>
					<h3 className="frente">Token Info</h3>
					<br/>
					{this.state.hasWallet && <p>Token: {this.state.tokenName}, {this.state.tokenAddress}</p>}
					{this.state.hasWallet && <p>Symbol:{this.state.tokenSymbol}, Version: {this.state.tokenVersion}, Decimals: {this.state.tokenDecimals}</p>}
					{this.state.hasWallet && <p>Total generated supply: {this.state.totalDetsSupply} DET</p>}
					{this.state.hasWallet && <p>Current total amount: {this.state.totalDetsAmount} DET</p>}
					{!this.state.hasWallet && <p><ReportProblem color={redA400}/> No wallet found. Please create or recover your wallet from the wallet menu item.</p>}
					{this.state.hasWallet && <p>Wallet: <a href={this.state.etherscanLink} target='_new'>{this.state.walletAddress}<Forward color={blueGrey200}/></a></p>}
					{this.state.hasWallet && <p>Your balance: {this.state.tokenBalance.toString()} DET</p>}
					<p></p>	
				</div>
			</Paper>
		)
	}
}

export default TokenInfo