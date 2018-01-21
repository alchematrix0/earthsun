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

// card.mount('#card-element')

card.addEventListener('change', event => {
  var displayError = document.getElementById('card-errors')
  if (event.error) { displayError.textContent = event.error.messages
  } else { displayError.textContent = ''}
})

// var myPostalCodeField = document.querySelector('input[name="postal"]')
// myPostalCodeField.addEventListener('change', function(event) {
//   card.update({value: {postalCode: event.target.value}})
// })

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
  const customer = {
    email: event.target.email.value,
    description: `Earth sun wholesale customer: ${event.target.company.value}`,
    shipping: {
      name: `${event.target.company.value}`,
      phone: `${event.target.phone.value}`,
      address: {
        line1: `${event.target.shippingAddress.value}`,
        city: `${event.target.city.value}`,
        state: `${event.target.state.value}`,
        country:  `${event.target.country.value}`,
        postal_code: `${event.target.postalCode.value}`
      }
    },
    metadata: {
      contactPhone: `${event.target.phone.value}`,
      contactName: `${event.target.name.value}`,
      role: event.target.department.value,
      details: event.target.details.value
    }
  }
  const billing = {
    address: {
      line1: `${event.target.addressBilling.value || event.target.shippingAddress.value}`,
      city: `${event.target.cityBilling.value || event.target.city.value}`,
      state: `${event.target.stateBilling.value || event.target.state.value}`,
      country:  `${event.target.country.value}`,
      postal_code: `${event.target.postalCodeBilling.value || event.target.postalCode.value}`
    }
  }
  // stripe.createToken(card).then(result => {
  //   if (result.error) {
  //     console.log('createToken hit an error')
  //     console.error(result.error)
  //     // Inform the user if there was an error
  //     var errorElement = document.getElementById('card-errors');
  //     errorElement.textContent = result.error.message;
  //   } else {
  //     // Send the token to your server
  //     console.dir(order)
  //     axios.post(serverURL, {customer, order, token: result.token},
  //       {
  //         headers:{
  //           'Content-type': 'application/json',
  //           'Accept': 'application/json'
  //         }
  //       }
  //     ).then(response => {
  //       sessionStorage.setItem('charge', JSON.stringify(response.data))
  //       window.location.href = './thankyou.html'
  //     }).catch(error => {
  //       console.error(error)
  //       sessionStorage.setItem('paymentError', JSON.stringify(error))
  //       window.location.href = './error.html'
  //     })
  //   }
  // })

  axios.post(serverURL, {customer, billing, member: Boolean(event.target.memberYes.checked)},
    {
      headers:{
        'Content-type': 'application/json',
        'Accept': 'application/json'
      }
    }
  ).then(response => {
    console.dir(response)
    window.location.href = './completeSignup.html'
  }).catch(error => {
    console.error(error)
    window.location.href = './error.html'
  })

})
