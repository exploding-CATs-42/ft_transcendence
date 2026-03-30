<!-- -------- TS -------- -->
<script lang="ts">
  const { children, bg, color } = $props();
</script>

<!-- -------- HTML -------- -->
<button type="button" style="{color}; background-color:{bg}"
  >{#if children}
    {@render children()}
  {/if}
</button>

<!-- -------- CSS -------- -->
<style>
  button {
    padding: 14px 20px;
    width: fit-content;
    min-width: 300px;
    border-radius: 40px;
    font-size: 40px;
  }
</style>
