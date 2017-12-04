// Store API

let orderButtons = document.querySelectorAll('.orderButton')
let addFirstItem = true
const inventory = {
  'ES-BEL-010': {
    thumb: '',
    price: 20,
    title: 'Beleai',
    description: 'b stuff',
    quantity: 0
  },
  'ES-BIO-010': {
    thumb: '',
    price: 20,
    title: 'Bio Shield',
    description: 'shield stuff',
    quantity: 0
  },
  'ES-SUN-008': {
    thumb: '',
    price: 20,
    title: 'Sun Sheer',
    description: 'sheerly sun',
    quantity: 0
  }
}
sessionStorage.clear()
let cart = inventory
let total = 0
sessionStorage.setItem('cart', JSON.stringify(cart))

orderButtons.forEach(button => {

  button.onclick = (item) => {

    let sku = item.target.dataset.sku;
    cart[sku].quantity++

    sessionStorage.setItem(sku, cart[sku].quantity)
    sessionStorage.setItem('cart', JSON.stringify(cart))

    let dropdownContent = document.getElementById('dropdownContent');
    let hr = document.createElement('hr')
    hr.className = 'dropdown-divider'
    hr.id = `hr-${sku}`

    if (!total) {
      let defaultDropdownItem = document.getElementById('cart-default')
      defaultDropdownItem.style.display = 'none'
      document.getElementById('cartBadge').style.display = 'block'
      addFirstItem = false
    } else if (cart[sku].quantity === 1 ) {
      dropdownContent.appendChild(hr)
    }

    let newContent = document.createTextNode(`${cart[sku].quantity}x ${cart[sku].title} ($${cart[sku].price})`);
    let removeButton = document.createElement('a')
    removeButton.className = 'delete is-pulled-right'
    removeButton.id = 'delete'
    removeButton.setAttribute('data-sku', `${sku}`)
    removeButton.onclick = removeItemFromCart

    if (cart[sku].quantity > 1) {
      let dropdownDiv = document.getElementById(`cart-${sku}`)
      dropdownDiv.innerHTML = `${cart[sku].quantity}x ${cart[sku].title} ($${cart[sku].price})`
      dropdownDiv.appendChild(removeButton);
    } else {
      total++;
      document.getElementById('cartBadge').innerHTML = total;

      let newDropdownDiv = document.createElement('div');
      newDropdownDiv.className = 'dropdown-item'
      newDropdownDiv.id = `cart-${sku}`
      newDropdownDiv.setAttribute('data-rank', total)

      newDropdownDiv.appendChild(newContent);
      newDropdownDiv.appendChild(removeButton);

      dropdownContent.appendChild(newDropdownDiv);
    }

  }
})

removeItemFromCart = (item) => {

  let sku = item.target.dataset.sku
  cart[sku].quantity = 0
  sessionStorage.setItem('cart', JSON.stringify(cart))

  let dropdownDiv = document.getElementById(`cart-${sku}`)
  if (total !== 1 ) {
    let divider = dropdownDiv.dataset.rank !== '1' ? dropdownDiv.previousSibling : dropdownDiv.nextSibling
    if (divider) {
      divider.remove()
    }
  }
  dropdownDiv.remove()

  total--
  document.getElementById('cartBadge').innerHTML = total;
  if (total === 0) {
    let defaultDropdownItem = document.getElementById('cart-default')
    defaultDropdownItem.style.display = 'block'
  }
}
