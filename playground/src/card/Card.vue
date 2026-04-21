<template>
  <article class="card">
    <header class="card__header">
      <strong><slot name="title" /></strong>
    </header>
    <div class="card__body">
      <slot />
    </div>
  </article>
</template>

<style scoped>
.card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  background: white;
}
.card__header {
  margin-bottom: 12px;
}
.card__body {
  color: #4b5563;
}
</style>
