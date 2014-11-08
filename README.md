Create nice directory listings for s3 buckets using only javascript and HTML.

The listing can be deployed on any site and can also be deployed into a bucket.

Inspiration from http://aws.amazon.com/code/Amazon-S3/1713

## Live Demo

If you want to see an example of this script in action check out:

<http://data.openspending.org/>

## Usage

Copy these 3 lines into the HTML file where you want the listing to show up:

    <div id="listing"></div>

    <!-- add jquery - if you already have it just ignore this line -->
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>

    <!-- the JS to the do the listing -->
    <script src="http://rgrp.github.io/s3-bucket-listing/list.js"></script>

We've provided an example [index.html file][index] you can just copy if you want.

[index]: https://github.com/rgrp/s3-bucket-listing/blob/gh-pages/index.html

### Tips for S3 buckets

* You probably want to put this in an index.html in the root of your s3 bucket
* You may want to turn on website mode for your s3 bucket.
* **Note** for s3 buckets in website mode you must explicitly configure the
  bucket url - see below for details and explanation of why this is necessary.

### Tips for normal websites

* Copy the code into whatever file you want to act as your listing page.
* You will need to set the bucket to list - see below
* You probably want to turn off URL-based navigation.

### Turning off URL based navigation

By default the scripts attempts to use the URL path (/xyz/abc/) to do directory
style navigation. You may not want this (e.g. if deploying to a website page).

To disable set the following javascript variable:

    S3BL_IGNORE_PATH = true;

### Configuring the Bucket to List

By default, the script will attempt to guess the bucket based on the url you
are trying to access. However, you can configure it to point at any s3 bucket
by setting the `BUCKET_URL` javascript variable, e.g.:

    var BUCKET_URL = 'https://s3-eu-west-1.amazonaws.com/data.openspending.org/';

### S3 Website buckets

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

#### S3 Website bucket permissions

You must setup the S3 website bucket to allow public read access. 

* Grant `Everyone` the `List` and `View` permissions:
![List & View permissions](https://f.cloud.github.com/assets/227505/2409362/46c90dbe-aaad-11e3-9dee-10e967763770.png) 
 * Alternatively you can assign the following bucket policy if policies are your thing:

```
{
    "Version": "2008-10-17",
    "Statement": [
        {
            "Sid": "AllowPublicRead",
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::{your-bucket-name}/*"
        }
    ]
}
```
* Assign the following CORS policy
```
<CORSConfiguration>
 <CORSRule>
   <AllowedOrigin>*</AllowedOrigin>
   <AllowedMethod>GET</AllowedMethod>
   <AllowedHeader>*</AllowedHeader>
 </CORSRule>
</CORSConfiguration>
```

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

