jQuery(function($) {
  if (typeof BUCKET_URL != 'undefined') {
    var url = BUCKET_URL;
  } else {
    var url = location.protocol + '//' + location.hostname;
  }
  $.get(url)
    .done(function(data) {
      var xml = $(data);
      var files = $.map(xml.find('Contents'), function(item) {
        item = $(item);
        return {
          Key: item.find('Key').text(),
          LastModified: item.find('LastModified').text(),
          Size: item.find('Size').text(),
        }
      });
      renderTable(files);
    })
    .fail(function(error) {
      alert('There was an error');
      console.log(error);
    });
});

function renderTable(files) {
  var cols = [ 45, 30, 15 ];
  var content = padRight('Last Modified', cols[1]) + '  ' + padRight('Size', cols[2]) + 'Key \n';
  content += new Array(cols[0] + cols[1] + cols[2] + 4).join('-') + '\n';
  $.each(files, function(idx, item) {
    var key = item.Key;
    var row = '';
    row += padRight(item.LastModified, cols[1]) + '  ';
    row += padRight(item.Size, cols[2]);
    row += '<a href="' + key + '">' + item.Key + '</a>';
    content += row + '\n';
  });

  document.getElementById('listing').innerHTML = '<pre>' + content + '</pre>';
}

function padRight(padString, length) {
  var str = padString.slice(0, length-3);
  if (padString.length > str.length) {
    str += '...';
  }
  while (str.length < length) {
    str = str + ' ';
  }
  return str;
}

