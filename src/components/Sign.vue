<template>
  <div>
    <h1>Restore funds: Sign</h1>
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
    <h1>Restore funds: Do Transaction</h1>
    <p><input type="file" @change="loadFile"/></p>
    <ul style="text-align: left;">
      <li v-for="item in files" :key="item.filename">
        {{ item.filename }}
      </li>
    </ul>
    <p>
      Max gas: <input type="number" v-model="gasAmount"/>
    </p>
    <p>
      Gas price: <input v-model="gasPrice"/>
    </p>
    <p>
      <button @click="sendFunds">Send funds</button>
    </p>
  </div>
</template>

<script>
import Web3 from 'web3';
import IERC20 from "@openzeppelin/contracts/build/contracts/IERC20.json";
import GnosisSafe from "@gnosis.pm/safe-contracts/build/contracts/GnosisSafe.json";

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

var MyBlobBuilder = function() {
  this.parts = [];
}

MyBlobBuilder.prototype.append = function(part) {
  this.parts.push(part);
  this.blob = undefined; // Invalidate the blob
};

MyBlobBuilder.prototype.getBlob = function() {
  if (!this.blob) {
    this.blob = new Blob(this.parts, { type: "text/plain" });
  }
  return this.blob;
};

export default {
  name: 'Sign',
  data() {
    return {
      web3: null,
      safeAddress: "",
      token: "",
      amount: "",
      recipient: "",
      files: [],
      gasAmount: 500000,
      gasPrice: 100,
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
    async createTransaction() {
      const contract = new this.web3.eth.Contract(IERC20.abi, this.safeAddress);
      const tx = contract.methods.transfer(this.recipient, this.amount).encodeABI();
      return tx;
    },
    async calculateSignature() {
      if (!this.recipient || /^0x0+$/.test(this.recipient)) {
        alert("No recipient specified!!");
        return undefined;
      }

      const accounts = await this.web3.eth.getAccounts();
      const tx = await this.createTransaction();
      // const dataBinary = this.web3.utils.hexToBytes(data);
      const sig = await this.web3.eth.sign(tx, accounts[0]);
      console.log(sig)

      return sig;
    },
    loadFile(ev) {
      const self = this;

      const file = ev.target.files[0];

      let fileInfo = {
        filename: file.name,
        content: undefined,
      }

      const reader = new FileReader();
      reader.onload = e => {
        fileInfo.content = e.target.result;
        const files = self.files;
        files.push(fileInfo);
        self.files = files;
        self.$forceUpdate();
      };
      // reader.readAsArrayBuffer(file);
      reader.readAsBinaryString(file);
    },
    async sendFunds() {
      const contract = new this.web3.eth.Contract(GnosisSafe.abi, this.safeAddress);
      const baseTx = this.createTransaction();
      const tx = contract.methods.execTransaction(
        this.safeAddress,
        0,
        await baseTx.encodeABI(),
        0, // CALL
        this.gasAmount,
        21000,
        this.gasPrice * 1000000000,
        NULL_ADDRESS,
        NULL_ADDRESS,
        this.concatenetedSignatures(),
      ).send();
      return tx;
    },
    concatenetedSignatures() {
      const myBlobBuilder = new MyBlobBuilder();
      for(let item in this.files) {
        myBlobBuilder.append(item.content);
      }
      return myBlobBuilder.getBlob();
    }
  },
}
</script>
