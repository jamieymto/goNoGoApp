#!/bin/bash

cd lambda/toolsRelease/createNotionPage
zip tools-release-createNotionPage.zip index.js package.json node_modules
aws lambda update-function-code --function-name  tools-release-createNotionPage --zip-file fileb://tools-release-createNotionPage.zip