// Store API

const inventory = {
  'ES-BEL-010': {
    thumb: '',
    price: 59.99,
    shipping: 4,
    title: 'Beleai',
    description: 'Beleai deep detoxifier',
    quantity: 0
  },
  'ES-BIO-010': {
    thumb: '',
    price: 39.99,
    shipping: 4,
    title: 'Bio Shield',
    description: 'Sun Shield sun protection',
    quantity: 0
  },
  'ES-SUN-008': {
    thumb: '',
    price: 39.99,
    shipping: 4,
    title: 'Sun Sheer',
    description: 'Sun Sheer sun protection',
    quantity: 0
  },
  'ES-BUM-010': {
    thumb: '',
    price: 34.99,
    shipping: 6,
    title: 'Coco Bum',
    description: 'Coconut ointment',
    quantity: 0
  },
  'ES-CHI-010': {
    thumb: '',
    price: 39.99,
    shipping: 4,
    title: 'Sun Child',
    description: 'Sun protection for kids',
    quantity: 0
  },
  // 'ES-5PK': {
  //   thumb: '',
  //   price: 75,
  //   shipping: 8,
  //   title: '5 Pack',
  //   description: 'Earth sun pack of 5: all of our signature products in one',
  //   quantity: 0
  // },
  // 'BEL-BUM-2PK': {
  //   thumb: '',
  //   price: 35,
  //   shipping: 6,
  //   title: 'Beleai + CocoBum 2 pack',
  //   description: '',
  //   quantity: 0
  // },
  // 'SUN-CHI-2PK': {
  //   thumb: '',
  //   price: 35,
  //   shipping: 6,
  //   title: 'Sun Sheer + Sun Child',
  //   description: 'Sun sheer and Sun Child two pack',
  //   quantity: 0
  // },
  // 'BEL-BIO-SUN-3PK': {
  //   thumb: '',
  //   price: 20,
  //   shipping: 7,
  //   title: 'Beleai, Sun Sheer and Bio Shield 3 pack',
  //   description: '3 pack of our most popular products',
  //   quantity: 0
  // },
  coupon: {
    applied: false,
    name: '',
    rate: 1,
    value: 0
  },
  subtotal: {
    subtotal: 0,
    gstPst: 0,
    shipping: 0,
    grandTotal: 0
  }
}

let cart = inventory

removeItemFromCart = (item) => {
  cart = JSON.parse(sessionStorage.cart)

  let sku = item.target.dataset.sku
  cart[sku].quantity = 0
  // cart['subtotal'].subtotal -= inventory[sku].price
  // cart['subtotal'].shipping -= inventory[sku].shipping
  // cart['subtotal'].grandTotal -= (inventory[sku].price * 1.12)
  // + inventory[sku].shipping)
  cart.subtotal = calculateSubtotals(cart, false)
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
  // document.getElementById('cart-shipping').innerHTML = `${cart.subtotal.shipping}`
  document.getElementById('cart-total').innerHTML = `${cart.subtotal.subtotal.toFixed(2)}`
  document.getElementById('cartBadge').innerHTML = total;
  if (total === 0) {
    let defaultDropdownItem = document.getElementById('cart-default')
    defaultDropdownItem.style.display = 'block'
    document.getElementById('total-list-item').style.display = 'none'
  }
}

let genContent = (cart = inventory, sku) => document.createTextNode(`${cart[sku].quantity}x ${cart[sku].title} ($${cart[sku].price})`);
let createRemoveButton = (sku) => {
  let removeButton = document.createElement('a')
  removeButton.className = 'delete is-pulled-right'
  removeButton.id = 'delete'
  removeButton.setAttribute('data-sku', `${sku}`)
  removeButton.onclick = removeItemFromCart
  return removeButton
}

calculateSubtotals = (cart, coupon) => {
  // cart = JSON.parse(sessionStorage.cart)
  let subtotal = {
    subtotal: 0,
    gstPst: 0,
    shipping: 0,
    grandTotal: 0
  }
  for (sku in cart) {
    if (cart[sku].quantity) {
      const base = cart[sku].quantity * cart[sku].price
      subtotal.subtotal += base
      subtotal.gstPst += base * 0.12
      subtotal.shipping = subtotal.subtotal > 50 ? 0 : 25
    }
  }
  if (coupon) {
    console.log('yes coupon in calc')
    subtotal.subtotal = coupon.rate * subtotal.subtotal
  }
  subtotal.grandTotal = subtotal.subtotal + subtotal.gstPst + subtotal.shipping
  console.dir(subtotal)
  return subtotal
}

let total = 0
let subtotal = 0
loadExistingCart = (cart) => {
  for (sku in cart) {
    if (cart[sku].quantity) {

      if (!total) {
        let defaultDropdownItem = document.getElementById('cart-default') // target the placeholder <li> in cart list
        defaultDropdownItem.style.display = 'none' // remove it
        let badge = document.getElementById('cartBadge') // target the badge element next to cart
        badge.style.display = 'block' // show it
        document.getElementById('total-list-item').style.display = 'block'
      }

      total++

      // document.getElementById('cart-shipping').innerHTML = `${cart.subtotal.shipping}`
      document.getElementById('cart-total').innerHTML = `${cart.subtotal.subtotal.toFixed(2)}`
      document.getElementById('cartBadge').innerHTML = total;

      let newDropdownDiv = document.createElement('div'); // add entry to list
      newDropdownDiv.className = 'dropdown-item'
      newDropdownDiv.id = `cart-${sku}`
      newDropdownDiv.setAttribute('data-rank', total)

      let newContent = genContent(cart, sku)
      let removeButton = createRemoveButton(sku)
      newDropdownDiv.appendChild(newContent); // add content to <li>
      newDropdownDiv.appendChild(removeButton); // give it a remove button

      totalDiv = document.getElementById('total-list-item')
      dropdownContent.insertBefore(newDropdownDiv, totalDiv); // append it to the cart list

      if (total > 0) {
        let hr = document.createElement('hr') // create empty hr element
        hr.className = 'dropdown-divider'
        hr.id = `hr-${sku}`
        dropdownContent.insertBefore(hr, totalDiv)
      }
    }
  }
}
if (!sessionStorage.cart) { // no cart in session, set to blank
  sessionStorage.setItem('cart', JSON.stringify(inventory))
  sessionStorage.setItem('ts', Date.now())
} else { // cart in session, parse and load cart
  cart = JSON.parse(sessionStorage.cart)
  loadExistingCart(cart)
}

let orderButtons = document.querySelectorAll('.orderButton')
orderButtons.forEach(button => {

  button.onclick = (item) => {
    cart = JSON.parse(sessionStorage.cart)
    let sku = item.target.dataset.sku; // grab sku from data-sku
    cart[sku].quantity++              // inc quantity in cart object
    cart.subtotal = calculateSubtotals(cart, false)
    // cart['subtotal'].subtotal += inventory[sku].price
    // cart['subtotal'].shipping += inventory[sku].shipping
    // cart['subtotal'].grandTotal += (inventory[sku].price * 1.12)
    // + inventory[sku].shipping

    sessionStorage.setItem(sku, cart[sku].quantity) // update sessionStorage with quantity
    sessionStorage.setItem('cart', JSON.stringify(cart)) // update sessionStore global cart obj with quantity

    let dropdownContent = document.getElementById('dropdownContent') // target the cart list dropdown element
    let hr = document.createElement('hr') // create empty hr element
    hr.className = 'dropdown-divider'
    hr.id = `hr-${sku}`

    // document.getElementById('cart-shipping').innerHTML = `${cart.subtotal.shipping}`
    document.getElementById('cart-total').innerHTML = `${(cart.subtotal.subtotal).toFixed(2)}`

    if (!total) { // shopping cart list is at 0 currently
      let defaultDropdownItem = document.getElementById('cart-default') // target the placeholder <li> in cart list
      defaultDropdownItem.style.display = 'none' // remove it
      let badge = document.getElementById('cartBadge') // target the badge element next to cart
      badge.style.display = 'block' // show it
      document.getElementById('total-list-item').style.display = 'block'
    } else if (cart[sku].quantity === 1 ) { // if adding to the first element, and for the first time on that sku, append an <hr> to that initial element
      dropdownContent.insertBefore(hr, totalDiv)
    }

    let newContent = genContent(cart, sku)
    let removeButton = createRemoveButton(sku)

    if (cart[sku].quantity > 1) { // if entry exists, just increase the quantity ie: 2x
      let dropdownDiv = document.getElementById(`cart-${sku}`)
      dropdownDiv.innerHTML = `${cart[sku].quantity}x ${cart[sku].title} ($${cart[sku].price * cart[sku].quantity})`
      dropdownDiv.appendChild(removeButton);
    } else { // new entry, update the badge, create a new <li> and append it
      total++;
      document.getElementById('cartBadge').innerHTML = total;
      let newDropdownDiv = document.createElement('div'); // add entry to list
      newDropdownDiv.className = 'dropdown-item'
      newDropdownDiv.id = `cart-${sku}`
      newDropdownDiv.setAttribute('data-rank', total)

      newDropdownDiv.appendChild(newContent); // add content to <li>
      newDropdownDiv.appendChild(removeButton); // give it a remove button
      totalDiv = document.getElementById('total-list-item')
      dropdownContent.insertBefore(newDropdownDiv, totalDiv); // append it to the cart list
    }
  }
})
