import React, { Component } from 'react';
import AsyncStorage from '@callstack/async-storage';
import '../css/App.css';
import '../css/frente.css';
import '../css/oswald.css';
//import Container from 'muicss/lib/react/container';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MyBottomNavigation from './materialUI/MyBottomNavigation.js';
import Home from './Home.js';
import CreateWallet from './CreateWallet.js';
import RecoverWallet from './RecoverWallet.js';
//import CreatePublicKey from './CreatePublicKey.js';
import VerifySignature from './VerifySignature.js';
//import MessagingForm from './MessagingForm.js';
import Encryption from './CreateRsa.js';
import SocketIoChat from './SocketIoChat.js';
//import Preferences from './Preferences.js';

import LogoImageSmall from '../img/beeldmerk_30x32_darkblue.png';

import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
//import AssignmentIndIcon from 'material-ui/svg-icons/action/assignment-ind';
//import PeopleIcon from 'material-ui/svg-icons/social/people';
//import HomeIcon from 'material-ui/svg-icons/action/home';
import WalletIcon	from 'material-ui/svg-icons/action/account-balance-wallet';
import LockIcon	from 'material-ui/svg-icons/action/lock';
import Build	from 'material-ui/svg-icons/action/build';
import Chat	from 'material-ui/svg-icons/action/speaker-notes';

const styles = {
	title: {
		cursor: 'pointer',
	},
	verticon: {
		color: '#dddddd'
	}
};

class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
			message: '',
			web3: null,
			showHome: true,
			showRecoverWallet: false,
			showCreateWallet: false,
			showPublicKey: false,
			showPrefs: false,
			showSocketIoChat: false,
			showEncryption: false,
			walletAddress: '',
		}
	}

	componentWillMount() {
		var self = this;
		const tokenAddress = self.daTokenAddress;
		self.setState({tokenAddress: tokenAddress});
		AsyncStorage.getItem("walletAddress").then(walletAddress => {
			if (walletAddress) {
				this.setState(() => ({ wallet: walletAddress }));
				this.setState(() => ({ hasWallet: true }));
			} else {
				this.handleRecoverWallet();
			}
		})
		
	}

	handleHome = (event, value) => {
		this.setState({
			showCreateWallet: false,
			showRecoverWallet: false,
			showPublicKey: false,
			showHome:true,
			showPrefs: false,
			showSocketIoChat:false
		});
	};

	handlePublicKey = (event, value) => {
		this.setState({
			showCreateWallet: false,
			showRecoverWallet: false,
			showPublicKey: true,
			showHome:false,
			showPrefs: false,
			showEncryption: false,
			showSocketIoChat:false
		});
	};

	handleCreateWallet = (event, value) => {
		this.setState({
			showCreateWallet: true,
			showRecoverWallet: false,
			showPublicKey: false,
			showHome:false,
			showPrefs: false,
			showEncryption: false,
			showSocketIoChat:false
		});
	};

	handleEncryption = (event, value) => {
		this.setState({
			showCreateWallet: false,
			showRecoverWallet: false,
			showPublicKey: false,
			showHome:false,
			showPrefs: false,
			showEncryption: true,
			showSocketIoChat:false
		});
	};

	handleRecoverWallet = (event, value) => {
		this.setState({
			showCreateWallet: false,
			showRecoverWallet: true,
			showPublicKey: false,
			showHome:false,
			showPrefs: false,
			showEncryption: false,
			showSocketIoChat:false
		});
	};

	handleSocketIoChat = (event, value) => {
		this.setState({
			showCreateWallet: false,
			showRecoverWallet: false,
			showPublicKey: false,
			showHome:false,
			showPrefs: false,
			showEncryption: false,
			showSocketIoChat:true
		});
	};

	walletCallback = (dataFromChild) => {
		this.setState({walletAddress: dataFromChild});
	};
	
	render() {
		let walletAddress = this.state.walletAddress;
		return (
		<div className="App">
			<header>
				<link href="//cdn.muicss.com/mui-0.9.39/css/mui.min.css" rel="stylesheet" type="text/css" media="screen" />
				<MuiThemeProvider>
					<AppBar showMenuIconButton={false} title={<span style={styles.title} className="appbarTitle" >Chains of Freedom</span>} >
						<IconMenu
							iconButtonElement={
									<IconButton touch={true}>
										<MoreVertIcon style={styles.verticon} />
									</IconButton>
								}
							>
							<MenuItem onClick={this.handleHome} value="1" primaryText="Home" leftIcon={<img src={LogoImageSmall} alt="logo" />} />
							<MenuItem onClick={this.handleRecoverWallet} value="2" primaryText="Wallet" leftIcon={<WalletIcon/>} />
							<MenuItem onClick={this.handlePublicKey} value="3" primaryText="Signature" leftIcon={<Build/>} />
							<MenuItem onClick={this.handleEncryption} value="4" primaryText="Encryption" leftIcon={<LockIcon/>} />
							<MenuItem onClick={this.handleSocketIoChat} value="5" primaryText="Chat" leftIcon={<Chat/>} />
						</IconMenu>
					</AppBar>
				</MuiThemeProvider>
			</header>
			
			<main className="">
				<div>
					<MuiThemeProvider>
						<div>
							{this.state.showHome ? <Home propFromParent={walletAddress} /> : null}
							{this.state.showCreateWallet ? <CreateWallet callbackFromParent={this.walletCallback.bind(this)} /> : null}
							{this.state.showRecoverWallet ? <RecoverWallet callbackFromParent={this.walletCallback.bind(this)} callbackFromParent2={this.handleCreateWallet.bind(this)}  /> : null}
							{this.state.showPublicKey ? <VerifySignature callbackFromParent={this.walletCallback.bind(this)}  /> : null}
							{this.state.showEncryption ? <Encryption callbackFromParent={this.walletCallback.bind(this)}  /> : null}
							{this.state.showSocketIoChat ? <SocketIoChat callbackFromParent={this.walletCallback.bind(this)}  /> : null}
						{this.state.message}</div>
					</MuiThemeProvider>
				 </div>
			</main>

			<footer>
				<MuiThemeProvider><MyBottomNavigation/></MuiThemeProvider>
			</footer>
		</div>
		);
	}
}

export default App;
