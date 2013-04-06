Create nice directory listings for s3 buckets using only javascript and HTML.

Inspiration from http://aws.amazon.com/code/Amazon-S3/1713

## Usage

Copy the index.html into the s3 bucket where you want the listing (you can also
put the index.html on any website).

**Note:** for s3 buckets which are in website mode you must take some
additional steps, see below.

### Configuring the Bucket to List

By default, the script will attempt to guess the bucket based on the url you
are trying to access. However, you can configure it to point at any s3 bucket
by setting the `BUCKET_URL` javascript variable, e.g.:

    var BUCKET_URL = 'http://data.openspending.org.s3-eu-west-1.amazonaws.com';

### Website buckets

For S3 buckets configured in website mode the standard approach will not work
because a GET request on the bucket root returns the site index page rather
than the object listing in JSON form.

Thus, you have to set the `BUCKET_URL` variable to be the S3 bucket endpoint
which *differs* from the website S3 bucket endpoint. For more details see:

<http://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteEndpoints.html#WebsiteRestEndpointDiff>

A specific example for the EU west region:

* Website endpoint: http://example-bucket.s3-website-eu-west-1.amazonaws.com/
* S3 bucket endpoint (for RESTful calls): http://example-bucket.s3-eu-west-1.amazonaws.com/

Note that US east region is **different** in that the S3 bucket endpoint does not include a location spec but the website version does:

* Website endpoint: http://example-bucket.s3-website-us-east-1.amazonaws.com/
* S3 bucket endpoint (for RESTful calls): http://example-bucket.s3.amazonaws.com/




## Copyright and License

Copyright 2012-2013 Rufus Pollock.

Licensed under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

