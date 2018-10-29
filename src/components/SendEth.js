import React, { Component } from 'react';
import ethers from 'ethers';
import AsyncStorage from '@callstack/async-storage';
import metacoin_artifacts from '../contracts/EntboxContract.json';
import Form from 'muicss/lib/react/form';
import Button from 'muicss/lib/react/button';
import Input from 'muicss/lib/react/input';
import Paper from 'material-ui/Paper';
import ReportProblem from 'material-ui/svg-icons/action/report-problem';
import Done from 'material-ui/svg-icons/action/done';
import ThumbUp from 'material-ui/svg-icons/action/thumb-up';
import {redA400} from 'material-ui/styles/colors';

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
	}
};

class SendEth extends Component {
	constructor(props) {
	super(props);

	this.state = {
		recipient: '0x37779Fb61a1d24bEE94Ca8fd2268Eb0ed72d9dB5',
		ethBalance: '0',
		tokenAddress: '0x492b5F5Eb71c56df81A0E92DAC653d3f0Bdfb896',
		tokenBalance: null,
		tokenCreatedStatusFromReceipt: true,
		totalDetsSupply: '0',
		ethAmount: '0.00001',
		apiKey: '',
		message: '',
		incoming: '',
		walletKey: '',
		hasWallet: false,
		isTransferSuccess: false,
		walletObject: null,
		provider: '',
	};

		this.handleInputChangeRecipient = this.handleInputChangeRecipient.bind(this);
		this.handleInputChangeEthAmount = this.handleInputChangeEthAmount.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		
	}

	componentWillMount() {
		var self = this;
		AsyncStorage.getItem("walletAddress").then(walletAddress => {
			if (walletAddress) {
				this.setState(() => ({ walletAddress: walletAddress }));
				this.setState(() => ({ hasWallet: true }));
			}
		});
		AsyncStorage.getItem("walletObject").then(walletObject => {
			if (walletObject) {
				this.setState(() => ({ walletObject: walletObject }));
				this.setState(() => ({ walletAddress: JSON.parse(walletObject).address }));
				this.setState(() => ({ apiKey: JSON.parse(walletObject).apiKey }));
				self.getWalletInfo();
			}
		})
	}

	componentWillUnmount() {
		this.setState({isSigned: false});
		this.setState({isTransferSuccess: false});
	}

	getWalletInfo = async () => {
		try {
			const self = this;
			const daNetwork = ethers.providers.networks.rinkeby;
			const etherscanApiKey = self.state.apiKey;
			const walletAddress = self.state.walletAddress;
			const tokenAddress = self.state.tokenAddress;
			let etherscanProvider = new ethers.providers.EtherscanProvider(daNetwork, etherscanApiKey);
			self.setState({provider: etherscanProvider});
			//this.setState({message: 'provider: ' + etherscanProvider.toString()});
			const contract = new ethers.Contract(tokenAddress, metacoin_artifacts, etherscanProvider);
			contract.connect(etherscanProvider);

			if(contract !== '') {
				//balanceOf getDetsBalance
				contract.getDetsBalance(walletAddress).then(function(result){
					self.setState({tokenBalance: parseInt(result, 10)});
				});
				//total DETs supply
				contract.totalSupply().then(function(result){
					self.setState({totalDetsSupply: result.toString()});
				});
				contract.getTokenCreatedStatusFromReceipt('test1').then(function(result){
					self.setState({tokenCreatedStatusFromReceipt: result});
				});
			}

			etherscanProvider.getBalance(walletAddress, 'latest').then(function(balance) {
				let etherAmount = ethers.utils.formatEther(balance);
				if (balance > 0) {
					self.setState({ethBalance: etherAmount.toString()});
				} else {
					self.setState({message: "Your balance is too low. Please send some Eths to this wallet account."});
					self.setState({ethBalance: etherAmount.toString()});
				}
			});

			let walletObj = JSON.parse(self.state.walletObject);
			const Wallet = ethers.Wallet;
			let wallet = new Wallet(walletObj.privateKey);
			wallet.provider = etherscanProvider;
			wallet.getTransactionCount('latest').then(function(count) {
				self.setState({nonce: count.toString()});
			});
		}
		catch(error) {
			this.setState({message: "Error: " + error});
		}
	}


	handleInputChangeRecipient(event) {
		this.setState({recipient: event.target.value});
	}

	handleInputChangeEthAmount(event) {
		let newEthAmount = event.target.value;
		this.setState({ethAmount: newEthAmount});
	}

	handleSubmit(e) {
		e.preventDefault();
		const Wallet = ethers.Wallet;
		const walletAddress = this.state.walletAddress;

		let walletObj = JSON.parse(this.state.walletObject);
		let privateKey = walletObj.privateKey;
		let wallet = new Wallet(privateKey);
		wallet.provider = this.state.provider;
		let ethAmount = this.state.ethAmount;
		let toAddress = this.state.recipient;
		let nonce = this.state.nonce;
		const provider = this.state.provider;
		
		let transactionHash;
		const transaction = {
			nonce: ethers.utils.bigNumberify(nonce),
			gasLimit: ethers.utils.bigNumberify(21000),
			gasPrice: ethers.utils.bigNumberify("20000000000"),
			//from: walletAddress,
			to: toAddress,
			value: ethers.utils.parseEther(ethAmount),
			data: "0x",
		};
		let signedTransaction = wallet.sign(transaction);
		this.setState({message: 'stage-1, signed OK ' + signedTransaction});
		this.setState({isSigned: true});
		provider.sendTransaction(signedTransaction).then(function(hash) {
			transactionHash = hash;
			this.setState({message: 'stage-2, send transaction: ' + hash});
		});
		provider.waitForTransaction(transactionHash).then(function(transaction) {
			this.setState({message: "state=3, transaction has been send" + transaction.hash.toString()});
			this.setState({isSigned: false});
			this.setState({isTransferSuccess: true});
			this.getWalletInfo();
		});
	}
	
	render() {
		return (
			<Paper style={styles.paper} zDepth={3} >
				<div style={styles.paper_content}>
					<h3 className="frente">Send Ether</h3>
					<br/>
					<p></p>
					{!this.state.hasWallet && <p><ReportProblem color={redA400}/> No wallet found</p>}
					{this.state.hasWallet && <p>Balance: Ξ {this.state.ethBalance} (ETH){this.state.tokenBalance}, Network: {this.state.provider.name}, Nonce: {this.state.nonce}</p>}
					<Form inline={false} onSubmit={this.handleSubmit}>
						{this.state.hasWallet && <Input ref="recipient" type="text" placeholder="42 character Ethereum address" label="Recipient" value={this.state.recipient} onChange={this.handleInputChangeRecipient} required={true} />}
						{this.state.hasWallet && <Input ref="detsAmount" type="text" label="Ether Amount" value={this.state.detsAmount} onChange={this.handleInputChangeEthAmount} required={true} />}<br/>
						{this.state.hasWallet && <Button type="submit" onClick={this.handleSubmit} color="primary" variant="raised">Submit</Button>}
					</Form>
					{this.state.isSigned && <p><Done/> Signed: {this.state.isSigned.toString()}. Waiting for confirmation...</p>}					
					{this.state.isTransferSuccess && <p><ThumbUp/> Transaction send: {this.state.isTransferSuccess.toString()} Transfer is successful</p>}
					<p>{this.state.message}</p>
				</div>
			</Paper>
		);
	}
};

export default SendEth