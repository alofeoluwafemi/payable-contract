require('dotenv').config();

const Payable = artifacts.require("PayableContract");

module.exports = function (deployer, network, accounts) {
  process.env.NETWORK = network;

  if(network === 'dev'){
    deployer.deploy(Payable,{from: accounts[0]});
  }else{
    deployer.deploy(Payable,{from: "0xA5771debcAD3Af421712c8e2072a41eAc1BF9282",gas: 6721975, gasPrice: 20000000000});
  }
};
