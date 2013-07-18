$('#poke-nickname').typeahead({
  minLength: 3,
  source: function(query, callback) {
    console.log(query);
    $.get('/player/nicksearch', { q: query }, function(data) {
      console.log(data);
      callback(data);
    });
  }
});
