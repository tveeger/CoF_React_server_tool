import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh';
import UnfoldIcon from 'material-ui/svg-icons/navigation/unfold-less';
import DonutIcon from 'material-ui/svg-icons/social/people';
import HomeIcon from 'material-ui/svg-icons/navigation/home';
import LoyaltyIcon from 'material-ui/svg-icons/social/domain';

function handleTouchTap() {
  alert('onTouchTap triggered on the title component');
}

const styles = {
  title: {
    cursor: 'pointer',
  },
  verticon: {
  	color: 'A100'
  }
};

class MyTopNavigation extends Component {
	 state = {
		valueSingle: '1',
		openMenu: false,
	};

	handleChangeSingle = (event, value) => {
		this.setState({
			valueSingle: value,
		});
	};

	handleOnRequestChange = (value) => {
		this.setState({
			openMenu: value,
		});
	}

	handleOpenMenu = () => {
		this.setState({
			openMenu: true,
		});
	}

	render () {
		return (
			<AppBar
				title={<span style={styles.title} className="appbarTitle">Entbox</span>}
				onTitleTouchTap={handleTouchTap}
				iconElementRight={
					<IconMenu 
						iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
						onTouchTap={this.handleOpenMenu}
         				open={this.state.openMenu}
         				onChange={this.handleChangeSingle}
        				value={this.state.valueSingle}>
					<MenuItem value="1" primaryText="Home" leftIcon={<HomeIcon/>} />
					<MenuItem value="2" primaryText="About" leftIcon={<DonutIcon/>} />
					<MenuItem value="3" primaryText="Terms" leftIcon={<RefreshIcon/>} />
					<MenuItem value="4" primaryText="Charity" leftIcon={<LoyaltyIcon/>} />
				</IconMenu>
				
				}
			>
			<Menu 
     			open={this.state.openMenu}
     			onChange={this.handleChangeSingle}
    			value={this.state.valueSingle}
    			menuStyle={styles.verticon}>
				<MenuItem value="1" primaryText="Home" leftIcon={<HomeIcon/>} />
				<MenuItem value="2" primaryText="About" leftIcon={<DonutIcon/>} />
				<MenuItem value="3" primaryText="Terms" leftIcon={<RefreshIcon/>} />
				<MenuItem value="4" primaryText="Charity" leftIcon={<LoyaltyIcon/>} />
			</Menu>

			</AppBar>

		);
	}
}
export default MyTopNavigation;