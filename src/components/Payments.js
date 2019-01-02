import React from 'react';
import ethers from 'ethers';
import AsyncStorage from '@callstack/async-storage';
import metacoin_artifacts from '../contracts/EntboxContract.json';
import Paper from 'material-ui/Paper';
import ReportProblem from 'material-ui/svg-icons/action/report-problem';
import Receipt from 'material-ui/svg-icons/action/receipt';
import Hourglass from 'material-ui/svg-icons/action/hourglass-empty';
import Button from 'muicss/lib/react/button';
import {redA400} from 'material-ui/styles/colors';
import {blueGrey600} from 'material-ui/styles/colors';
import FlightTakeoff from 'material-ui/svg-icons/action/flight-takeoff';

class Payments extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			message: '',
			hasWallet: false,
			hasPayments: false,
			isSigned: false,
			isTransferSuccess: false,
			ethBalance: '0',
			clientTransfers: [],
			bankPayments: [],
			//clientRequests: [{code: "Test4", address: "0x1790cfb2f5dc5aae109764252f9bc1e1acd7ac1e"},{code: "Test3", address: "0x3790cfb2f5dc5aae109764252f9bc1e1acd7ac1e"},{code: "Test8", address: "0x2790cfb2f5dc5aae109764252f9bc1e1acd7ac1e"}],
			clientData: [],
			txAmt: 0,
			test: '',
			walletObject: '',
			walletAddress: '',
			walletKey: '',
			apiKey: '',
			id: '',
			tokenAddress: '0x492b5F5Eb71c56df81A0E92DAC653d3f0Bdfb896',
			nonce: '',
			hash: '',
			provider: null,
			contract: null,
			tokenCreatedStatusFromReceipt: true,
		}
		this.handleStoreReceipt = this.handleStoreReceipt.bind(this);
	}

	componentWillMount() {
		const self = this;
		AsyncStorage.getItem("walletAddress").then(walletAddress => {
			if (walletAddress) {
				this.setState(() => ({ walletAddress: walletAddress }));
				this.setState(() => ({ hasWallet: true }));
			}
		});

		AsyncStorage.getItem("walletObject").then(walletObject => {
			if (walletObject) {
				this.setState(() => ({ walletObject: walletObject }));
				this.setState(() => ({ apiKey: JSON.parse(walletObject).apiKey }));
				this.setState(() => ({ walletKey: JSON.parse(walletObject).privateKey }));
				self.getWalletInfo();
			}
		});
		self.clientMessages();
	}

	clientMessages = async () => {
		const clientRequests = require('../lib/ClientsRequests.txt');
		fetch(clientRequests)
		.then((response) => response.json()) 
		.then((responseJson) => { 
			let clientRequests = responseJson.data;
			let clientTransfers = this.state.clientTransfers;
			for (let i in clientRequests) {
				clientTransfers.push({"code":clientRequests[i].code,"address":clientRequests[i].address});
			}
			this.setState({clientTransfers: clientTransfers});
		});
	}

	getTxList = async () => {
		const self = this;
		self.setState({clientData: []});
		//const bankPaymentList = require('http://www.chainsoffreedom.org/resources/payments.json');
		const bankPaymentList = require('../lib/BankPayments.txt');
		//return fetch(bankPaymentList, {headers: { 'Accept': 'application/json', 'content-type': 'application/json'}})
		return fetch(bankPaymentList)
		.then((response) => response.json()) 
		.then((responseJson) => { 
			let payments = responseJson.payments;

			for (let i in payments) {
				if (payments.hasOwnProperty(i)) {
					self.setState({hasPayments: true});
					let created = payments[i].created.substr(0,10);
					payments[i].date = created;
					let description = payments[i].description;
					let savedCode = self.state.clientTransfers;
					let clientData = self.state.clientData;
					for (let j in savedCode) {
						if (description === savedCode[j].code) {
							clientData.push({
								"created": created, 
								"value": payments[i].value,
								"iban": payments[i].iban,
								"description": description,
								"address": savedCode[j].address,
								"tokensCreated": self.getTokenInfo(description)
							});
							payments[i].address = savedCode[j].address;
							break;
						}
					}
					self.setState({clientData: clientData});
					self.setState({txAmt: savedCode.length});
				}
			}
			//self.getWalletInfo();
			//self.setState({bankPayments: payments});
		})
		.catch((error) => {
			this.setState({message: "! " + error});
		});
	}

	getWalletInfo = async () => {
		try {
			const self = this;
			const tokenAddress = self.state.tokenAddress;
			const daNetwork = ethers.providers.networks.rinkeby;
			//const etherscanApiKey = this.state.apiKey;
			const etherscanApiKey = "I1SAN6UTWZ644VM5X3GHEVWG1RD9ADFAHV";
			const walletObj = JSON.parse(self.state.walletObject);
			const walletAddress = walletObj.address;
			
			let etherscanProvider = new ethers.providers.EtherscanProvider(daNetwork, etherscanApiKey);
			self.provider = etherscanProvider;
			self.setState({provider: etherscanProvider});
			
			let contract = new ethers.Contract(tokenAddress, metacoin_artifacts, etherscanProvider);
			contract.connect(etherscanProvider);
			
			if(contract !== '') {
				self.setState({contract: contract});
				contract.getTokenCreatedStatusFromReceipt('test2').then(function(result){ //TODO change receiptID
					self.setState({tokenCreatedStatusFromReceipt: result});
				});
			}
			
			let wallet = new ethers.Wallet(walletObj.privateKey);
			wallet.provider = etherscanProvider;
			wallet.getTransactionCount('latest').then(function(count) {
				self.setState({nonce: count.toString()});
			});
			

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

	getTokenInfo(id) {
		const self = this;
		//let receiptId = this.state.contract.toString();
		let contract = self.state.contract;
		let receiptId = '';

		contract.getTokenCreatedStatusFromReceipt(id).then(function(result){
			//return result.toString();
			receiptId = 'eops: ';
		});
		return 'receiptId';
	}

	handleStoreReceipt(address, value, id) {
		const self = this;
		let clientAddress = address;
		let euroAmount = parseInt(value);
		let detsAmount = euroAmount*100; 
		const walletAddress = self.state.walletAddress;
		const walletKey = self.state.walletKey;
		const tokenAddress = self.state.tokenAddress;
		self.setState({hasWallet: true});
		let wallet = new ethers.Wallet(walletKey);

		//wallet.provider = self.provider;	
		let provider = self.state.provider;
		let iface = new ethers.Interface(metacoin_artifacts);
		let functionIface = iface.functions.storeReceipt(id,address,detsAmount,euroAmount);
		let nonce = self.state.nonce;
		let transactionHash;

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
		provider.sendTransaction(signedTransaction).then(function(hash) {
			transactionHash = hash;
			self.setState({message: 'stage-2, send transaction: ' + hash});
			provider.waitForTransaction(transactionHash).then(function(transaction) {
				//self.socket.send(signedTransaction); //TODO
				self.setState({infoMessage: "Your receipt has been confirmed."});
				self.setState({isSigned: false});
				self.setState({isTransferSuccess: true});
				self.setState({hash: transaction.hash});
				self.setState({message: 'stage-3, transaction confirmed: ' + transaction.hash});
				//self.getWalletInfo();
			});
		});
	}

	render() {
		return (
			<Paper style={styles.paper} zDepth={3} >
				<div style={styles.paper_content}>
					<h3 className="frente">Client Payments</h3>
					<br/>
					<p style={styles.prompt}>You can create a receipt by clicking on the icon next to the address. If the client receives the receipt, he can accumulate an equivalent amount of DET-tokens.</p>
					{this.state.hasPayments && <p style={styles.prompt}>Bank transactions: {this.state.txAmt}, Nonce: {this.state.nonce}, Balance: Ξ {this.state.ethBalance}</p>}
					{!this.state.hasWallet && <p><ReportProblem color={redA400}/> No wallet found</p>}
					<div style={styles.row}>
						<div style={styles.column1}>
							<h4 className="frente">Date</h4>
						</div>
						<div style={styles.column2}>
							<h4 className="frente">IBAN</h4>
						</div>
						<div style={styles.column3}>
							<h4 className="frente">Amount</h4>
						</div>
						<div style={styles.column4}>
							<h4 className="frente">Receipt-ID</h4>
						</div>
						<div style={styles.column5}>
							<h4 className="frente">Client Address</h4>
						</div>
						<div style={styles.column6}>
							<Button type="submit" onClick={() => this.getTxList()} color="primary" variant="raised">update</Button>
						</div>
					</div>
					{this.state.clientData.map((dynamicData2, key) => 
						<div style={styles.row} key={key}>
							<div style={styles.column1}>
								{dynamicData2.created}
							</div>
							<div style={styles.column2}>
								{dynamicData2.iban}
							</div>
							<div style={styles.column3}>
								&euro; {dynamicData2.value}
							</div>
							<div style={styles.column4}>
								{dynamicData2.description}
							</div>
							<div style={styles.column5}>
								{dynamicData2.address}&nbsp;
							</div>
							<div style={styles.column6}>
								{dynamicData2.address && <a href="#" onClick={() => 
									this.handleStoreReceipt(dynamicData2.address, dynamicData2.value, dynamicData2.description)} ><Receipt style={{height: '14px'}} color={blueGrey600}/></a>} &nbsp;
									{dynamicData2.tokensCreated}
							</div>
						</div>
					)}
					<div>&nbsp;</div>
					<div>&nbsp;</div>
					<p>{this.state.message}</p>
					{this.state.isSigned && <p><Hourglass/> Signed receipt. Just wait a minute...</p>}
					{this.state.isTransferSuccess && <p><FlightTakeoff/> {this.state.infoMessage}, hash: {this.state.hash} </p>}
				</div>
			</Paper>
		)
	}
}

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
	row: {
		background: 'yellow',
		
	},
	column1: {
		float: 'left',
		width: '10%',
		overflow: 'hidden',
	},
	column2: {
		float: 'left',
		width: '20%',
		overflow: 'hidden',
	},
	column3: {
		float: 'left',
		width: '7%',
		overflow: 'hidden',
	},
	column4: {
		float: 'left',
		width: '17%',
		overflow: 'hidden',
	},
	column5: {
		float: 'left',
		width: '35%',
		overflow: 'hidden',
	},
	column6: {
		float: 'left',
		width: '11%',
		overflow: 'hidden',
	},
	prompt: {
		color: '#BCB3A2'
	},
};

export default Payments