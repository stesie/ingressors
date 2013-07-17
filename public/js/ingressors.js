$('#nick-registration').on('submit', function(ev) {
  ev.preventDefault();

  $.ajax({
    type: 'POST',
    url: '/player/nickname',
    data: $('#nick-registration').serialize(),
    success: function() {
      $('#nick-registration input[name="nickname"]').prop('disabled', true);
    }
  });
});
