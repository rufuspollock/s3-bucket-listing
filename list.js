if (typeof S3BL_IGNORE_PATH == 'undefined' || S3BL_IGNORE_PATH!=true) {
  var S3BL_IGNORE_PATH = false;
}
jQuery(function($) {
  if (typeof BUCKET_URL != 'undefined') {
    var s3_rest_url = BUCKET_URL;
  } else {
    var s3_rest_url = location.protocol + '//' + location.hostname;
  }

  s3_rest_url += '?delimiter=/';

  // handle pathes / prefixes - 2 options
  //
  // 1. Using the pathname
  // {bucket}/{path} => prefix = {path}
  // 
  // 2. Using ?prefix={prefix}
  //
  // Why both? Because we want classic directory style listing in normal
  // buckets but also allow deploying to non-buckets
  //
  // Can explicitly disable using path (useful if *not* deploying to an s3
  // bucket) by setting
  //
  // S3BL_IGNORE_PATH = true
  var rx = /.*[?&]prefix=([^&]+)(&.*)?$/;
  var prefix = '';
  if (S3BL_IGNORE_PATH==false) {
    var prefix = location.pathname.replace(/^\//, '');
  }
  var match = location.search.match(rx);
  if (match) {
    prefix = match[1];
  }
  if (prefix) {
    // make sure we end in /
    var prefix = prefix.replace(/\/$/, '') + '/';
    s3_rest_url += '&prefix=' + prefix;
  }

  // set loading notice
  $('#listing').html('<h3>Loading <img src="http://assets.okfn.org/images/icons/ajaxload-circle.gif" /></h3>');
  $.get(s3_rest_url)
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
          Type: 'file'
        }
      });
      var directories = $.map(xml.find('CommonPrefixes'), function(item) {
        item = $(item);
        return {
          Key: item.find('Prefix').text(),
          LastModified: '',
          Size: '0',
          Type: 'directory'
        }
      });
      var outprefix = $(xml.find('Prefix')[0]).text();
      renderTable(files.concat(directories), outprefix);
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
  
  // add the ../ at the start of the directory listing
  // and remove first item (which will be that directory)
  if (prefix) {
    files.shift();
        
    var up = prefix.replace(/\/$/, '').split('/').slice(0, -1).concat('').join('/'), // one directory up
        item = { 
          Key: up,
          LastModified: '',
          Size: '',
          keyText: '../',
          href: S3BL_IGNORE_PATH ? '?prefix=' + up : '../'
        },
        row = renderRow(item, cols);
    content.push(row + '\n');
  }
  
  $.each(files, function(idx, item) {
    // strip off the prefix
    item.keyText = item.Key.substring(prefix.length);
    if (item.Type === 'directory') {
      if (S3BL_IGNORE_PATH) {
        item.href = location.protocol + '//' + location.hostname + location.pathname + '?prefix=' + item.Key;
      } else {
        item.href = item.keyText;
      }
    } else {
      // TODO: need to fix this up for cases where we are on site not bucket
      // in that case href for a file should point to s3 bucket
      item.href = '/' + item.Key;
    }
    var row = renderRow(item, cols);
    content.push(row + '\n');
  });

  document.getElementById('listing').innerHTML = '<pre>' + content.join('') + '</pre>';
}

function renderRow(item, cols) {
  var row = '';
  row += padRight(item.LastModified, cols[1]) + '  ';
  row += padRight(item.Size, cols[2]);
  row += '<a href="' + item.href + '">' + item.keyText + '</a>';
  return row;
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

