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
		ethAmount: '0.00001',
		message: '',
		incoming: '',
		hasWallet: false,
		isTransferSuccess: false,
		walletObject: '',
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
				self.getWalletInfo();
			}
		})
	}

	getWalletInfo = async () => {
		try {
			const self = this;
			const tokenAddress = "0x492b5F5Eb71c56df81A0E92DAC653d3f0Bdfb896";
			const daNetwork = ethers.providers.networks.rinkeby;
			const etherscanApiKey = "I1SAN6UTWZ644VM5X3GHEVWG1RD9ADFAHV";
			//const walletAddress = "0xdF1f27cfb692E7A6a34739eC276a0A965C425b9b";
			//self.setState({walletAddress: walletAddress});
			const walletAddress = self.state.walletAddress;
			self.setState({tokenAddress:tokenAddress});
			let etherscanProvider = new ethers.providers.EtherscanProvider(daNetwork, etherscanApiKey);
			self.setState({provider: etherscanProvider});
			
			const contract = new ethers.Contract(tokenAddress, metacoin_artifacts, etherscanProvider);
			contract.connect(etherscanProvider);

			if(contract !== '') {
				//balanceOf getDetsBalance
				contract.getDetsBalance(walletAddress).then(function(result){
					self.setState({tokenBalance: parseInt(result)});
				});
				//total DETs supply
				contract.totalSupply().then(function(result){
					self.setState({totalDetsSupply: result.toString()});
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
		//this.setState({message: privateKey});
		let wallet = new Wallet(privateKey);
		wallet.provider = this.state.provider;
		let ethAmount = this.state.ethAmount;
		let toAddress = this.state.recipient;
		let nonce = this.state.nonce;
		
		let transactionHash;
		const transaction = {
			nonce: ethers.utils.bigNumberify(nonce),
			gasLimit: ethers.utils.bigNumberify(21000),
			gasPrice: ethers.utils.bigNumberify("20000000000"),
			from: walletAddress,
			to: toAddress,
			value: ethers.utils.parseEther(ethAmount),
			data: "0x",
		};
		let signedTransaction = wallet.sign(transaction);
		let parsedTransaction = ethers.Wallet.parseTransaction(signedTransaction);
		this.setState({message: 'signed: ' + parsedTransaction});
		this.setState({isSigned: true});
		wallet.provider.sendTransaction(signedTransaction).then(function(hash) {
			transactionHash = hash;
			this.setState({message: "transaction has been send" + hash});
			this.setState({isSigned: false});
		});
		wallet.provider.waitForTransaction(transactionHash).then(function(transaction) {
			this.setState({message: 'Transaction Mined: ' + transaction.hash});
			this.setState({isTransferSuccess: true});
		});

	}
	
	render() {
		return (
			<Paper style={styles.paper} zDepth={3} >
				<div style={styles.paper_content}>
				<h3 className="frente">Send Ether</h3>
				<br/>
					<p></p>
					{this.state.hasWallet && <p>Balance: Ξ {this.state.ethBalance} (ETH), Network: {this.state.provider.name}</p>}
					<Form inline={false} onSubmit={this.handleSubmit}>
						{this.state.hasWallet && <Input ref="recipient" type="text" placeholder="42 character Ethereum address" label="Recipient" value={this.state.recipient} onChange={this.handleInputChangeRecipient} required={true} />}
						{this.state.hasWallet && <Input ref="detsAmount" type="text" label="Ether Amount" value={this.state.detsAmount} onChange={this.handleInputChangeEthAmount} required={true} />}<br/>
						{this.state.hasWallet && <Button type="submit" onClick={this.handleSubmit} color="primary" variant="raised">Submit</Button>}
					</Form>
					{this.state.isSigned && <p><Done/> signed transaction. Waiting for confirmation...</p>}
					{!this.state.hasWallet && <p><ReportProblem/> No wallet found</p>}
					{this.state.isTransferSuccess && <p>Transfer is successful</p>}
					<p>{this.state.message}</p>
				</div>
			</Paper>
		);
	}
};

export default SendEth