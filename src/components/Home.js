import React, { Component } from 'react';
import TokenInfo from './TokenInfo.js'
import CreateReceipt from './CreateReceipt.js'
import SendEth from './SendEth.js'
import Payments from './Payments.js'

import {Tabs, Tab} from 'material-ui/Tabs'
import Paper from 'material-ui/Paper';
//import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

const styles = {
	headline: {
		fontSize: 14,
		paddingTop: 6,
		marginBottom: 2,
		fontWeight: 400,
		color: '#666',
			background: 'transparent true',
			border: 0
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

class Home extends Component {
	constructor(props) {
		super(props)

		this.state = {
			value: 3,
			valueSingle: '3',
		}
		this.handleClick = this.handleClick.bind(this);
		this.handleChange = (event, index, value) => this.setState({value});
		this.handleChangeSingle = this.handleChangeSingle.bind(this);
	}

	onActive(tab) {
		console.log('moved to other tab');
	}

	handleClick(e) {
		e.preventDefault();
		console.log('cliked something ' + this);
	}

	handleActive(tab) {
		//alert(`A tab with this route property ${tab.props['data-route']} was activated.`);
	}

	handleChangeSingle = (event, value) => {
		this.setState({valueSingle: value});
	};

	componentWillMount() {
		var self = this
		self.setState({walletAddress: self.walletAddress});
	}

	render() {
		return (
		<div className="Home">
			<Tabs>
				<Tab label="Home" style={styles.headline}>
					<div className="mui--z2">
						<Paper style={styles.paper} zDepth={0} >
							<TokenInfo/>
							<p>{this.props.propFromParent}</p>
						</Paper>
					</div>
				</Tab>

				<Tab label="Payments" style={styles.headline}>
					<div className="mui--z2">
						<Paper style={styles.paper} zDepth={0} >
							<Payments/>
						</Paper>
					</div>
				</Tab>

				<Tab label="Create Receipt" style={styles.headline}>
					<div className="mui--z2">
						<Paper style={styles.paper} zDepth={0} >
							<CreateReceipt/>
						</Paper>
					</div>
				</Tab>

				<Tab label="Send Ξther" style={styles.headline}>
					<div className="mui--z2">
						<Paper style={styles.paper} zDepth={0} >
							<SendEth/>
						</Paper>
					</div>
				</Tab>
			</Tabs>

		</div>
		);
	}
}

export default Home
