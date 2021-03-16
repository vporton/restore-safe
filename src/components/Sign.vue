<template>
  <div>
    <h1>Restore funds</h1>
    <p>
      Safe address:
      <input v-model="safeAddress"/>
    </p>
    <p>
      Token address:
      <input v-model="token"/>
    </p>
    <p>
      Tokens amount:
      <input v-model="amount"/>
    </p>
    <p>
      Tokens recipient:
      <input v-model="recipient"/>
    </p>
    <p>
      <button @click="downloadSignature">Download signature</button>
    </p>
  </div>
</template>

<script>
import Web3 from 'web3';
// import GnosisSafe from "@gnosis.pm/safe-contracts/build/contracts/GnosisSafe.json";
import IERC20 from "@openzeppelin/contracts/build/contracts/IERC20.json";

export default {
  name: 'Sign',
  data() {
    return {
      web3: null,
      safeAddress: "",
      token: "",
      amount: "",
      recipient: "",
    };
  },
  created() {
    this.web3 = new Web3(Web3.givenProvider);
  },
  methods: {
    async downloadSignature() {
      const sig = await this.calculateSignature();
      if (sig === undefined) {
        return;
      }
      const blob = new Blob([ sig ], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      const accounts = await this.web3.eth.getAccounts();

      const a = document.createElement('a');
      a.href = url;
      a.download = `${accounts[0]}.bin`;
      a.click();
//      document.body.removeChild(a);
    },
    async calculateSignature() {
      if (!this.recipient || /^0x0+$/.test(this.recipient)) {
        alert("No recipient specified!!");
        return undefined;
      }
      const contract = new this.web3.eth.Contract(IERC20.abi, this.safeAddress);
      const accounts = await this.web3.eth.getAccounts();
      const tx = contract.methods.transfer(this.recipient, this.amount).encodeABI();
      // const dataBinary = this.web3.utils.hexToBytes(data);
      const sig = await this.web3.eth.sign(tx, accounts[0]);
      console.log(sig)

      return sig;
    },
  },
}
</script>
