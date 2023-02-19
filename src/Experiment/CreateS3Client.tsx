import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
// @ts-ignore
import {AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY} from '@env';
import {S3Client} from '@aws-sdk/client-s3';

export function createS3Client() {
  let credentials = {
    accessKeyId: AWS_ACCESS_KEY_ID ? AWS_ACCESS_KEY_ID : '',
    secretAccessKey: AWS_SECRET_ACCESS_KEY ? AWS_SECRET_ACCESS_KEY : '',
  };
  let s3client = new S3Client({
    region: 'us-east-1',
    credentials: credentials,
  });
  return s3client;
}
