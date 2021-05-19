# tools-release

This is the project for release related internal tools.

## Local Development

### Apple M1

* You may run into compatibility issues with the M1 macs
  
1. Make sure you're on Node >= 15.5.0
2. run `env FAST_REFRESH=false npm start`

### Apple Intel
1. run `npm start`

## Deploy Static Site

1. Run `npm run build`
2. Copy and paste contents of `build` folder into s3 bucket `p8-tools-release`
3. Click Uploadd

## Deploy Lambda
0. make sure you already ran `npm install` in the lambda folders so that the dependencies are zipped
1.  `zip tools-release-createNotionPage.zip index.js package.json node_modules`
2.  `aws lambda update-function-code --function-name  tools-release-createNotionPage --zip-file fileb://tools-release-createNotionPage.zip`