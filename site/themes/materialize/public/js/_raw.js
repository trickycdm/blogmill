$(function () {
  M.AutoInit()
  // mail handler
  $('#form').submit(function (e) {
    e.preventDefault()
    var fd = $('#frmContact').serialize()
    $.ajax({
      url: '/mail',
      type: 'POST',
      dataType: 'json',
      data: fd,
      success: function (resp) {
        if (resp.control === true) swal('', 'Thanks, I\'ll be in touch asap.', 'success')
        else swal('', 'Sorry there was a problem sending your email. Please contact us directly at hello@dogfishmobile.com', 'warning')
      },
      error: function (data) {
        swal('', 'Sorry we could not send your email, please contact us directly at hello@dogfishmobile.com', 'warning')
      }
    })
  })

  $('.carousel.carousel-slider').carousel({
    fullWidth: true,
    duration: 400,
    indicators: true
  })
  setTimeout(autoplay, 4500)

  function autoplay () {
    $('.carousel').carousel('next')
    setTimeout(autoplay, 4500)
  }
  $('.sidenav').sidenav()
})
