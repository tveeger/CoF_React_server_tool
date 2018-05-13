pragma solidity ^0.4.16;

contract Owned { address public owner;

	function Owned() public {
		owner = msg.sender;
	}

	modifier onlyOwner {
		require (msg.sender == owner);
		_;
	}

	function transferOwnership(address newOwner) public onlyOwner {
		owner = newOwner;
	}
}

contract StandardToken { 
	string public name;
	string public symbol;
	uint8 public decimals = 0;
	uint256 public totalSupply;
	mapping( address => uint256) public balanceOf;

	event Transfer(address indexed from, address indexed to, uint256 value);

	function StandardToken(
			uint256 initialSupply,
			string tokenName,
			string tokenSymbol
		) public {
		totalSupply = initialSupply * 10 ** uint256(decimals);
		balanceOf[msg.sender] = totalSupply;
		name = tokenName;
		symbol = tokenSymbol;
	}

	function _transfer(address _from, address _to, uint256 _value) internal {
		require(_to != 0x0);
		require(balanceOf[_from] >= _value);
		require(balanceOf[_to] + _value > balanceOf[_to]);
		uint256 previousBalances = balanceOf[_from] + balanceOf[_to];
		balanceOf[_from] -= _value;
		balanceOf[_to] += _value;
		emit Transfer(_from, _to, _value);
		assert(balanceOf[_from] + balanceOf[_to] == previousBalances);
	}

	function transfer(address _to, uint256 _value) public {
		_transfer(msg.sender, _to, _value);
	}

	function safeToAdd(uint a, uint b) internal pure returns (bool) {
		return (a + b >= a);
	}

}	


contract EntboxContract is StandardToken, Owned {
	string public constant name = "Chains Of Freedom";
	string public constant symbol = "DET";
	uint public constant decimals = 0;
	string public constant version = "0.1";
	uint256 totalDets = 0;
	
	mapping( string => DetsReceipt ) receipts;
	mapping( string => DetsDestruction ) destructions;

	struct DetsReceipt {
		string id;
		address tokenCreator;
		uint256 detsAmount;
		uint256 euroAmount;
		bool tokenCreatedStatus;
	}

	struct DetsDestruction {
		string id;
		address destroyer;
		uint256 detsDestroyed;
		string iban;
	}

	function EntboxContract(
		uint256 initialSupply,
		string tokenName,
		string tokenSymbol
	) public StandardToken(initialSupply, tokenName, tokenSymbol) {
		owner = msg.sender;
	}

	function getTotalDetsAmount() public view returns (uint256 detsAmount) {
		return totalDets;
	}

	function storeReceipt(string id, address tokenCreator, uint256 detsAmount, uint euroAmount) public onlyOwner {
		receipts[id] = DetsReceipt(id, tokenCreator, detsAmount, euroAmount,false);
	}
	function getDetsAmountFromReceipt(string id) public view returns (uint256 detsAmount) {
		return receipts[id].detsAmount;
	}
	function getEuroAmountFromReceipt(string id) public view returns (uint256 euroAmount) {
		return receipts[id].euroAmount;
	}
	function getTokenCreatorFromReceipt(string id) public view returns (address tokenCreator) {
		return receipts[id].tokenCreator;
	}
	function getTokenCreatedStatusFromReceipt(string id) public view returns (bool tokenCreatedStatus) {
		return receipts[id].tokenCreatedStatus;
	}

	function createDets(string id) public {
		require(!receipts[id].tokenCreatedStatus);
		require(getDetsAmountFromReceipt(id) > 0);
		receipts[id].tokenCreatedStatus = true;
		address addr = getTokenCreatorFromReceipt(id);
		uint256 detsToCreate = getDetsAmountFromReceipt(id);
		balanceOf[addr] += detsToCreate;
		totalSupply += detsToCreate;
		totalDets += detsToCreate;
	}

	function getDetsBalance(address addr) public view returns (uint256 detsAmount) {
		return balanceOf[addr];
	}

	function destroyDets(string id, uint256 detsToDestroy, string iban) public {
		require(balanceOf[msg.sender] > detsToDestroy);
		require(getDetsDestroyed(id) == 0);
		require(detsToDestroy != 0);
		balanceOf[msg.sender] -= detsToDestroy;
		totalDets -= detsToDestroy;
		destructions[id] = DetsDestruction(id, msg.sender, detsToDestroy, iban);
	}

	function getDetsDestroyer(string id) public view returns (address detsDestroyer) {
		return destructions[id].destroyer;
	}
	function getDetsDestroyed(string id) public view returns (uint256 detsDestroyed) {
		return destructions[id].detsDestroyed;
	}
	function getIban(string id) public view returns (string iban) {
		return destructions[id].iban;
	}

}