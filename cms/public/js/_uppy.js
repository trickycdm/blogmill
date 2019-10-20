// UPPY
const Uppy = require('@uppy/core')
const XHRUpload = require('@uppy/xhr-upload')
const ProgressBar = require('@uppy/progress-bar')
const Dashboard = require('@uppy/dashboard')

// restrictions object needs to be specified inside the new Uppy instance
const uppy = new Uppy({
  debug: false,
  autoProceed: true,
  restrictions: {
    maxFileSize: 1000000,
    maxNumberOfFiles: 1,
    allowedFileTypes: ['image/*', 'video/*']
  }
})
const id = $('#id').val()

// only init uppy if there is an uppy handle on this page.
if ($('.image-modal-btn').length > 0) {
  uppy.use(Dashboard, {
    debug: true,
    trigger: '.image-modal-btn',
    inline: false,
    target: '.upp-dashboard-anchor',
    replaceTargetContent: true,
    note: '1 image or video only, up to 1 MB',
    maxHeight: 450,
    metaFields: [
      {id: 'license', name: 'License', placeholder: 'specify license'},
      {id: 'caption', name: 'Caption', placeholder: 'describe what the image is about'}
    ]
  })
  uppy.use(XHRUpload, {
    // Endpoint is generated dynamically as the Id must be passed when updating an existing entry
    // Uppy provides no functionality which allows you to pass your own data, so this solution is required
    endpoint: `/cms/image-upload${(id && window.location.pathname.includes('cms/media/')) ? `/${id}` : ''}`,
    formData: true,
    fieldName: 'file',
    metaFields: ['name', 'type']
  })
  uppy.use(ProgressBar, {
    target: 'body',
    fixed: true,
    hideAfterFinish: false
  })
  uppy.run()

  uppy.on('upload-success', (file, body) => {
    if (window.location.pathname === '/cms/media/new') {
      // Inserting from media page
      window.location.href = `cms/media/${body.recordId}`
    } else if (window.location.pathname.includes('cms/media/')) {
      // Updating from media page
      $('#file_name').val(body.fileName)
      let preview = `<img src="${body.previewLocation}" class="generated-image-preview">`
      $('#imageThumbnailPreview').html(preview)
    } else {
      // Inserting from gallery modal
      $.ajax({
        url: '/api/get-all-images',
        type: 'GET',
        dataType: 'json'
      })
        .done(function (resp) {
          const images = resp.data.media.map(function (mediaItem) {
            return `<div style="background-image: url(${resp.data.basePath}/${mediaItem.file_name});" class="image-gallery__thumbnail" data-image-id="${mediaItem.id}" data-image-link="${resp.data.basePath}/${mediaItem.file_name}"></div>`
          }).join()
          $('#imageGalleryImageContainer').html(images)
          $('#imageGalleryModal').modal('show')
        })
        .fail(function (err) {
          $('#imageGalleryImageContainer').text('Unable to load media')
          $('#imageGalleryModal').modal('show')
          console.log(err)
        })
    }
    const dashboard = uppy.getPlugin('Dashboard')
    if (dashboard.isModalOpen()) {
      dashboard.closeModal()
    }
  })
}

