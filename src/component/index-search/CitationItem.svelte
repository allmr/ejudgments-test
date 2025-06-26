<script>
  export let item = undefined;
  export const getOptionLabel = undefined;
</script>

<div class="customItem">
  <div class="customItem_title">
    <div class="customItem_name">{item.Citation}</div>
  </div>
</div>

<style>
  .customItem {
    display: flex;
    align-items: center;
  }
  .customItem_title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-bottom: 1px solid black;
  }

  .customItem_name {
    display: inline-block;
    font-weight: 700;
    margin-right: 10px;
  }
</style>
