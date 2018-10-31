var serverURL = 'https://www.earthsun.ca'
// var stripe = Stripe('pk_live_wQ8l7gZKVSvCfc5P6E0Qq2Lq')

// var serverURL = 'http://localhost:3000'
var stripe = Stripe('pk_test_u77KpSLxrO1jKMrKyA9CZWhy');
var testMode = true

var elements = stripe.elements();
if (serverURL.includes('localhost') || testMode) {
  window.addEventListener('load', function () {
    let s = document.getElementById('isTest')
    s.innerHTML = (' (test mode)')
  })
}
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

const card = elements.create('card', {style, hidePostalCode: true})
card.addEventListener('change', event => {
  var displayError = document.getElementById('card-errors')
  if (event.error) { displayError.textContent = event.error.messages
  } else { displayError.textContent = ''}
})
card.mount('#card-element')

var sameAddressCheckbox = document.getElementById('sameAddressCheckbox')
sameAddressCheckbox.addEventListener('change', function () {
  if (document.getElementById('sameAddressCheckbox').checked) {
    document.getElementById('billingAddressFields').classList.add('is-invisible')
  } else {
    document.getElementById('billingAddressFields').classList.remove('is-invisible')
  }
})
var returnCustomer = false

var form = document.getElementById('createCustomer-form')

form.addEventListener('submit', event => {
  let inputs = event.target
  event.preventDefault();

  document.getElementById('submitCreateCustomer').className = 'is-loading button is-info'

  const address = {
    line1: `${inputs.shippingAddress.value}`,
    city: `${inputs.city.value}`,
    state: `${inputs.state.value}`,
    country:  `${inputs.country.value}`,
    postal_code: `${inputs.postalCode.value}`
  }

  const billing = document.getElementById('sameAddressCheckbox').checked ? address : {
    line1: `${inputs.addressBilling.value || inputs.shippingAddress.value}`,
    city: `${inputs.cityBilling.value || inputs.city.value}`,
    state: `${inputs.stateBilling.value || inputs.state.value}`,
    country:  `${inputs.country.value}`,
    postal_code: `${inputs.postalCodeBilling.value || inputs.postalCode.value}`
  }

  const customer = {
    email: inputs.email.value,
    description: `Earth sun wholesale customer: ${inputs.company.value}`,
    shipping: {
      name: `${inputs.company.value}`,
      phone: `${inputs.phone.value}`,
      address
    },
    metadata: {
      contactPhone: `${inputs.phone.value}`,
      contactName: `${inputs.name.value}`,
      details: inputs.details.value,
      billingLine1: billing.line1,
      billingPostal: billing.postal_code,
      defer: false
    }
  }

  sessionStorage.setItem('wholesaleAccount', JSON.stringify(customer))

  card.update({value: {postalCode: billing.postal_code}})
  stripe.createToken(card)
  .then(response => {
    console.dir(response)
    customer.source = response.token.id
    axios.post(`${serverURL}/newcustomer`, {customer, billing, token: response.token},
      {
        'Content-type': 'application/json',
        'Accept': 'application/json'
      }
    )
    .then(response => {
      console.log('return from post to server')
      console.dir(response)
      if (response.data.statusCode) {
        throw new Error(response.data.message)
      }
      const newCustomer = Object.assign({}, response.data, { billing })
      sessionStorage.setItem('wholesaleAccount', JSON.stringify(newCustomer))
      if (response.data.sources.data.length) {
        window.location.href = './accountCreated.html'
      } else {
        window.location.href = './addPaymentSource.html'
      }
    })
    .catch(error => {
      document.getElementById('submitCreateCustomer').className = 'button is-info'
      console.error(error)
      var errorElement = document.getElementById('card-errors')
      errorElement.textContent = error.message
    })
  })
  .catch(error => {
    document.getElementById('submitCreateCustomer').className = 'button is-info'
    console.log('token creation error')
    var errorElement = document.getElementById('card-errors')
    errorElement.textContent = error.message
  })
})
