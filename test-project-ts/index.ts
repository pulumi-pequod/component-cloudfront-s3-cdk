import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import * as fs from "fs";
import * as mime from "mime-types";

import { CloudFrontS3} from "../cloudFrontS3"; 

// Naming convention
const config = new pulumi.Config();
const prefix = config.get("prefix") || pulumi.getStack();

// Instantiate the resources using the CDK construct
const cloudFrontS3Deployment= new CloudFrontS3(prefix);
const cloudFrontDomain = cloudFrontS3Deployment.cloudFrontDomain;

// Create an website objects in the bucket created by CDK construct above. 
// For each file in the directory, create an S3 object stored in `siteBucket`
const siteDir = "www";
for (const item of fs.readdirSync(siteDir)) {
  const filePath = require("path").join(siteDir, item);
  const siteObject = new aws.s3.BucketObject(item, {
    bucket: cloudFrontS3Deployment.websiteBucketName,
    source: new pulumi.asset.FileAsset(filePath),     // use FileAsset to point to a file
    contentType: mime.lookup(filePath) || undefined, // set the MIME type of the file
  });
}

// Output the Cloudfront endpoint
export const cloudFrontUrl = pulumi.interpolate`https://${cloudFrontDomain}`;


