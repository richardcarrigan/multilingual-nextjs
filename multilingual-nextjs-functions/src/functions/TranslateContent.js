import { app } from '@azure/functions';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions
} from '@azure/storage-blob';
import axios from 'axios';
import delay from 'delay';

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

      // Initial config for Azure AI Translator resource
      const translatorEndpoint = `https://${process.env.TRANSLATOR_RESOURCE_NAME}.cognitiveservices.azure.com/translator/text/batch/v1.1`;
      const translatorRoute = `/batches`;
      const translatorKey = process.env.TRANSLATOR_RESOURCE_KEY;

      let processedBlobCounter = 0;
      let activeOperations = [];

      // Check each blob in the `input-files` container, but only process English localized content HTML files with content
      for await (const blob of inputContainerClient.listBlobsFlat()) {
          // Generate blob-scoped SAS token
          const inputBlobSasUrl = generateBlobSas(
            inputContainerClient,
            inputSharedKeyCredential,
            blob.name
        );

        const targetFileName = blob.name.replace('en-us', 'es-es');
        
        context.log(blob);

          // Azure AI Translator blob-specific config
          const data = JSON.stringify({
            inputs: [
              {
                source: {
                  sourceUrl: inputBlobSasUrl,
                },
                targets: [
                  {
                    // Even though we are specifying the blob name, we still use the container-scoped SAS token, since the new file hasn't been created yet, so it's impossible to have a blob-specific SAS token for it.
                    targetUrl: `https://${process.env.OUTPUT_BLOB_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.OUTPUT_BLOB_STORAGE_CONTAINER_NAME}/${targetFileName}?${outputSas}`,
                    // Refer to https://learn.microsoft.com/en-us/azure/ai-services/translator/language-support for which code to use for each language/dialect
                    language: 'es', // Spanish
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
          // await delay(1000); // Wait 1 second between each status request
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
