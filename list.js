
/***************************************** 
*
* Amazon S3 Bucket Setup
* 1. Enable website mode on S3 interface
* 2. Enable the security policy in readme
* 3. Enable the CORS policy in readme
* 4. Enable view privileges for "Everyone"
*
*****************************************/

// Uncomment these variables if using Amazon S3 Bucket
//var S3BL_IGNORE_PATH = true;
//var BUCKET_URL = 'your.bucket.url.com'; // use the url that does not contain 'website'

// Files to exclude
var exclude = ['index.html', 'list.js'];

if (typeof S3BL_IGNORE_PATH == 'undefined' || S3BL_IGNORE_PATH != true) {
  var S3BL_IGNORE_PATH = false;
}

jQuery(function($) {
  var s3_rest_url = createS3QueryUrl();
  // Loading Message
  $('#listing').html('<h4>Loading Index...</h4>');
  $.get(s3_rest_url)
  .done(function(data) {
    $('#listing').html('');
    var xml = $(data);
    var info = getInfoFromS3Data(xml);
    renderTable(info);
    })
  .fail(function(error) {
    // Error Message
    alert('There was an error');
    console.log(error);
  });
});

// Support for non-s3 directories
function createS3QueryUrl() {
  if (typeof BUCKET_URL != 'undefined') {
    var s3_rest_url = BUCKET_URL;
  } 
  else {
    var s3_rest_url = location.protocol + '//' + location.hostname;
  }
  s3_rest_url += '?delimiter=/';
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
    var prefix = prefix.replace(/\/$/, '') + '/';
    s3_rest_url += '&prefix=' + prefix;
  }
  return s3_rest_url;
}

function getInfoFromS3Data(xml) {
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
  
  return {
    files: files,
    directories: directories,
    prefix:  $(xml.find('Prefix')[0]).text()
  }
}

function renderTable(info) {
  var files = info.files.concat(info.directories), prefix = info.prefix;
  var cols = [ 45, 30, 15 ];
  var content = [];
  content.push(padRight('Last Modified', cols[1]) + '  ' + padRight('Size', cols[2]) + 'Key \n');
  content.push(new Array(cols[0] + cols[1] + cols[2] + 4).join('-') + '\n');

  if (prefix) {
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
  
  jQuery.each(files, function(idx, item) {
    item.keyText = item.Key.substring(prefix.length);
    if (item.Type === 'directory') {
      if (S3BL_IGNORE_PATH) {
        item.href = location.protocol + '//' + location.hostname + location.pathname + '?prefix=' + item.Key;
      } 
      else {
        item.href = item.keyText;
      }
    } 
    else {
      // TODO: need to fix this up for cases where we are on site not bucket
      // in that case href for a file should point to s3 bucket
      item.href = '/' + item.Key;
    }
    
    // file exclusions
    if(jQuery.inArray(item.keyText, exclude) == -1) {
      var row = renderRow(item, cols);
      content.push(row + '\n');
    }
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
