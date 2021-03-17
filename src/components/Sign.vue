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
      Version: {{safeVersion}}
    </p>
    <p>
      Nonce: {{nonce}}
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
      <button @click="sendFunds">Send funds</button>
    </p>
  </div>
</template>

<script>
import Web3 from 'web3';
import IERC20 from "@openzeppelin/contracts/build/contracts/IERC20.json";
import GnosisSafe from "@gnosis.pm/safe-contracts/build/contracts/GnosisSafe.json";

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

let MyBlobBuilder = function() {
  this.parts = [];
}

MyBlobBuilder.prototype.append = function(part) {
  this.parts.push(part);
  this.blob = undefined; // Invalidate the blob
};

MyBlobBuilder.prototype.getBlob = function() {
  if (!this.blob) {
    //console.log('w', this.parts)
    this.blob = new Blob(this.parts, { type: "binary/octet-stream" });
    //console.log('u', this.blob)
  }
  return this.blob;
};

async function bufferToHex(buffer) {
  const b = await buffer.arrayBuffer();
  console.log('b', b)
  const u8a = new Uint8Array(b);
  console.log('u8a', u8a)
  return '0x' + [...u8a]
    .map (b => b.toString (16).padStart (2, "0"))
    .join ("");
}

function hexToBlob(hex) {
  const hexdata = hex.replace(/^0x/, '')
  let byteArray = new Uint8Array(hexdata.length/2);
  for (var x = 0; x < byteArray.length; x++){
    byteArray[x] = parseInt(hexdata.substr(x*2,2), 16);
  }
  return new Blob([byteArray], {type: "application/octet-stream"});
}

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
      gasAmount: 100000,
      gasPrice: 100,
      nonce: null,
      safeVersion: null,
    };
  },
  created() {
    this.web3 = new Web3(Web3.givenProvider);
    this.updateNonce();
  },
  watch: {
    safeAddress() {
      this.updateNonce();
    },
  },
  methods: {
    async updateNonce() {
      if (!this.safeAddress) {
        this.nonce = null;
        this.safeVersion = null;
      } else {
        const contract = new this.web3.eth.Contract(GnosisSafe.abi, this.safeAddress);
        this.nonce = await contract.methods.nonce().call();
        this.safeVersion = await contract.methods.VERSION().call();
      }
    },
    async downloadSignature() {
      const sig = await this.calculateSignature();
      if (sig === undefined) {
        return;
      }

      const accounts = await this.web3.eth.getAccounts();

      const jsonText = JSON.stringify({signature: sig.result, address: accounts[0]});
      const blob = new Blob([ jsonText ], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${accounts[0]}.json`;
      a.click();
//      document.body.removeChild(a);
    },
    createTransaction() {
      const amount = Web3.utils.toWei(this.amount);
      const contract = new this.web3.eth.Contract(IERC20.abi, this.safeAddress);
      const tx = contract.methods.transfer(this.recipient, amount);
      return tx;
    },
    async createArguments() {
      const baseTx = await this.createTransaction({}).encodeABI();
      // FIXME: Remove gas parameters.
      return [
        this.token,
        0,
        baseTx,
        0, // CALL
        this.gasAmount,
        0, // 21000,
        0, // this.gasPrice * 1000000000,
        NULL_ADDRESS,
        NULL_ADDRESS
      ];
    },
    async createArgumentsHash() {
      const a = await this.createArguments();
      return {
        to: a[0],
        value: a[1],
        data: a[2],
        operation: a[3],
        safeTxGas: a[4],
        baseGas: a[5],
        gasPrice: a[6],
        gasToken: a[7],
        refundReceiver: a[8],
      };
    },
    async calculateSignature() {
      const self = this;

      if (!self.recipient || /^0x0+$/.test(self.recipient)) {
        alert("No recipient specified!!");
        return undefined;
      }

      const accounts = await self.web3.eth.getAccounts();
//       const txData = await self.createTransaction().encodeABI();
      const message = { ...await self.createArgumentsHash(), nonce: self.nonce };
      console.log('message', message)

      const typedData = {
        types: {
          EIP712Domain: [
            { type: "address", name: "verifyingContract" }
          ],
          SafeTx:
            /*this.safeVersion === '1.2.0' ?*/ [
              { type: "address", name: "to" },
              { type: "uint256", name: "value" },
              { type: "bytes", name: "data" },
              { type: "uint8", name: "operation" },
              { type: "uint256", name: "safeTxGas" },
              { type: "uint256", name: "baseGas" },
              { type: "uint256", name: "gasPrice" },
              { type: "address", name: "gasToken" },
              { type: "address", name: "refundReceiver" },
              { type: "uint256", name: "nonce" },
            ] /*:
            this.safeVersion === '1.1.1' ? [

            ] : []*/,
        },
        domain: {
          verifyingContract: this.safeAddress,
        },
        primaryType: "SafeTx",
        message/*: {
          to: target,
          value: "10000000000000000",
          data: "0x",
          operation: "0",
          safeTxGas: "42671",
          dataGas: "40660",
          gasPrice: "10000000000",
          gasToken: "0x0000000000000000000000000000000000000000",
          refundReceiver: "0x0000000000000000000000000000000000000000",
          nonce: "0"
        }*/,
      }
      return new Promise((resolve, reject) => {
        async function doIt() {
          await self.web3.currentProvider.sendAsync({
            jsonrpc: "2.0", 
            method: "eth_signTypedData_v4", // eth_signTypedData_v3 for MetaMask
            params: [accounts[0], JSON.stringify(typedData)],
            id: new Date().getTime(),
          },
          function(err, result) {
            if (err) {
              reject(err)
            } else if (result.error) {
              reject(result.error)
            } else {
              resolve(result);
            }
          });
        }
        doIt();
      });
    },
    loadFile(ev) {
      const self = this;

      const file = ev.target.files[0];

      let fileInfo = {
        filename: file.name,
        from: null,
      }

      const reader = new FileReader();
      reader.onload = e => {
        const files = self.files;
        console.log('q', e.target.result)
        const j = JSON.parse(e.target.result);
        fileInfo.content = hexToBlob(j.signature);
        fileInfo.from = j.from;
        files.push(fileInfo);
        self.files = files;
      };
      // reader.readAsArrayBuffer(file);
      reader.readAsBinaryString(file);
    },
    async sendFunds() {
      const contract = new this.web3.eth.Contract(GnosisSafe.abi, this.safeAddress);
      const accounts = await this.web3.eth.getAccounts();
      console.log('qq', await bufferToHex(this.concatenatedSignatures()))
      const tx = contract.methods.execTransaction(
        ...await this.createArguments(),
        await bufferToHex(this.concatenatedSignatures()),
      ).send({from: accounts[0]});
      return tx;
    },
    concatenatedSignatures() {
      const myBlobBuilder = new MyBlobBuilder();
      for(let item of this.files.sort(f => f.address)) {
        myBlobBuilder.append(item.content);
      }
      return myBlobBuilder.getBlob();
    }
  },
}
</script>
