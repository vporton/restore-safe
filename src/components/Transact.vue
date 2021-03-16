<template>
  <div>
    <h1>Restore funds: Do Transaction</h1>
    <p>
      Safe address:
      <input v-model="safeAddress"/>
    </p>
    <p>
      <button @click="downloadSignature">Send funds</button>
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
    };
  },
  created() {
    this.web3 = new Web3(Web3.givenProvider);
  },
  methods: {
  },
}
</script>
