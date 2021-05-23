require('dotenv').config();

const should = require('should');
const Payable = artifacts.require("PayableContract");

contract("PayableContract", (accounts) => {
    let payable;

    const network = process.env.NETWORK;
    const admin = (network == "dev") ? accounts[0] : process.env.WALLET_ADDRESS;
    const user = (network == "dev") ? accounts[1] :  process.env.USER_ADDRESS;
    const REVERT_MSG = "Returned error: VM Exception while processing transaction: revert";
    const REVERT_ADMIN_ONLY_MSG = "Returned error: VM Exception while processing transaction: revert Admin privilege only -- Reason given: Admin privilege only."

    before(async () => {
      payable = await Payable.deployed();
    });

    describe("verifying contract ownership", async () => {

            it(`should have admin set as account ${admin}`, async () => {
              let _admin = await payable.admin();

              assert.equal(admin, admin, "The contract admin should be deployer address");
            });

            it(`should have default owner set as address ${admin}`, async () => {
              let _owner = await payable.owner();

              assert.equal(_owner, admin, "The contract owner should be admin address by default");
            });

            it(`should have successfully transfer ownership to ${user}`, async () => {
              await payable.transferOwnership(user,{from: admin});

              let _newOwner = await payable.owner();

              assert.equal(_newOwner, user, `The new contract owner is address ${user}`);
            });

            it("should never set owner to 0x0000000000000000000000000000000000000000 address", async () => {

              if(network == "dev") {
                await payable.transferOwnership("0x0000000000000000000000000000000000000000",{from: admin}).should.be.rejectedWith(REVERT_MSG);
              }else{
                //
              }
            });

            it(`should not call onlyAdmin method from ${user}`, async () => {

              if(network == "dev") {
                await payable.transferOwnership("0x0000000000000000000000000000000000000000",{from: user}).should.be.rejectedWith(REVERT_ADMIN_ONLY_MSG);
              }else{
                //
              }
            });
    });

    // describe("verifying contract balance during and after tranactions", async () => {
    //
    //         it("should have zero balance", async () => {
    //           let balance = await web3.eth.getBalance(payable.address);
    //
    //           assert.equal(balance, 0, "The contract does not have a zero balance");
    //         });
    //
    //         it("should have exactly 0.02 ether/bnb balance", async () => {
    //           const amount = web3.utils.toWei('0.02', 'ether');
    //
    //           await web3.eth.sendTransaction({
    //             from: admin,
    //             to: payable.address,
    //             value: amount
    //           });
    //
    //           let newBalance = await web3.eth.getBalance(payable.address);
    //
    //           assert.equal(web3.utils.fromWei(newBalance), 0.02, "The contract doesnt not have balance of exactly 0.02 ether/bnb");
    //         });
    //
    //         it("should have exactly 0.05 ether balance", async () => {
    //           const amount = web3.utils.toWei('0.03', 'ether');
    //
    //           await web3.eth.sendTransaction({
    //             from: admin,
    //             to: payable.address,
    //             value: amount
    //           });
    //
    //           let newBalance = await web3.eth.getBalance(payable.address);
    //
    //           assert.equal(web3.utils.fromWei(newBalance), 0.05, "The contract have balance of exactly 0.05 ether/bnb");
    //         });
    //
    //         it("should have exactly 0.01 ether balance after withdrawal", async () => {
    //           const amount = web3.utils.toWei('0.04', 'ether');
    //
    //           let owner = await payable.owner();
    //
    //           await payable.withdrawPartial(amount,{from: owner});
    //
    //           let newBalance = await web3.eth.getBalance(payable.address); console.log(newBalance);
    //
    //           assert.equal(web3.utils.fromWei(newBalance), 0.01, "The contract have balance of exactly 0.01 ether/bnb");
    //         });
    //
    //         it("should have exactly 0 ether after withdrawal all", async () => {
    //           let owner = await payable.owner();
    //
    //           await payable.withdrawAll({from: owner});
    //
    //           let newBalance = await web3.eth.getBalance(payable.address); console.log(newBalance);
    //
    //           assert.equal(web3.utils.fromWei(newBalance), 0, "The contract have 0 balance");
    //         });
    //
    // });

});
