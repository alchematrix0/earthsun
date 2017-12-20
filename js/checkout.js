// Store API
serverURL = 'http://localhost:3000/order'
const inventory = {
  'ES-BEL-010': {
    thumb: 'thumb.png',
    price: 20,
    shipping: 4,
    title: 'Beleai',
    description: 'b stuff',
    quantity: 0
  },
  'ES-BIO-010': {
    thumb: 'thumb.png',
    price: 20,
    shipping: 4,
    title: 'Bio Shield',
    description: 'shield stuff',
    quantity: 0
  },
  'ES-SUN-008': {
    thumb: 'thumb.png',
    price: 20,
    shipping: 4,
    title: 'Sun Sheer',
    description: 'sheerly sun',
    quantity: 0
  },
  'ES-BUM-010': {
    thumb: 'thumb.png',
    price: 20,
    shipping: 6,
    title: 'Coco Bum',
    description: 'Coconut',
    quantity: 0
  },
  'ES-CHI-010': {
    thumb: 'thumb.png',
    price: 20,
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
  cart['subtotal'].grandTotal -= (inventory[sku].price + inventory[sku].shipping)
  sessionStorage.setItem('cart', JSON.stringify(cart))

  total--
  document.getElementById('subtotal').innerHTML = `Subtotal: <span class="is-pulled-right">${cart.subtotal.subtotal || cart.subtotal.tally}</span>`
  document.getElementById('shipping').innerHTML = `Shipping: <span class="is-pulled-right">${cart.subtotal.shipping}</span>`
  document.getElementById('total').innerHTML = `Order total: <span class="is-pulled-right">${cart.subtotal.grandTotal}</span>`
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
              // cart[`${e.target.dataset.sku}`].quantity = 0
              // sessionStorage.setItem('cart', JSON.stringify(cart))
              // sessionStorage.setItem(`${e.target.dataset.sku}`, 0)
            })
            break
        }
      })
    }
  }
  if (total) {
    container.removeChild(template)
    document.getElementById('subtotal').innerHTML = `Subtotal: <span class="is-pulled-right">${cart.subtotal.subtotal || cart.subtotal.tally}</span>`
    document.getElementById('shipping').innerHTML = `Shipping: <span class="is-pulled-right">${cart.subtotal.shipping}</span>`
    document.getElementById('total').innerHTML = `Order total: <span class="is-pulled-right">${cart.subtotal.grandTotal}</span>`
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

var stripe = Stripe('pk_test_u77KpSLxrO1jKMrKyA9CZWhy');
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
});

// Handle form submission
var form = document.getElementById('payment-form');

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
      axios.post(serverURL, {customer, order, token: result.token},
        {
          headers:{
            'Content-type': 'application/json',
            'Accept': 'application/json'
          }
        }
      ).then(response => {
        console.dir('response')
        window.location.href = './thankyou.html'
        sessionStorage.setItem('charge', JSON.stringify(response.data))
      }).catch(error => {
        console.log('returned an error')
        window.location.href = './error.html'
        console.error(error)
      })
    }
  })
})
