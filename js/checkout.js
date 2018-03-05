// Store API
// var serverURL = 'https://www.earthsun.ca'
// var stripe = Stripe('pk_live_wQ8l7gZKVSvCfc5P6E0Qq2Lq')
serverURL = 'http://localhost:3000'
var stripe = Stripe('pk_test_u77KpSLxrO1jKMrKyA9CZWhy');

const inventory = {
  'ES-BEL-010': {
    thumb: 'thumb.png',
    price: 59.99,
    shipping: 4,
    title: 'Beleai',
    description: 'Beleai skin cleanser',
    quantity: 0
  },
  'ES-BIO-010': {
    thumb: 'thumb.png',
    price: 39.99,
    shipping: 4,
    title: 'Bio Shield',
    description: 'Bio Shield: sun protection',
    quantity: 0
  },
  'ES-SUN-008': {
    thumb: 'thumb.png',
    price: 39.99,
    shipping: 4,
    title: 'Sun Sheer',
    description: 'Sun sheer: sun protection',
    quantity: 0
  },
  'ES-BUM-010': {
    thumb: 'thumb.png',
    price: 34.99,
    shipping: 4,
    title: 'Coco Bum',
    description: 'Diaper ointment',
    quantity: 0
  },
  'ES-CHI-010': {
    thumb: 'thumb.png',
    price: 39.99,
    shipping: 4,
    title: 'Sun Child',
    description: 'Sun child: sun protection for children',
    quantity: 0
  },
  // 'ES-5PK': {
  //   thumb: 'thumb.png',
  //   price: 75,
  //   shipping: 8,
  //   title: '5 Pack',
  //   description: 'Earth sun pack of 5: all of our signature products in one',
  //   quantity: 0
  // },
  // 'BEL-BUM-2PK': {
  //   thumb: 'thumb.png',
  //   price: 35,
  //   shipping: 6,
  //   title: 'Beleai + CocoBum 2 pack',
  //   description: '',
  //   quantity: 0
  // },
  // 'SUN-CHI-2PK': {
  //   thumb: 'thumb.png',
  //   price: 35,
  //   shipping: 6,
  //   title: 'Sun Sheer + Sun Child',
  //   description: 'Sun sheer and Sun Child two pack',
  //   quantity: 0
  // },
  // 'BEL-BIO-SUN-3PK': {
  //   thumb: 'thumb.png',
  //   price: 20,
  //   shipping: 7,
  //   title: 'Beleai, Sun Sheer and Bio Shield 3 pack',
  //   description: '3 pack of our most popular products',
  //   quantity: 0
  // },
  coupon: {
    applied: false,
    name: '',
    rate: 0,
    value: 0
  },
  subtotal: {
    subtotal: 0,
    shipping: 0,
    gstPst: 0,
    grandTotal: 0
  }
}

removeItemFromCart = (item) => {

  let sku = item.target.dataset.sku
  cart = JSON.parse(sessionStorage.cart)
  cart[sku].quantity = 0
  cart.subtotal = calculateSubtotals(cart, cart.coupon.applied ? cart.coupon : false)

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

calculateSubtotals = (cart, coupon) => {
  let subtotal = {
    subtotal: 0,
    gstPst: 0,
    shipping: 0,
    grandTotal: 0
  }
  for (sku in cart) {
    if (cart[sku].quantity) {
      let base = cart[sku].quantity * cart[sku].price
      if (coupon) {
        base -= base * coupon.rate
      }
      subtotal.subtotal += base
      subtotal.gstPst += base * 0.12
      subtotal.shipping = subtotal.subtotal > 50 ? 0 : 25
      grandTotal = subtotal.subtotal + subtotal.gstPst + subtotal.shipping
    }
  }
  subtotal.grandTotal = subtotal.subtotal + subtotal.gstPst + subtotal.shipping
  return subtotal
}


let total = 0
let subtotal = 0

// Load Cart For Checkout (cart initialized to invetory object)

loadCartForCheckout = (cart = invetory) => { // view layer items list, then, if total, update subtotal/totals view
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
    container.removeChild(template)
    document.getElementById('coupon-code').classList.toggle('is-hidden')
    document.getElementById('subtotal').innerHTML = `Subtotal: <span class="is-pulled-right">${cart.subtotal.subtotal.toFixed(2)}</span>`
    document.getElementById('shipping').innerHTML = `Shipping: <span class="is-pulled-right">${cart.subtotal.shipping.toFixed(2)}</span>`
    document.getElementById('taxes').innerHTML = `GST/PST: <span class="is-pulled-right">${cart.subtotal.gstPst.toFixed(2)}</span>`
    document.getElementById('total').innerHTML = `Order total: <span class="is-pulled-right">${(cart.subtotal.grandTotal).toFixed(2)}</span>`
    document.getElementById('coupon-form').addEventListener('submit', function(e) {
      e.preventDefault()
      if (sha256(e.target.code.value.toLowerCase()) === 'abba4522e51561ca9cf09034f088ba219fca11e413e16d4c07562195b1863ff9') {
        cart = JSON.parse(sessionStorage.cart)
        cart.coupon.applied = true
        cart.coupon.name = e.target.code.value.toLowerCase()
        cart.coupon.rate = 0.1
        cart.coupon.value = cart.subtotal.subtotal * 0.1
        cart.subtotal = calculateSubtotals(cart, cart.coupon)
        sessionStorage.setItem('cart', JSON.stringify(cart))
        document.getElementById('coupon-active').classList = 'help'
        document.getElementById('coupon-failed').classList = 'help is-hidden'
        document.getElementById('subtotal').innerHTML = `Subtotal: <span class="is-pulled-right">${cart.subtotal.subtotal.toFixed(2)}</span>`
        document.getElementById('total').innerHTML = `Order total: <span class="is-pulled-right">${(cart.subtotal.grandTotal).toFixed(2)}</span>`
      } else {
        document.getElementById('coupon-active').classList = 'help is-hidden'
        document.getElementById('coupon-failed').classList = ('help')
      }
    })
  }
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
  }
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

// run this module
// check session, call load cart if applicable otherwise init empty
if (!sessionStorage.cart) { // no cart in session, set to blank
  sessionStorage.setItem('cart', JSON.stringify(inventory))
  sessionStorage.setItem('ts', Date.now())
} else { // cart in session, parse and load cart
  cart = JSON.parse(sessionStorage.cart)
  loadCartForCheckout(cart)
}
