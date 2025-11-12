function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0)
}

const cart = [
  { name: 'Widget', price: 10 },
  { name: 'Gadget', price: 20 }
]

console.log(calculateTotal(cart))
