<template>
  <div>
    <h1>Restore funds: Do Transaction</h1>
    <p>
      Safe address:
      <input v-model="safeAddress"/>
    </p>
    <p><input type="file" @change="loadFile"/></p>
    <ul style="text-align: left;">
      <li v-for="item in files" :key="item.filename">
        {{ item.filename }}
      </li>
    </ul>
    <p>
      <button @click="sendFunds">Send funds</button>
    </p>
  </div>
</template>

<script>
import Web3 from 'web3';
// import GnosisSafe from "@gnosis.pm/safe-contracts/build/contracts/GnosisSafe.json";

export default {
  name: 'Transact',
  data() {
    return {
      web3: null,
      safeAddress: "",
      files: [],
    };
  },
  created() {
    this.web3 = new Web3(Web3.givenProvider);
  },
  methods: {
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
    sendFunds() {

    },
  },
}
</script>
