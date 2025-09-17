if (typeof AUTO_TITLE != 'undefined' && AUTO_TITLE == true) {
  document.title = location.hostname;
}

if (typeof S3_REGION != 'undefined') {
  var BUCKET_URL = location.protocol + '//' + location.hostname + '.' + S3_REGION + '.amazonaws.com'; // e.g. just 's3' for us-east-1 region
  var BUCKET_WEBSITE_URL = location.protocol + '//' + location.hostname;
}

if (typeof S3BL_IGNORE_PATH == 'undefined' || S3BL_IGNORE_PATH != true) {
  var S3BL_IGNORE_PATH = false;
}

if (typeof BUCKET_URL == 'undefined') {
  var BUCKET_URL = location.protocol + '//' + location.hostname;
}

if (typeof BUCKET_NAME != 'undefined') {
  // if bucket_url does not start with bucket_name,
  // assume path-style url
  if (!~BUCKET_URL.indexOf(location.protocol + '//' + BUCKET_NAME)) {
    BUCKET_URL += '/' + BUCKET_NAME;
  }
}

if (typeof BUCKET_WEBSITE_URL == 'undefined') {
  var BUCKET_WEBSITE_URL = BUCKET_URL;
}

if (typeof S3B_ROOT_DIR == 'undefined') {
  var S3B_ROOT_DIR = '';
}

if (typeof S3B_SORT == 'undefined') {
  var S3B_SORT = 'DEFAULT';
}

if (typeof S3B_STAT_DIRS == 'undefined' || S3B_STAT_DIRS != true) {
  var S3B_STAT_DIRS = false;
}

if (typeof EXCLUDE_FILE == 'undefined') {
  var EXCLUDE_FILE = [];
} else if (typeof EXCLUDE_FILE == 'string' || EXCLUDE_FILE instanceof RegExp) {
  var EXCLUDE_FILE = [EXCLUDE_FILE];
}

document.addEventListener('DOMContentLoaded', () => getS3Data());

// This will sort your file listing by most recently modified.
// Flip the comparator to '>' if you want oldest files first.
function sortFunction(a, b) {
  switch (S3B_SORT) {
    case "OLD2NEW":
      return a.LastModified > b.LastModified ? 1 : -1;
    case "NEW2OLD":
      return a.LastModified < b.LastModified ? 1 : -1;
    case "A2Z":
      return a.Key > b.Key ? 1 : -1;
    case "Z2A":
      return a.Key < b.Key ? 1 : -1;
    case "BIG2SMALL":
      return a.Size < b.Size ? 1 : -1;
    case "SMALL2BIG":
      return a.Size > b.Size ? 1 : -1;
  }
}

function getS3Data(marker, prev) {
  var s3_rest_url = createS3QueryUrl(marker);
  const listing_element = document.getElementById('listing');
  // set loading notice
  listing_element.innerHTML =
    '<img src="//assets.okfn.org/images/icons/ajaxload-circle.gif" />';

  fetch(s3_rest_url)
    .then(response => response.text())
    .then(data => {
      // Clear loading notice
      listing_element.innerText = '';
      var parser = new DOMParser();
      var xml = parser.parseFromString(data, "text/xml");
      var info = getInfoFromS3Data(xml);
      buildNavigation(info);
      // Add a <base> element to the document head
      var base = window.location.href;
      base = base.endsWith('/') ? base : base + '/';
      var baseElement = document.createElement('base');
      baseElement.href = base;
      document.head.appendChild(baseElement);

      if (typeof prev !== 'undefined') {
        info.files = info.files.concat(prev.files);
        info.directories = info.directories.concat(prev.directories);
      }
      if (info.nextMarker !== null) {
        getS3Data(info.nextMarker, info);
      } else {
        if (S3B_SORT !== 'DEFAULT') {
          info.files.sort(sortFunction);
          info.directories.sort(sortFunction);
        }
        listing_element.innerHTML =
          '<pre>' + prepareTable(info) + '</pre>';
      }
    })
    .catch(error => {
      console.error(error);
      listing_element.innerHTML =
        '<strong>Error: ' + error + '</strong>';
    });
}

function buildNavigation(info) {
  var baseUrl = S3BL_IGNORE_PATH == false ? '/' : '?prefix=';
  var root = '<a href="' + baseUrl + '">' + BUCKET_WEBSITE_URL + '</a> / ';
  if (info.prefix) {
    var processedPathSegments = '';
    var content = info.prefix.split('/').map(function(pathSegment) {
      processedPathSegments += encodeURIComponent(pathSegment) + '/';
      var link = document.createElement('a');
      link.setAttribute('href', baseUrl + processedPathSegments.replace(/"/g, '&quot;'));
      link.innerText = pathSegment;
      return link.outerHTML;
    });
    document.getElementById('navigation').innerHTML = root + content.join(' / ');
  } else {
    document.getElementById('navigation').innerHTML = root;
  }
}

function createS3QueryUrl(marker) {
  var s3_rest_url = BUCKET_URL;
  s3_rest_url += '?delimiter=/';

  //
  // Handling paths and prefixes:
  //
  // 1. S3BL_IGNORE_PATH = false
  // Uses the pathname
  // {bucket}/{path} => prefix = {path}
  //
  // 2. S3BL_IGNORE_PATH = true
  // Uses ?prefix={prefix}
  //
  // Why both? Because we want classic directory style listing in normal
  // buckets but also allow deploying to non-buckets
  //

  var rx = '.*[?&]prefix=' + S3B_ROOT_DIR + '([^&]+)(&.*)?$';
  var prefix = '';
  if (S3BL_IGNORE_PATH == false) {
    var prefix = location.pathname.replace(/^\//, S3B_ROOT_DIR);
  }
  var match = location.search.match(rx);
  if (match) {
    prefix = S3B_ROOT_DIR + match[1];
  } else {
    if (S3BL_IGNORE_PATH) {
      var prefix = S3B_ROOT_DIR;
    }
  }
  if (prefix) {
    // make sure we end in /
    var prefix = prefix.replace(/\/$/, '') + '/';
    s3_rest_url += '&prefix=' + encodePath(prefix);
  }
  if (marker) {
    s3_rest_url += '&marker=' + encodePath(marker);
  }
  return s3_rest_url;
}

function getInfoFromS3Data(xml) {
  var prefix = xml.querySelector('Prefix') ? xml.querySelector('Prefix').textContent : '';
  var files = Array.from(xml.querySelectorAll('Contents')).map(function(item) {
    return {
      Key: item.querySelector('Key').textContent,
      LastModified: item.querySelector('LastModified').textContent,
      Size: bytesToHumanReadable(item.querySelector('Size').textContent),
      Type: 'file'
    };
  });
  if (prefix && files[0] && files[0].Key == prefix) {
    files.shift();
  }
  var directories = Array.from(xml.querySelectorAll('CommonPrefixes')).map(function(item) {
    var last_modified = '';
    if (S3B_STAT_DIRS) {
      http = new XMLHttpRequest();
      http.open("HEAD", item.querySelector('Prefix').textContent, false);
      http.send();
      last_modified = new Date(http.getResponseHeader("Last-Modified")).toISOString();
    }
    return {
      Key: item.querySelector('Prefix').textContent,
      LastModified: last_modified,
      Size: 'dir',
      Type: 'directory'
    };
  });
  var nextMarker = xml.querySelector('IsTruncated').textContent === 'true' ?
    xml.querySelector('NextMarker').textContent : null;
  return {
    files: files,
    directories: directories,
    prefix: prefix,
    bucketname: xml.querySelector('Name').textContent,
    nextMarker: nextMarker
  }
}

// info is object like:
// {
//    files: ..
//    directories: ..
//    prefix: ...
//    bucketname: ...
// }
function prepareTable(info) {
  var files = info.directories.concat(info.files), prefix = info.prefix, bucketname = info.bucketname;
  var cols = [45, 30, 15];
  var content = [];
  content.push('Bucket: ' + bucketname + ', Directory: /' + prefix + '\n');
  content.push(padRight('Last Modified', cols[1]) + '  ' +
               padRight('Size', cols[2]) + 'Key \n');
  content.push(new Array(cols[0] + cols[1] + cols[2] + 4).join('-') + '\n');

  // add ../ at the start of the dir listing, unless we are already at root dir
  if (prefix && prefix !== S3B_ROOT_DIR) {
    var up = prefix.replace(/\/$/, '').replace(/"/g, '&quot;').split('/').slice(0, -1).concat('').join(
            '/'),  // one directory up
        item =
            {
              Key: up,
              LastModified: '',
              Size: 'dir',
              keyText: '../',
              href: S3BL_IGNORE_PATH ? '?prefix=' + encodePath(up) : '../'
            },
        row = renderRow(item, cols);
    content.push(row + '\n');
  }
  // strip off the prefix
  files.forEach(function(item) {
    item.keyText = item.Key.substring(prefix.length);
    if (item.Type === 'directory') {
      if (S3BL_IGNORE_PATH) {
        item.href = location.origin +
                    location.pathname + '?prefix=' + encodePath(item.Key);
      } else {
        item.href = encodePath(item.keyText);
      }
    } else {
      item.href = BUCKET_WEBSITE_URL + '/' + encodePath(item.Key);
    }
    // Don't display the row unless keyText length is greater than zero
    // keyText is zero length for the directory placeholder (because it is categorized as a file)
    if (item.keyText.length) {
      var row = renderRow(item, cols);
      if (!EXCLUDE_FILE.some(function(exclude){ return testExcludeFilter(exclude, item.Key); }))
        content.push(row + '\n');
    }
  });

  return content.join('');
}

// Encode everything but "/" which are significant in paths and to S3
function encodePath(path) {
  return encodeURIComponent(path).replace(/%2F/g, '/')
}

function renderRow(item, cols) {
  var row = '';
  row += padRight(item.LastModified, cols[1]) + '  ';
  row += padRight(item.Size, cols[2]);
  row += '<a href="' + item.href + '">' + item.keyText + '</a>';
  return row;
}

function padRight(padString, length) {
  var str = padString.slice(0, length - 3);
  if (padString.length > str.length) {
    str += '...';
  }
  while (str.length < length) {
    str = str + ' ';
  }
  return str;
}

function bytesToHumanReadable(sizeInBytes) {
  var i = -1;
  var units = [' kB', ' MB', ' GB'];
  do {
    sizeInBytes = sizeInBytes / 1024;
    i++;
  } while (sizeInBytes > 1024);
  return Math.max(sizeInBytes, 0.1).toFixed(1) + units[i];
}

function testExcludeFilter(filter, key) {
  if (typeof filter == 'string') {
    return key == filter;
  }
  else if (filter instanceof RegExp) {
    return filter.test(key);
  }
  else
  {
    throw "exclude filter is not a string or regexp";
  }
}
