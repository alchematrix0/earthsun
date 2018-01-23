var serverURL = 'http://localhost:3000/newcustomer'
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


card.addEventListener('change', event => {
  var displayError = document.getElementById('card-errors')
  if (event.error) { displayError.textContent = event.error.messages
  } else { displayError.textContent = ''}
})

var sameAddressCheckbox = document.getElementById('sameAddressCheckbox')
sameAddressCheckbox.addEventListener('change', function () {
  if (document.getElementById('sameAddressCheckbox').checked) {
    document.getElementById('billingAddressFields').classList.add('is-invisible')
  } else {
    document.getElementById('billingAddressFields').classList.remove('is-invisible')
  }
})

var form = document.getElementById('createCustomer-form')

form.addEventListener('submit', event => {
  event.preventDefault();
  document.getElementById('submitCreateCustomer').className = 'is-loading button is-success'
  const address = {
    line1: `${event.target.shippingAddress.value}`,
    city: `${event.target.city.value}`,
    state: `${event.target.state.value}`,
    country:  `${event.target.country.value}`,
    postal_code: `${event.target.postalCode.value}`
  }
  const billing = document.getElementById('sameAddressCheckbox').checked ? address : {
    address: {
      line1: `${event.target.addressBilling.value || event.target.shippingAddress.value}`,
      city: `${event.target.cityBilling.value || event.target.city.value}`,
      state: `${event.target.stateBilling.value || event.target.state.value}`,
      country:  `${event.target.country.value}`,
      postal_code: `${event.target.postalCodeBilling.value || event.target.postalCode.value}`
    }
  }
  const customer = {
    email: event.target.email.value,
    description: `Earth sun wholesale customer: ${event.target.company.value}`,
    shipping: {
      name: `${event.target.company.value}`,
      phone: `${event.target.phone.value}`,
      address
    },
    metadata: {
      contactPhone: `${event.target.phone.value}`,
      contactName: `${event.target.name.value}`,
      role: event.target.department.value,
      details: event.target.details.value,
      billingLine1: billing.line1,
      billingPostal: billing.postal_code
    }
  }

  axios.post(serverURL, {customer, billing, member: Boolean(event.target.memberYes.checked)},
    {
      headers:{
        'Content-type': 'application/json',
        'Accept': 'application/json'
      }
    }
  ).then(response => {
    const newCustomer = Object.assign({}, response.data, { billing })
    sessionStorage.setItem('customer', JSON.stringify(newCustomer))
    if (response.data.sources.data.length) {
      window.location.href = './accountCreated.html'
    } else {
      window.location.href = './addPaymentSource.html'
    }
  }).catch(error => {
    console.error(error)
    window.location.href = './error.html'
  })

})
