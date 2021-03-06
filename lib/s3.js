/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var knox = require('knox');

exports.init = function (key, secret, bucket) {
  var knoxClient = knox.createClient({
    key: key,
    secret: secret,
    bucket: bucket
  });

  return {
    write: function (filename, data, callback, contentType) {
      contentType = contentType || 'text/html';
      var knoxReq = knoxClient.put(filename, {
        'x-amz-acl': 'public-read',
        'Content-Length': Buffer.byteLength(data, 'utf8'),
        'Content-Type': contentType
      });

      knoxReq.on('response', function (knoxResponse) {
        if (knoxResponse.statusCode === 200) {
          console.log('Wrote ' + filename + ' to S3 @ ' + bucket );
        }
        else {
          console.error('Trouble writing to S3 @ ' + bucket + ': ' + knoxResponse.statusCode);
        }
        callback(knoxResponse);
      });

      knoxReq.on('error', function () {
        console.error('Socket trouble while writing to S3.');
      });

      knoxReq.end(data);
    }
  };
}