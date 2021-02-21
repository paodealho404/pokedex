<template>
  <Navbar />
  <div class="container-fluid body-w">
    <router-view></router-view>
  </div>
</template>

<script>
import Navbar from './components/Navbar';
export default {
  name: "App",
  components: {
    Navbar
  }
};
</script>

<style>
  .body-w {
        background-image: url('../src/assets/img/background.png');
      }
</style>
