// start on private geth
// geth --networkid 12345 --genesis ~/test/genesis.json --datadir ~/.ethereum_experiment console


//admin.setSolc('/usr/local/bin/solc');

// contract for voting
var contract = 'contract Vote { mapping (uint => uint) votes; mapping (uint => string) people; mapping (address => bool) hasVoted; function Vote()public{votes[0] = 0;votes[1] = 0;votes[2] = 0; people[0] = "Bob"; people[1] = "Sally"; people[2] = "Alice";}function castVote(uint n) public{ if (!hasVoted[msg.sender]){votes[n] += 1;hasVoted[msg.sender] = true;} }function canVote(address a) constant public returns (bool){ return hasVoted[a];}function showStatus(uint n) constant public returns (uint) { return votes[n];} function showPerson(uint n) constant public returns (string) {return people[n];}}';

// compiling contract
var vote_comp = web3.eth.compile.solidity(contract);

// getting the abiDefinition
var vote_creator = web3.eth.contract(vote_comp.Vote.info.abiDefinition);

// creating a new instance of the contract
var voter = vote_creator.new({from:web3.eth.accounts[0],data:vote_comp.Vote.code,gas:500000}, function(e, contract){
	if(!e){
		if(!contract.address) {
			console.log("Contract transaction send: TransactionHash: "+contract.transactionHash + "waiting to be mined");
		} else {
			console.log("Contract Mined! Address = "+contract.address);
			console.log(contract);
		}
	}
});

// function to set ether base and start mining for 
function startMine(i){
	miner.setEtherbase(account(i));
	miner.start();
}

function showAll(){
	for (var i = 0; i < 3; i++)
		console.log(voter.showPerson(i) + ": " + voter.showStatus(i) + "\n");	
}

function cast(i, msg){
	var can = checkVoterStatus(msg);
	if (!can){
		voter.castVote(i,{from:msg});
		miner.start();
	}
	else console.log("Your vote has already been cast.");
}

function checkVoterStatus(a) {
	return voter.canVote(a);
}

function s(){
	miner.stop();
}
function account(i){
	return web3.eth.accounts[i]
}
