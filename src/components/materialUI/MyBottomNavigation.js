import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import {BottomNavigation, BottomNavigationItem, BottomNavigationAction} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import Router, { Redirect,Link } from 'react-router';
//import IconWhatsHot from 'material-ui/svg-icons/social/whatshot';
import IconShare from 'material-ui/svg-icons/social/share';
import People from 'material-ui/svg-icons/social/people';
import Android from 'material-ui/svg-icons/action/android';
import TouchApp from 'material-ui/svg-icons/action/touch-app';
import Github from '../../img/github-logo.svg';
import Ethereum from '../../img/ethereum-logo.svg';

//const hot = <IconWhatsHot/>;
const share = <IconShare/>
const android = <Android/>
const touch_app = <TouchApp/>

const styles = {
	bottom_icon: {
		width: '24px',
		height: '24px',
		padding: '20',
	}
};

/**
 * A simple example of `BottomNavigation`, with three labels and icons
 * provided. The selected `BottomNavigationItem` is determined by application
 * state (for instance, by the URL).
 */
class MyBottomNavigation extends Component {
	constructor() {
		super();

		this.selectBottomNavigationItem = this.selectBottomNavigationItem.bind(this);
		
		this.state = {
			selectedIndex: 3,
		};
	}
  
	selectBottomNavigationItem = (index) => {
		this.setState({selectedIndex: index})

		switch(index) {
			case 0:
			return window.location = "https://play.google.com/store/apps?hl=nl";
			case 1:
			return window.location = "http://chainsoffreedom.org";
			case 2:
			return window.location = "https://github.com/tveeger/CoF_React_server_tool/tree/master";
			case 3:
			return window.location = "http://ethereum.org";
		}
	}


	render() {
		return (
			<Paper zDepth={2}>
				<BottomNavigation showLabels={false} selectedIndex={this.state.selectedIndex}>
					<BottomNavigationItem
						label=""
						icon={<img src={Github} style={styles.bottom_icon} />}
						onTouchTap={() =>  this.selectBottomNavigationItem(2)}
					/>

					<BottomNavigationItem
						label=""
						icon={<img src={Ethereum} style={styles.bottom_icon} />}
						onTouchTap={() => this.selectBottomNavigationItem(1)}
					/>
					
					<BottomNavigationItem
						label=""
						icon={android}
						onTouchTap={() => this.selectBottomNavigationItem(0)}
					/>
				</BottomNavigation>
			</Paper>
		);
	}
}

export default MyBottomNavigation;