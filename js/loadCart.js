let dropdownContent = document.getElementById('dropdownContent') // target the cart list dropdown element
let hr = document.createElement('hr') // create empty hr element
hr.className = 'dropdown-divider'
hr.id = `hr-${sku}`

let existingCart = sessionStorage.cart
let cartTotal = 0

console.log('loadCart')

for (sku in existingCart) {
  console.log(`checking ${sku}`)
  if (existingCart[sku].quantity) {
    console.log(`yes quantity`)
    cartTotal++
    let newContent = document.createTextNode(`${cart[sku].quantity}x ${cart[sku].title} ($${cart[sku].price})`);
    let removeButton = document.createElement('a')
    removeButton.className = 'delete is-pulled-right'
    removeButton.id = 'delete'
    removeButton.setAttribute('data-sku', `${sku}`)
    removeButton.onclick = removeItemFromCart

    if (cart[sku].quantity > 1) { // if entry exists, just increase the quantity ie: 2x
      console.log(`multiple quantity`)
      let dropdownDiv = document.getElementById(`cart-${sku}`)
      dropdownDiv.innerHTML = `${cart[sku].quantity}x ${cart[sku].title} ($${cart[sku].price * cart[sku].quantity})`
      dropdownDiv.appendChild(removeButton);
    } else { // new entry, update the badge, create a new <li> and append it
      console.log(`new entry`)
      cartTotal++;
      document.getElementById('cartBadge').innerHTML = cartTotal;
      let newDropdownDiv = document.createElement('div'); // add entry to list
      newDropdownDiv.className = 'dropdown-item'
      newDropdownDiv.id = `cart-${sku}`
      newDropdownDiv.setAttribute('data-rank', cartTotal)

      newDropdownDiv.appendChild(newContent); // add content to <li>
      newDropdownDiv.appendChild(removeButton); // give it a remove button
      totalDiv = document.getElementById('total-list-item')
      dropdownContent.insertBefore(newDropdownDiv, totalDiv); // append it to the cart list
    }
  }
}

if (cartTotal) {
  document.getElementById('cart-shipping').innerHTML = `${cart.subtotal.shipping}`
  document.getElementById('cart-total').innerHTML = `${cart.subtotal.grandTotal}`

}
