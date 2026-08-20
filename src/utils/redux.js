export function createNoopStorage() {
  return {
    getItem() { return Promise.resolve(null) },
    setItem(_key, value) { return Promise.resolve(value) },
    removeItem() { return Promise.resolve() },
  }
}
