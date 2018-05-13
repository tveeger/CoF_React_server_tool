import React from 'react';
import ethers from 'ethers';
import metacoin_artifacts from '../contracts/EntboxContract.json';
import Paper from 'material-ui/Paper';
import ReportProblem from 'material-ui/svg-icons/action/report-problem';

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

class Preferences extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			hasWallet: false,
			message: '',
			tokenAddress: '',
			walletAddress: '',
			testme: this.props.newTestme,
		}
	}

	componentWillMount() {
		
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

		}
		catch(error) {
			this.setState({message: error});
		}
	}

	render() {
		return (
			<Paper style={styles.paper} zDepth={3} >
				<div style={styles.paper_content}>
					<br/>
					<h3 className="frente">Preferences</h3>
					<br/>
					{!this.state.hasWallet && <p><ReportProblem/> No wallet found</p>}
					<p>Here are your prefs: </p>
					<p>{this.state.message} {this.props.propFromParent}</p>
				</div>
			</Paper>
		)
	}
}

export default Preferences