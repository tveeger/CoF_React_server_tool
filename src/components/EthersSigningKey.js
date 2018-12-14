import React from 'react';
import ethers from 'ethers';
import AsyncStorage from '@callstack/async-storage';
import metacoin_artifacts from '../contracts/EntboxContract.json';
import Paper from 'material-ui/Paper';
import ReportProblem from 'material-ui/svg-icons/action/report-problem';
import Forward from 'material-ui/svg-icons/content/forward';
import Input from 'muicss/lib/react/input';
import Textarea from 'muicss/lib/react/textarea';
import Button from 'muicss/lib/react/button';

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

class EthersSigningKey extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			message: '',
			walletAddress: '',
			hasWallet: false,
			signature: null,
			messageDigest: null,
			publicKey: '',
			recoveredAddress: '',
			inputMessage: '',
		}
		this.componentWillMount = this.componentWillMount.bind(this);
		this.verifySignature = this.verifySignature.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	componentWillMount() {
		var self = this;
		AsyncStorage.getItem("walletAddress").then(walletAddress => {
			if (walletAddress) {
				this.setState(() => ({walletAddress: walletAddress}));
				this.setState(() => ({etherscanLink: "https://rinkeby.etherscan.io/address/" + walletAddress}))
				this.setState(() => ({hasWallet: true}))
				self.createSignature();
			} else {this.setState({hasWallet: false});}
		})
		.catch(() => { this.setState(() => ({message: "Something went wrong!!!"})); });
		
	}

	createSignature = async () => {
		const walletAddress = this.state.walletAddress;
		let privateKey;
		
		await AsyncStorage.getItem('walletObject').then( (value) => {
			let walletObject = JSON.parse(value);
			privateKey = walletObject.privateKey;
		})
		.then(() =>{
			const SigningKey = ethers._SigningKey;
			let signingKey = new ethers.SigningKey(privateKey);
			let publicKey = signingKey.publicKey;
			let messageBytes = ethers.utils.toUtf8Bytes(walletAddress);
			let messageDigest = ethers.utils.keccak256(messageBytes);
			this.setState({messageDigest: messageDigest});
			let signature = signingKey.signDigest(messageDigest);
			this.setState({signature: JSON.stringify(signature)});
			this.setState({publicKey: publicKey});
			
			this.setState({message: ""});
		});        
		
	}

	verifySignature = async () => {
		let signature = JSON.parse(this.state.inputMessage);

		const SigningKey = ethers._SigningKey;
		let message = 'hello world';
		let messageBytes = ethers.utils.toUtf8Bytes(message);
		let messageDigest = ethers.utils.keccak256(messageBytes);
		let recovered = ethers.SigningKey.recover(messageDigest, signature.r,
                    signature.s, signature.recoveryParam); //ethers v 3.0
		
		if (recovered !== '' && recovered !== null) {
			this.setState({recoveredAddress: recovered});
		} else {
			this.setState({recoveredAddress: 'No address found'});
		}
	}

	handleChange(e) {
		e.preventDefault();
		this.setState({inputMessage: e.target.value});
	}

	render() {
		return (
			<Paper style={styles.paper} zDepth={3} >
				<div style={styles.paper_content}>
					<h3 className="frente">Verify signature sender</h3>
					<br/>
					<p>Public Key: {this.state.publicKey}</p>
					<Textarea
						style={styles.input}
						placeholder = "Signature"
						onChange={this.handleChange}
					/>
					<Button type="submit" onClick={() => this.verifySignature()} color="primary" variant="raised">Recover</Button>
					<p>Address: {this.state.recoveredAddress}</p>  
					<p>{this.state.message}</p>
				</div>
			</Paper>
		)
	}
}

export default EthersSigningKey