<!-- --------- TypeScript -------- -->
<script lang="ts">
  import cat from "@/assets/images/cat.png";
  import Button from "@/components/Button.svelte";
</script>

<!-- --------- HTML -------- -->
<h1>Exploding CATs</h1>
<div class="leftContainer">
  <div class="buttonsContainer">
    <Button bg="#B81C27" color="white">Play</Button>
    <Button bg="#FCF8EE" color="black">Watch Gameplay</Button>
  </div>
  <img src={cat} alt="exploding cat" width="1343px" />
</div>

<!-- --------- CSS -------- -->
<style>
  h1 {
    font-size: 140px;
    line-height: 1.55;
    max-width: 718px;
    color: #b81c27;
    -webkit-text-stroke: 1px black;
  }

  .leftContainer {
    display: flex;
    flex-direction: column;
    gap: 52px;
  }

  .buttonsContainer {
    display: flex;
    gap: 110px;
  }
</style>
