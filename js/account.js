var serverURL = 'https://www.earthsun.ca'
var stripe = Stripe('pk_live_wQ8l7gZKVSvCfc5P6E0Qq2Lq');


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
var returnCustomerCheckbox = document.getElementById('returnCustomerCheckbox')
returnCustomerCheckbox.addEventListener('change', function () {
  if (document.getElementById('returnCustomerCheckbox').checked) {
    document.getElementById('cardField').classList.add('is-invisible')
  } else {
    document.getElementById('cardField').classList.remove('is-invisible')
  }
})

var form = document.getElementById('createCustomer-form')

form.addEventListener('submit', event => {

  event.preventDefault();

  returnCustomer = document.getElementById('returnCustomerCheckbox').checked
  document.getElementById('submitCreateCustomer').className = 'is-loading button is-success'

  const address = {
    line1: `${event.target.shippingAddress.value}`,
    city: `${event.target.city.value}`,
    state: `${event.target.state.value}`,
    country:  `${event.target.country.value}`,
    postal_code: `${event.target.postalCode.value}`
  }

  const billing = document.getElementById('sameAddressCheckbox').checked ? address : {
    line1: `${event.target.addressBilling.value || event.target.shippingAddress.value}`,
    city: `${event.target.cityBilling.value || event.target.city.value}`,
    state: `${event.target.stateBilling.value || event.target.state.value}`,
    country:  `${event.target.country.value}`,
    postal_code: `${event.target.postalCodeBilling.value || event.target.postalCode.value}`
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

  sessionStorage.setItem('wholesaleAccount', JSON.stringify(customer))

  if (!returnCustomer) { // create token and create new customer server side
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
        const newCustomer = Object.assign({}, response.data, { billing })
        sessionStorage.setItem('wholesaleAccount', JSON.stringify(newCustomer))
        if (response.data.sources.data.length) {
          window.location.href = './accountCreated.html'
        } else {
          window.location.href = './addPaymentSource.html'
        }
      })
      .catch(error => {
        document.getElementById('submitCreateCustomer').className = 'button is-success'
        console.error(error)
        // update UI to notify user of error
        window.location.href = './error.html'
      })
    })
    .catch(error => {
      document.getElementById('submitCreateCustomer').className = 'button is-success'
      console.log('token creation error')
      console.error(error)
    })
  } else { // is a customer, post to update customer account
    axios.post(`${serverURL}/newcustomer`, {customer, billing, token: null},
    {
      headers:{
        'Content-type': 'application/json',
        'Accept': 'application/json'
      }
    }).then(response => {
      const newCustomer = Object.assign({}, response.data, { billing })
      sessionStorage.setItem('wholesaleAccount', JSON.stringify(newCustomer))
      if (response.data.sources.data.length) {
        window.location.href = './accountCreated.html'
      } else {
        window.location.href = './addPaymentSource.html'
      }
    }).catch(error => {
      document.getElementById('submitCreateCustomer').className = 'button is-success'
      console.error(error)
      window.location.href = './error.html'
    })
  }


})
