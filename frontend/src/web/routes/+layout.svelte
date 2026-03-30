<!-- -------- TS -------- -->
<script lang="ts">
  import "../styles/global.css";

  const { children } = $props();
</script>

<!-- -------- HTML -------- -->
<nav>
  <a href="/">home</a>
  <a href="/about">about</a>
  <a href="/blog">blog</a>
</nav>

{@render children()}
