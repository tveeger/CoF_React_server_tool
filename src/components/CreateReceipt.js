import React, { Component } from 'react';
import ethers from 'ethers';
import AsyncStorage from '@callstack/async-storage';
import metacoin_artifacts from '../contracts/EntboxContract.json';
import Form from 'muicss/lib/react/form';
import Button from 'muicss/lib/react/button';
import Input from 'muicss/lib/react/input';
import Paper from 'material-ui/Paper';
import FlightTakeoff from 'material-ui/svg-icons/action/flight-takeoff';
import Hourglass from 'material-ui/svg-icons/action/hourglass-empty';
import Receipt from 'material-ui/svg-icons/action/receipt';
import ReportProblem from 'material-ui/svg-icons/action/report-problem';
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
	},
	alarm_text: {
		color: 'red'
	}
};

class CreateReceipt extends Component {
	constructor(props) {
	super(props);

	this.state = {
		id: '', 
		tokenCreator: '0x37779Fb61a1d24bEE94Ca8fd2268Eb0ed72d9dB5',
		ethBalance: '0',
		detsAmount: 100,
		euroAmount: 1,
		message: '',
		tokenAddress: '',
		tokenBalance: 0,
		incoming: '',
		isSigned: false,
		hasWallet: false,
		isTransferSuccess: false,
		walletObject: '',
		nonce: '',
		test: '',
		hash: '',
	};
		
		this.handleInputChangeId = this.handleInputChangeId.bind(this);
		this.handleInputChangeTokenCreator = this.handleInputChangeTokenCreator.bind(this);
		this.handleInputChangeDetsAmount = this.handleInputChangeDetsAmount.bind(this);
		this.handleInputChangeEuroAmount = this.handleInputChangeEuroAmount.bind(this);
		this.handleStoreReceipt = this.handleStoreReceipt.bind(this);

		//this.socket = new WebSocket('ws://45.32.186.169:28475'); //chainsoffreedom.org
		//this.socket = new WebSocket('ws://127.0.0.1:28475');
		this.socket = new WebSocket('ws://echo.websocket.org'); //test
		this.socket.onopen = () => {
			this.setState({connected:true})
		};
		this.socket.onmessage = (e) => {
		    //console.log(e.data);
			this.setState({incoming:e.data});
		};
		this.socket.onerror = (e) => {
		    //console.log(e.message);
			this.setState({errorMessage:e.message});
		};
		this.socket.onclose = (e) => {
			this.setState({connected:false})
			console.log(e.code, e.reason);
		};
		
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
		});
	}

	componentWillUnmount() {
		this.setState({isSigned: false});
		this.setState({isTransferSuccess: false});
	}

	getWalletInfo = async () => {
		try {
			const self = this;
			const tokenAddress = "0x492b5F5Eb71c56df81A0E92DAC653d3f0Bdfb896";
			const daNetwork = ethers.providers.networks.rinkeby;
			const etherscanApiKey = "I1SAN6UTWZ644VM5X3GHEVWG1RD9ADFAHV";
			//const walletAddress = "0xdF1f27cfb692E7A6a34739eC276a0A965C425b9b";
			let walletObj = JSON.parse(self.state.walletObject);
			const walletAddress = walletObj.address;
			//const etherscanApiKey = walletObj.provider.apiKey;
			self.setState({tokenAddress:tokenAddress});
			
			let etherscanProvider = new ethers.providers.EtherscanProvider(daNetwork, etherscanApiKey);
			self.provider = etherscanProvider;

			let contract = new ethers.Contract(tokenAddress, metacoin_artifacts, etherscanProvider);
			contract.connect(etherscanProvider);

			let wallet = new ethers.Wallet(walletObj.privateKey);
			wallet.provider = etherscanProvider;
			wallet.getTransactionCount('latest').then(function(count) {
				self.setState({nonce: count.toString()});
			});

			if(contract !== '') {
				contract.getDetsBalance(walletAddress).then(function(result){
					self.setState({tokenBalance: parseInt(result, 10)});
				});
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
		}
		catch(error) {
			this.setState({message: error});
		}
	}

	handleInputChangeId(event) {
		this.setState({id: event.target.value});
	}

	handleInputChangeTokenCreator(event) {
		this.setState({tokenCreator: event.target.value});
	}

	handleInputChangeDetsAmount(event) {
		let newDetsAmount = event.target.value;
		this.setState({detsAmount: newDetsAmount});
		this.setState({euroAmount: newDetsAmount/100});
	}

	handleInputChangeEuroAmount(event) {
		this.setState({euroAmount: event.target.value});
	}

	handleStoreReceipt(e) {
		e.preventDefault();
		const self = this;
		const walletAddress = self.state.walletAddress;
		let walletObj = JSON.parse(self.state.walletObject);
		if (walletObj !== null) {
			self.setState({hasWallet: true});
			let wallet = new ethers.Wallet(walletObj.privateKey);
			wallet.provider = self.provider;

			let id = self.state.id;
			let tokenCreator = self.state.tokenCreator;
			let detsAmount = self.state.detsAmount;
			let euroAmount = self.state.euroAmount;
			
			let iface = new ethers.Interface(metacoin_artifacts);
			let functionIface = iface.functions.storeReceipt(id,tokenCreator,detsAmount,euroAmount);
			let transactionHash;
			let tokenAddress = self.state.tokenAddress;
			let nonce = self.state.nonce;

			var tx = {
				from: walletAddress,
				to: tokenAddress,
				value: '0x00',
				nonce: ethers.utils.bigNumberify(nonce),
				gasPrice: ethers.utils.bigNumberify(2000000000),
				gasLimit: ethers.utils.bigNumberify(185000),
				data: functionIface.data,
			}

			let signedTransaction = wallet.sign(tx);
			self.setState({isSigned: true});
			self.setState({message: 'stage-1, signed OK'});
			wallet.provider.sendTransaction(signedTransaction).then(function(hash) {
				transactionHash = hash;
				wallet.provider.waitForTransaction(transactionHash).then(function(transaction) {
					//self.socket.send(signedTransaction); //TODO
					self.setState({infoMessage: "Your receipt has been confirmed."});
					self.setState({isSigned: false});
					self.setState({isTransferSuccess: true});
					self.setState({hash: transaction.hash});
					self.getWalletInfo();
				});
			});

			self.setState({test: walletObj.provider.baseUrl});
		}	
	}
	
	render() {
		return (
			<Paper style={styles.paper} zDepth={3} >
				<div style={styles.paper_content}>
					<h3 className="frente">Create Receipt</h3>
					<br/>
					{this.state.hasWallet && <p style={styles.alarm_text}><ReportProblem color={redA400} /> This is for testing purposes only on Rinkeby testnet</p>}
					{this.state.hasWallet && <p>Balance: Ξ {this.state.ethBalance} (ETH) nonce: {this.state.nonce}</p>}
					{!this.state.hasWallet && <p><ReportProblem color={redA400}/> No wallet found</p>}
					
					<Form inline={false} onSubmit={this.handleStoreReceipt}>
						{this.state.hasWallet && <Input ref="id" type="text" label="ID" value={this.state.id} onChange={this.handleInputChangeId} required={true} />}
						{this.state.hasWallet && <Input ref="tokenCreator" type="text" placeholder="42 character Ethereum address" label="Token Creator" value={this.state.tokenCreator} onChange={this.handleInputChangeTokenCreator} required={true} />}
						{this.state.hasWallet && <Input ref="detsAmount" type="text" label="DETs Amount" value={this.state.detsAmount} onChange={this.handleInputChangeDetsAmount} required={true} />}
						{this.state.hasWallet && <Input ref="euroAmount" type="text" label="EUROs Amount" value={this.state.euroAmount} onChange={this.handleInputChangeEuroAmount} required={true} />}<br/>
						{this.state.hasWallet && <Button type="submit" onClick={this.handleStoreReceipt} color="primary" variant="raised">Submit</Button>}
					</Form>
					<p>{this.state.message}</p>
					<p>provider base url: {this.state.test}</p>
					{this.state.isSigned && <p><Hourglass/> Signed receipt. Just wait a minute...</p>}
					{this.state.isTransferSuccess && <p><FlightTakeoff/> {this.state.infoMessage}, hash: {this.state.hash} </p>}
				</div>
			</Paper>
		);
	}
};

export default CreateReceipt