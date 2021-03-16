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
export default {
  name: 'Sign',
  props: {
    safeAddress: String,
    token: String,
    amount: String,
    recipient: String,
  },
  methods: {
    downloadSignature() {
      const blob = new Blob([ JSON.stringify("YYY") ], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'signature.bin'; // FIXME: User's account
      a.click();
      document.body.removeChild(a);
    },

    calculateSignature() {
      return "XXX";
    },
  },
}
</script>
