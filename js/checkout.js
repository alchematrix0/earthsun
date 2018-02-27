// Store API
// var serverURL = 'https://www.earthsun.ca'
// var stripe = Stripe('pk_live_wQ8l7gZKVSvCfc5P6E0Qq2Lq')
serverURL = 'http://localhost:3000'
var stripe = Stripe('pk_test_u77KpSLxrO1jKMrKyA9CZWhy');

// Retail: $34.99/jar for CocoBum, $39.99/jar for SunSheer, SunChild, and BioShield, and $59.99/jar for Beleia.
// Wholesale (minimum order is 1 case of 12 jars): $280/case for CocoBum, $320/case for SunSheer, SunChild, and BioShield, and $480/case for Beleia.


const inventory = {
  'ES-BEL-010': {
    thumb: 'thumb.png',
    price: 59.99,
    shipping: 4,
    title: 'Beleai',
    description: 'b stuff',
    quantity: 0
  },
  'ES-BIO-010': {
    thumb: 'thumb.png',
    price: 39.99,
    shipping: 4,
    title: 'Bio Shield',
    description: 'shield stuff',
    quantity: 0
  },
  'ES-SUN-008': {
    thumb: 'thumb.png',
    price: 39.99,
    shipping: 4,
    title: 'Sun Sheer',
    description: 'sheerly sun',
    quantity: 0
  },
  'ES-BUM-010': {
    thumb: 'thumb.png',
    price: 34.99,
    shipping: 6,
    title: 'Coco Bum',
    description: 'Coconut',
    quantity: 0
  },
  'ES-CHI-010': {
    thumb: 'thumb.png',
    price: 39.99,
    shipping: 4,
    title: 'Sun Child',
    description: 'Sun child',
    quantity: 0
  },
  'ES-5PK': {
    thumb: 'thumb.png',
    price: 75,
    shipping: 8,
    title: '5 Pack',
    description: 'Earth sun pack of 5: all of our signature products in one',
    quantity: 0
  },
  'BEL-BUM-2PK': {
    thumb: 'thumb.png',
    price: 35,
    shipping: 6,
    title: 'Beleai + CocoBum 2 pack',
    description: '',
    quantity: 0
  },
  'SUN-CHI-2PK': {
    thumb: 'thumb.png',
    price: 35,
    shipping: 6,
    title: 'Sun Sheer + Sun Child',
    description: 'Sun sheer and Sun Child two pack',
    quantity: 0
  },
  'BEL-BIO-SUN-3PK': {
    thumb: 'thumb.png',
    price: 20,
    shipping: 7,
    title: 'Beleai, Sun Sheer and Bio Shield 3 pack',
    description: '3 pack of our most popular products',
    quantity: 0
  },
  subtotal: {
    subtotal: 0,
    shipping: 0,
    grandTotal: 0
  }
}

removeItemFromCart = (item) => {

  let sku = item.target.dataset.sku
  cart[sku].quantity = 0
  cart['subtotal'].subtotal -= inventory[sku].price
  cart['subtotal'].shipping -= inventory[sku].shipping
  cart['subtotal'].grandTotal -= ((inventory[sku].price * 1.12) + inventory[sku].shipping)
  sessionStorage.setItem('cart', JSON.stringify(cart))

  total--
  let taxes = Number((cart.subtotal.subtotal * 0.12).toFixed(2))
  document.getElementById('subtotal').innerHTML = `Subtotal: <span class="is-pulled-right">${cart.subtotal.subtotal.toFixed(2)}</span>`
  document.getElementById('shipping').innerHTML = `Shipping: <span class="is-pulled-right">${cart.subtotal.shipping}</span>`
  document.getElementById('taxes').innerHTML = `GST/PST: <span class="is-pulled-right">${taxes}</span>`
  document.getElementById('total').innerHTML = `Order total: <span class="is-pulled-right">${(cart.subtotal.grandTotal).toFixed(2)}</span>`

  if (!total) {
    let noItems = document.createTextNode('There are no items in your cart!')
    document.getElementById('checkoutParent').appendChild(noItems)
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
let fadeOut = (el) => {
  el.style.opacity = 1;

  (function fade() {
    if ((el.style.opacity -= .05) < 0) {
      el.style.display = "none";
    } else {
      requestAnimationFrame(fade);
    }
  })();
}

let total = 0
let subtotal = 0

loadCartForCheckout = (cart = invetory) => {
  const container = document.getElementById('checkoutParent')
  const template = document.getElementById('checkoutTemplate')
  for (sku in cart) {
    if (cart[sku].quantity) {
      total++

      let item = template.cloneNode(true)
      item.id = `${sku}`
      container.appendChild(item)
      item.childNodes.forEach(node => {
        switch (node.className) {
          case 'media-left':
            node.lastElementChild.firstElementChild.setAttribute('src', `./css/img/thumbs/${sku}.png`)
            break
          case 'media-content':
            node.childNodes[1].firstElementChild.childNodes[1].innerHTML = `${cart[sku].quantity}x ${cart[sku].title}`
            node.childNodes[1].firstElementChild.childNodes[5].innerHTML = `$${cart[sku].price * cart[sku].quantity}`
            break
          case 'media-right':
            node.firstElementChild.setAttribute('data-sku', sku)
            node.firstElementChild.addEventListener('click', (e) => {
              let target = document.getElementById(`${e.target.dataset.sku}`)
              fadeOut(target)
              removeItemFromCart(e)
            })
            break
        }
      })
    }
  }
  if (total) {
    let taxes = Number((cart.subtotal.subtotal * 0.12).toFixed(2))
    container.removeChild(template)
    document.getElementById('subtotal').innerHTML = `Subtotal: <span class="is-pulled-right">${cart.subtotal.subtotal.toFixed(2)}</span>`
    document.getElementById('shipping').innerHTML = `Shipping: <span class="is-pulled-right">${cart.subtotal.shipping}</span>`
    document.getElementById('taxes').innerHTML = `GST/PST: <span class="is-pulled-right">${taxes}</span>`
    document.getElementById('total').innerHTML = `Order total: <span class="is-pulled-right">${(cart.subtotal.grandTotal).toFixed(2)}</span>`
  }
}
if (!sessionStorage.cart) { // no cart in session, set to blank
  sessionStorage.setItem('cart', JSON.stringify(inventory))
  sessionStorage.setItem('ts', Date.now())
} else { // cart in session, parse and load cart
  cart = JSON.parse(sessionStorage.cart)
  loadCartForCheckout(cart)
}

/*  ============== */
/*  === Stripe === */
/*  ============== */

var elements = stripe.elements();
var style = {
  base: {
    color: '#32325d',
    lineHeight: '18px',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4',
    }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};

const card = elements.create('card', {style})
card.mount('#card-element')
card.addEventListener('change', event => {
  var displayError = document.getElementById('card-errors')
  if (event.error) { displayError.textContent = event.error.messages
  } else { displayError.textContent = ''}
})

var myPostalCodeField = document.querySelector('input[name="postal"]')
myPostalCodeField.addEventListener('change', function(event) {
  card.update({value: {postalCode: event.target.value}})
})

var form = document.getElementById('payment-form')

form.addEventListener('submit', event => {
  event.preventDefault();
  const cart = JSON.parse(sessionStorage.cart)
  document.getElementById('submitPaymentButton').className = 'is-loading button is-success'
  const customer = {
    email: event.target.email.value,
    shipping: {
      name: `${event.target.name.value}`,
      address: {
        line1: `${event.target.address.value}`,
        city: `${event.target.city.value}`,
        state: `${event.target.state.value}`,
        country:  `${event.target.country.value}`,
        postal_code: `${event.target.postal.value}`
      }
    }
  }
  const order = []
  for (sku in cart) {
    if (cart[sku].quantity > 0) {
      let item = cart[sku]
      order.push({
        amount: item.price * 100,
        currency: 'cad',
        parent: sku,
        quantity: item.quantity,
        type: 'sku'
      })
    }
  }
  stripe.createToken(card).then(result => {
    if (result.error) {
      console.log('createToken hit an error')
      console.error(result.error)
      // Inform the user if there was an error
      var errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
    } else {
      // Send the token to your server
      console.dir(order)
      axios.post(`${serverURL}/order`, {customer, order, token: result.token},
        {
          headers:{
            'Content-type': 'application/json',
            'Accept': 'application/json'
          }
        }
      ).then(response => {
        sessionStorage.setItem('charge', JSON.stringify(response.data))
        window.location.href = './thankyou.html'
      }).catch(error => {
        console.error(error)
        sessionStorage.setItem('paymentError', JSON.stringify(error))
        window.location.href = './error.html'
      })
    }
  })
})
