jQuery(function($) {
  if (typeof BUCKET_URL != 'undefined') {
    var url = BUCKET_URL + location.search;
  } else {
    var url = location.href;
  }
  // set loading notice
  $('#listing').html('<h3>Loading <img src="http://assets.okfn.org/images/icons/ajaxload-circle.gif" /></h3>');
  $.get(url)
    .done(function(data) {
      // clear loading notice
      $('#listing').html('');
      var xml = $(data);
      var files = $.map(xml.find('Contents'), function(item) {
        item = $(item);
        return {
          Key: item.find('Key').text(),
          LastModified: item.find('LastModified').text(),
          Size: item.find('Size').text(),
        }
      });
      renderTable(files, xml.find('Prefix').text());
    })
    .fail(function(error) {
      alert('There was an error');
      console.log(error);
    });
});

function renderTable(files, prefix) {
  var cols = [ 45, 30, 15 ];
  var content = [];
  content.push(padRight('Last Modified', cols[1]) + '  ' + padRight('Size', cols[2]) + 'Key \n');
  content.push(new Array(cols[0] + cols[1] + cols[2] + 4).join('-') + '\n');
  
  if (prefix) {
    files.shift();
    var item = {
      Key: prefix.replace(/\/$/, '').split('/').slice(0, -1).concat('').join('/'),
      LastModified: '',
      Size: ''
    };
    renderRow(item, cols, '../', content);
  }
  
  $.each(files, function(idx, item) {
    var suffix = item.Key.substring(prefix.length);
    var slashCount = (suffix.split('/').length - 1);
    if (slashCount == 0 || (slashCount == 1 && suffix.indexOf('/') == suffix.length - 1)) {
      renderRow(item, cols, suffix, content);
    }
  });

  document.getElementById('listing').innerHTML = '<pre>' + content.join('') + '</pre>';
}

function renderRow(item, cols, keyText, content) {
  var key = item.Key;
  var row = '';
  row += padRight(item.LastModified, cols[1]) + '  ';
  row += padRight(item.Size, cols[2]);
  row += '<a href="'; 
  row += key && key.indexOf('/') == -1 ? key : location.href.split('?')[0] + '?prefix=' + key;
  row += '">' + keyText + '</a>';
  content.push(row + '\n');
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

