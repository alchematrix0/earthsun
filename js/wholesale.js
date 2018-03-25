var serverURL = 'https://www.earthsun.ca'
// var stripe = Stripe('pk_live_wQ8l7gZKVSvCfc5P6E0Qq2Lq')
// var serverURL = 'http://localhost:3000'
var stripe = Stripe('pk_test_u77KpSLxrO1jKMrKyA9CZWhy');

var form = document.getElementById('wholesale-order')

var db = document.getElementsByClassName('delete')
for (var i = 0; i < db.length; i++) {
  db[i].addEventListener('click', function (e) {
    document.getElementById(e.target.dataset.item).remove()
  })
}
let catalog = {
  'ES-BEL-010': {title: 'Belereai 12 pack', quantity: 0, wholesaleAmount: 12, price: 480},
  'ES-BIO-010': {title: 'Bio Shield 12 pack', quantity: 0, wholesaleAmount: 12, price: 320},
  'ES-SUN-008': {title: 'Sun Shield 12 pack', quantity: 0, wholesaleAmount: 12, price: 320},
  'ES-BUM-010': {title: 'Coco Bum 12 pack', quantity: 0, wholesaleAmount: 12, price: 280},
  'ES-CHI-010': {title: 'Sun Child 12 pack', quantity: 0, wholesaleAmount: 12, price: 320}
  // 'ES-5PK': {title: '5 Pack half dozen', quantity: 0, wholesaleAmount: 6, price: 900},
  // 'BEL-BUM-2PK': {title: '2 pack: Belerai + Cocobum half dozen', quantity: 0, wholesaleAmount: 6, price: 240},
  // 'SUN-CHI-2PK': {title: '2 pack: Sun Shielf + Sun Child half dozen', quantity: 0, wholesaleAmount: 6, price: 240},
  // 'BEL-BIO-SUN-3PK': {title: '3 pack Belerai BioShield SunSheer half dozen', quantity: 0, wholesaleAmount: 6, price: 360}
}
if (sessionStorage.wholesaleAccount) {
  let account = JSON.parse(sessionStorage.wholesaleAccount)
  document.getElementById('accountNumberInput').value = account.id
  document.getElementById('accountEmailInput').value = account.email
}

if (localStorage.earthsunAccountId) {
  document.getElementById('accountNumberInput').value = localStorage.earthsunAccountId
  document.getElementById('accountEmailInput').value = localStorage.earthsunAccountEmail
}

form.addEventListener('submit', event => {

  event.preventDefault();
  for (var item in catalog) {
    catalog[item].quantity = form.elements[item] ? Number(form.elements[item].value) : 0
  }
  const customer = {
    email: event.target.email.value,
    id: event.target.account.value,
    details: form.elements.details.value
  }
  if (event.target.saveAccountLocally.checked) {
    localStorage.setItem('earthsunAccountId', customer.id)
    localStorage.setItem('earthsunAccountEmail', customer.email)
  }
  console.dir(customer)
  let order = []
  for (sku in catalog) {
    if (catalog[sku].quantity > 0) {
      let item = catalog[sku]
      order.push({
        amount: item.price * 100,
        currency: 'cad',
        parent: sku,
        quantity: item.quantity * item.wholesaleAmount,
        type: 'sku'
      })
    }
  }
  console.dir(order)
  document.getElementById('submitCreateWholesaleOrder').className = 'button is-loading is-primary'
  axios.post(`${serverURL}/retrieveCustomer`, {customer},
    {
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json'
      }
    }
  )
  .then(response => {
    console.log('return from post to server')
    console.dir(response)
    sessionStorage.setItem('wholesaleAccount', JSON.stringify(response.data.customer))
    if (response.data.customer.sources.data.length) {
      console.log('got a source')
      axios.post(`${serverURL}/createWholesaleOrder`, {customer: response.data.customer, order},
        {
          headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json'
          }
        }
      )
      .then(response => {
        sessionStorage.setItem('cart', JSON.stringify(catalog))
        window.location.href = './thankyou.html'
      })
      .catch(error => {
        window.location.href = './error.html'
      })
    } else {
      alert('No payment method found! Please complete account setup')
      window.location.href = '.account/.html'
    }
  })
  .catch(error => {
    document.getElementById('submitCreateWholesaleOrder').className = 'button is-danger'
    document.getElementById('submitCreateWholesaleOrder').innerHTML = 'failed'
    document.getElementById('errorBox').innerHTML = `Error message: ${error.message}`
    console.error(error)
    // update UI to notify user of error
  })
})
