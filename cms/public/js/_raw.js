$.get('/api/get-all-images', function (resp) {
  let mediaItems = resp.data.media.map(function (image) {
    image.title = image.name
    image.value = image.file_name
    return image
  })
  tinymce.init({
    selector: 'textarea.editor',
    themes: 'modern',
    height: 450,
    plugins: 'paste image imagetools preview lists advlist media wordcount link',
    paste_as_text: true,
    image_list: mediaItems,
    image_prepend_url: '/cms/public/uploads/',
    document_base_url: '/'
  })
})

$(function () {
  // set the correct active menu item
  let activeMenuItem = sessionStorage.getItem('activeMenuItem')
  $('.side-nav__list-item > a[href="' + activeMenuItem + '"').parent().addClass('active')
  // init BS tooltips
  $('[data-toggle="tooltip"]').tooltip()

  // init bs popovers
  $('[data-toggle="popover"]').popover({html: true})

  // control the back button clicks
  $('.btn-go-back').on('click', function () { window.history.back() })

  // control menu item persistence
  let $menuItems = $('.side-nav__list-item')
  $menuItems.on('click', function () { sessionStorage.setItem('activeMenuItem', $(this).find('a').eq(0).attr('href')) })

  // post form data
  let $frm = $('#form')
  $frm.on('submit', function (e) {
    e.preventDefault()
    // force tinyMCE to update the original textarea before we serialize the main form
    tinyMCE.triggerSave()
    let frmData = $frm.serialize()
    addOrUpdateItem(frmData)
  })
  /**
   * Image gallery modal controls
   */
  $('.btn-gallery-modal').on('click', function () {
    localStorage.setItem('input-target', $(this).data('input-target'))
    localStorage.setItem('preview-target', $(this).data('preview-target'))
    getAllImages()
      .then(function (resp) {
        const images = resp.data.media.map(function (mediaItem) {
          return `<div style="background-image: url(${resp.data.basePath}/${mediaItem.file_name});" class="image-gallery__thumbnail" data-image-id="${mediaItem.id}" data-image-link="${resp.data.basePath}/${mediaItem.file_name}"></div>`
        }).join()
        $('#imageGalleryImageContainer').html(images)
        $('#imageGalleryModal').modal('show')
      })
      .catch(function (err) {
        $('#imageGalleryImageContainer').text('Unable to load media')
        $('#imageGalleryModal').modal('show')
        console.log(err)
      })
  })

  $('#imageGalleryImageContainer').on('click', '.image-gallery__thumbnail', function () {
    $('.image-gallery__thumbnail').removeClass('selected')
    $(this).addClass('selected')
  })

  $('#imageGalleryAddImageBtn').on('click', function () {
    const $selectedImage = $('.image-gallery__thumbnail.selected')
    const inputTarget = localStorage.getItem('input-target')
    const previewTarget = localStorage.getItem('preview-target')
    const imageLink = $selectedImage.data('image-link')
    const imageId = $selectedImage.data('image-id')
    $(`input[name="${inputTarget}"]`).val(imageId)
    console.log(previewTarget)
    $('.preview-target__' + previewTarget).html(`<img src="${imageLink}" alt="feature image preview" class="image-preview">`)
  })

  $('.btn-feature_image__remove').on('click', function () {
    $('input[name="feature_image"]').val('')
    $('.image-preview-container').html('')
  })
  /**
   * END image gallery modal controls
   */
}) // end doc red

/**
 * Handle the regular fields page form submissions
 * @param frmData
 */
function addOrUpdateItem (frmData) {
  $.ajax({
    type: 'POST',
    data: frmData,
    dataType: 'json',
    success: function (resp) {
      if (resp.control) swal('', '', 'success').then((value) => {window.location = resp.redirect })
      else if (resp.error) swal('Oops', `${resp.message}: ${resp.error}`, 'error')
      else swal('Oops', `${resp.message}`, 'error')
    },
    error: function (e) {
      console.log(e)
      swal('Error', 'Could not add or update item: ' + e.message, 'error')
    }
  })
}

function getAllImages () {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/api/get-all-images',
      type: 'GET',
      dataType: 'json'
    })
      .done(function (data) { resolve(data) })
      .fail(function (xhr) { reject(xhr) })
  })
}


