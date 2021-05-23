$(function () {
    const connectClient = $('#disconnected');
    const connected = $('#connected');
    const noWeb3 = $('#no-web3');
    const depositForm = $('#deposit-form');
    const partialWithdrawalForm = $('#partial-withdrawal-form');
    const fullWithdrawalForm = $('#full-withdrawal-form');
    const payableContractAddress = "0x04e5ab7bd2d31f24b3c304dc7c3c2656a124946e";
    const payableContractAbi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Receive","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"killSwitch","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[{"internalType":"bool","name":"status","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawPartial","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

    let defaultAccount, provider, signer, payableContract, contractOwner;
    let setuped = false;

    let setUp = function(response){

        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        payableContract = new ethers.Contract(payableContractAddress, payableContractAbi, signer);


        //Fetch default account
        // provider.listAccounts()
        window.ethereum.request({method: 'eth_requestAccounts'})
        .then((accounts) => {
            defaultAccount = accounts[0];
            setuped = true;

            if(defaultAccount){
              connectClient.addClass('d-none');
              connected.removeClass('d-none');
              getBalance();
            }
        })
        .catch((error)=>{
          console.log(error);
        })
    };

    if (!window.ethereum) {
      noWeb3.removeClass('d-none');
    }else if(window.ethereum.isMetamask){
      connectClient.removeClass('d-none');
    }else{
      setUp();
    }

    setTimeout(3000, window.ethereum.addListener('connect', async (response) => {
      if([56,97].indexOf(parseInt(response.chainId))  === -1) alert('Network not supported!');

      if(!setuped) setUp(response);
    }))

    if(window.ethereum.selectedAddress){
      if([56,97].indexOf(parseInt(window.ethereum.chainId))  === -1) alert('Network not supported!');

        if(!setuped) setUp();
    }


    let getBalance = function () {
        provider.getBalance(payableContractAddress)
        .then((weiBal)=>{
          return ethers.utils.formatUnits(weiBal);
        })
        .then((etherBal)=>{
          $('#balance').html(`${etherBal} BNB`)
          $('.total').val(etherBal);
        })
        .then(()=>{
             payableContract.owner()
             .then((address) => {
               contractOwner = address;

               if(contractOwner.toLocaleLowerCase() === defaultAccount.toLocaleLowerCase()){
                 $('.owner').removeClass('d-none');
                 $('.visitor').addClass('d-none');
               }else{
                 $('.visitor').removeClass('d-none');
                 $('.owner').addClass('d-none');
               }

             })
             .catch((error) => {
               console.log(error);
             });

        })
        .catch((error)=>{
          console.log(error)
        })
    };

    let depositFund = function(){
      let _val = $('#deposit-amount').val();

      signer.sendTransaction({
        to: payableContractAddress,
        value: ethers.utils.parseEther(_val)
      })
      .then((transaction)=>{

        const btn = $('.deposit');

        btn.text('Loading...').attr('disabled');

        transaction.wait()
        .then(function(receipt) {
            btn.text('Deposit');

            setTimeout(3000,window.location.reload());
        })
        .catch(function(error) {
          console.log(error)
        })
      })
      .catch((error)=>{
        console.log(error);
      })
    }

    let withdrawSome = function(){
      let _val = $('#withdraw-some-amount').val();

      payableContract.withdrawPartial(ethers.utils.parseEther(_val),{
        from: defaultAccount,
      })
      .then((transaction)=>{

        const btn = $('.withdraw-some-btn');

        btn.text('Loading...').attr('disabled');

        transaction.wait()
        .then(function(receipt) {
            btn.text('Withdraw');

            setTimeout(3000,window.location.reload());
        })
        .catch(function(error) {
          console.log(error)
        })
      })
      .catch((error)=>{
        console.log(error);
      })
    }

    let withdrawAll = function(){

      payableContract.withdrawAll({
        from: defaultAccount,
      })
      .then((transaction)=>{

        const btn = $('.withdraw-all-btn');

        btn.text('Loading...').attr('disabled');

        transaction.wait()
        .then(function(receipt) {
            btn.text('Withdraw');

            setTimeout(3000,window.location.reload());
        })
        .catch(function(error) {
          console.log(error)
        })
      })
      .catch((error)=>{
        console.log(error);
      })
    }

    connectClient.on('click',function(){
      window.ethereum.request({method: 'eth_requestAccounts'})
         .then((response) => {
           connectClient.addClass('d-none');
           connected.removeClass('d-none');
           getBalance();
         })
         .catch((error) => {
             console.log(error);
         });

    });

    depositForm.on('submit',function(e){
      e.preventDefault();
      depositFund();
      return false;
    });

    partialWithdrawalForm.on('submit',function(e){
      e.preventDefault();
      withdrawSome();
      return false;
    });

    fullWithdrawalForm.on('submit',function(e){
      e.preventDefault();
      withdrawAll();
      return false;
    });

    window.transferOwnership = function(address){
      payableContract.transferOwnership(address,{
        from: defaultAccount,
      })
      .then((transaction)=>{

        transaction.wait()
        .then(function(receipt) {
            setTimeout(3000,window.location.reload());
        })
        .catch(function(error) {
          console.log(error)
        })
      })
      .catch((error)=>{
        console.log(error);
      })
    };


    window.ethereum.on('accountsChanged', () => {
        window.location.reload();
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });

    window.ethereum.on('disconnect', () => {
        window.location.reload();
    });
});
