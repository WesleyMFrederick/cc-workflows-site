interface CartItem {
  name: string
  price: number
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

const cart: CartItem[] = [
  { name: 'Widget', price: 10 },
  { name: 'Gadget', price: 20 }
]

console.log(calculateTotal(cart))
