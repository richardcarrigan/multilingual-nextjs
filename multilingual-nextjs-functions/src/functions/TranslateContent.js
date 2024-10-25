import { app } from '@azure/functions';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions
} from '@azure/storage-blob';
import axios from 'axios';
import delay from 'delay';
import matter from 'gray-matter';

app.http('TranslateContent', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (_, context) => {
    // Generate new SAS token for `output-files` container
    const outputSas = generateContainerSas(
      process.env.OUTPUT_BLOB_STORAGE_ACCOUNT_NAME,
      process.env.OUTPUT_BLOB_STORAGE_ACCOUNT_KEY,
      process.env.OUTPUT_BLOB_STORAGE_CONTAINER_NAME,
      'wl'
    );

    // Create container client for `input-files` container
    const inputSharedKeyCredential = new StorageSharedKeyCredential(
      process.env.INPUT_BLOB_STORAGE_ACCOUNT_NAME,
      process.env.INPUT_BLOB_STORAGE_ACCOUNT_KEY
    );
    const inputBlobServiceClient = new BlobServiceClient(
      `https://${process.env.INPUT_BLOB_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
      inputSharedKeyCredential
    );
    const inputContainerClient = inputBlobServiceClient.getContainerClient(
      process.env.INPUT_BLOB_STORAGE_CONTAINER_NAME
    );
    
    // Create container client for `output-files` container
    const outputSharedKeyCredential = new StorageSharedKeyCredential(
      process.env.OUTPUT_BLOB_STORAGE_ACCOUNT_NAME,
      process.env.OUTPUT_BLOB_STORAGE_ACCOUNT_KEY
    );
    const outputBlobServiceClient = new BlobServiceClient(
      `https://${process.env.OUTPUT_BLOB_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
      outputSharedKeyCredential
    );
    const outputContainerClient = outputBlobServiceClient.getContainerClient(
      process.env.OUTPUT_BLOB_STORAGE_CONTAINER_NAME
    );

    // Initial config for Azure AI Translator resource
    const translatorEndpoint = `https://centralus.api.cognitive.microsoft.com/`;
    const translatorRoute = `translator/document/batches?api-version=2024-05-01`;
    const translatorKey = process.env.TRANSLATOR_RESOURCE_KEY;

    let processedBlobCounter = 0;
    let activeOperations = [];

    const glossaryContainerClient =
      inputBlobServiceClient.getContainerClient('glossaries');
    const glossaryUrl = generateBlobSas(
      glossaryContainerClient,
      inputSharedKeyCredential,
      'en-es.csv'
    );

    for await (const blob of inputContainerClient.listBlobsFlat()) {
      // Generate blob-scoped SAS token
      const inputBlobSasUrl = generateBlobSas(
        inputContainerClient,
        inputSharedKeyCredential,
        blob.name
      );

      const targetFileName = blob.name.replace('en-us', 'es-es');
      
      // Azure AI Translator blob-specific config
      const data = JSON.stringify({
        inputs: [
          {
            source: {
              sourceUrl: inputBlobSasUrl,
              language: 'en' // English
            },
            targets: [
              {
                // Even though we are specifying the blob name, we still use the container-scoped SAS token, since the new file hasn't been created yet, so it's impossible to have a blob-specific SAS token for it.
                targetUrl: `https://${process.env.OUTPUT_BLOB_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.OUTPUT_BLOB_STORAGE_CONTAINER_NAME}/${targetFileName}?${outputSas}`,
                // Refer to https://learn.microsoft.com/en-us/azure/ai-services/translator/language-support for which code to use for each language/dialect
                language: 'es', // Spanish
                glossaries: [
                  {
                    glossaryUrl,
                    format: 'csv',
                  },
                ],
              },
            ],
            storageType: 'File', // Default: 'Folder'
          },
        ],
      });
      
      // Axios request config
      const config = {
        method: 'post',
        url: translatorEndpoint + translatorRoute,
        headers: {
          'Ocp-Apim-Subscription-Key': translatorKey,
          'Content-Type': 'application/json',
        },
        data: data,
      };
      
      // Submit blob file to Azure AI Translator service for translation
      await axios(config)
        .then(async (response) => {
          context.log(response);
          activeOperations.push({
            blobName: blob.name,
            operationUrl: response.headers['operation-location'],
          });

          const result = {
            statusText: response.statusText,
            statusCode: response.status,
            headers: response.headers,
          };
          context.log(JSON.stringify(result));
        })
        .catch(context.error);
    }

    do {
      context.log(`Waiting 30 seconds before checking translation status...`);
      await delay(30000); // Wait 30 seconds before checking the status of each translation

      context.log(
        `Checking translation status of ${activeOperations.length} operations...`
      );
      for (const operationObj of activeOperations) {
        const operationUrl = operationObj.operationUrl;

        context.log(`Checking status of '${operationObj.blobName}'...`);
        const statusResponse = await checkTranslationStatus(
          operationUrl,
          translatorKey
        );
        const operationStatus = statusResponse.data.status;
        context.log(`operationStatus: ${operationStatus}`);

        if (operationStatus === 'Succeeded') {
          // If the translation is complete, increment the number of processed blobs and remove the operation object from the 'activeOperations' array
          context.log(`'${operationObj.blobName}' translated!`);
          processedBlobCounter++;
          activeOperations = activeOperations.filter((operation) => {
            operation.operationUrl === operationUrl;
            context.log(`Removed ${JSON.stringify(operation)}`);
          });
          context.log(
            `${processedBlobCounter} files translated so far, ${activeOperations.length} remaining.`
          );
        } else if (
          operationStatus === 'Failed' ||
          operationStatus === 'ValidationFailed'
        ) {
          // If the translation failed, remove the operation object from the 'activeOperations' array, but don't increment the number of processed blobs
          context.log(
            `'${operationObj.blobName}' couldn't be translated. Error message: ${statusResponse.data.error.message}.`
          );
          activeOperations = activeOperations.filter((operation) => {
            operation.operationUrl === operationUrl;
            context.log(`Removed ${JSON.stringify(operation)}`);
          });

          // Also, if the error wasn't due to simply not having any content to translate, throw an error
          if (
            statusResponse.data.error.message !==
            'The document does not have any translatable text.'
          ) {
            throw new Error(statusResponse.data.error);
          }
        } else {
          // Otherwise, just add the current status to the operation object
          operationObj.status = operationStatus;
        }
      }
    } while (activeOperations.length > 0);

    // Translate each file's metadata (<meta name='example' content='example'>)
    for await (const blob of inputContainerClient.listBlobsFlat()) {
      // Download the original file
      const inputBlockBlobClient = inputContainerClient.getBlockBlobClient(blob.name);
      const downloadInputBlockBlobResponse = await inputBlockBlobClient.download(0);
      const downloadedInput = await streamToString(downloadInputBlockBlobResponse.readableStreamBody);

      // Download the translated but corrupted file
      const outputBlobName = blob.name.replace('en-us', 'es-es');
      const outputBlockBlobClient = outputContainerClient.getBlockBlobClient(outputBlobName);
      const downloadOutputBlockBlobResponse = await outputBlockBlobClient.download(0);
      let downloadedOutput = await streamToString(downloadOutputBlockBlobResponse.readableStreamBody);

      // Extract the metadata 'title' and 'excerpt' and translate it
      const inputDocument = matter(downloadedInput);
      const { data } = inputDocument;
      const { title, excerpt } = data;
      const translatedTitle = await translate(translatorKey, 'es', title);
      const translatedExcerpt = await translate(translatorKey, 'es', excerpt);
      
      // Reassemble the Markdown file with the translated 'title' and 'excerpt'
      const translatedData = {
        ...data,
        title: translatedTitle,
        excerpt: translatedExcerpt
      };
      const translatedMetadata = matter.stringify('', translatedData);
      const frontmatterRegex = /---[\s\S]*?---/;
      downloadedOutput = downloadedOutput.replace(frontmatterRegex, translatedMetadata);

      // Replace the original translated file
      await outputBlockBlobClient.upload(downloadedOutput, downloadedOutput.length, { overwrite: true });
    }

    return {
      status: 200,
      body: `${processedBlobCounter} files translated!`,
      headers: {
        'Content-Type': 'text/plain',
      },
    };
  }
});

async function checkTranslationStatus(operationUrl, translatorKey) {
  const statusConfig = {
    method: 'get',
    url: operationUrl,
    headers: {
      'Ocp-Apim-Subscription-Key': translatorKey,
    },
  };

  return await axios(statusConfig);
}

function generateBlobSas(containerClient, sharedKeyCredential, blobName) {
  const blobClient = containerClient.getBlobClient(blobName);
  const startDate = new Date();
  const expiryDate = new Date(startDate);
  expiryDate.setMinutes(startDate.getMinutes() + 100);
  const permissions = BlobSASPermissions.parse('r'); // Read and list permissions
  const sasQueryParameters = generateBlobSASQueryParameters(
    {
      containerName: containerClient.containerName,
      blobName,
      permissions,
      startsOn: startDate,
      expiresOn: expiryDate,
    },
    sharedKeyCredential
  );
  const sasUrl = blobClient.url + '?' + sasQueryParameters.toString();
  return sasUrl;
}

function generateContainerSas(
  accountName,
  accountKey,
  containerName,
  permissions
) {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  );

  const sasOptions = {
    containerName,
    permissions,
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // Expires in 1 hour
  };

  return generateBlobSASQueryParameters(
    sasOptions,
    sharedKeyCredential
  ).toString();
}

async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', data => {
      chunks.push(data.toString());
    });
    readableStream.on('end', () => {
      resolve(chunks.join(''));
    });
    readableStream.on('error', reject);
  });
}

async function translate(translatorKey, language, text) {
  const endpoint = 'https://api.cognitive.microsofttranslator.com';
  const path = '/translate?api-version=3.0';

  const url = `${endpoint}${path}&to=${language}`;

  const response = await axios({
    method: 'post',
    url,
    headers: {
      'Ocp-Apim-Subscription-Key': translatorKey,
      'Ocp-Apim-Subscription-Region': 'centralus',
      'Content-Type': 'application/json'
    },
    data: [{
      'text': text
    }]
  });

  return response.data[0].translations[0].text;
}
