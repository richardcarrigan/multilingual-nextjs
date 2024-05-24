This is a proof-of-concept [Next.js](https://nextjs.org/) project, based on the Blog Example project, that showcases an end-to-end automated workflow for translating content into other languages/dialects using Azure AI Translator. At a high-level, the process can be described as follows:

1. Upload the `_posts` directory to an Azure blob storage container called `input-files`.
2. Use an Azure Function App to trigger the Azure AI Translator service.
3. Azure AI Translator translates each file and places the translated file into an Azure blob storage container called `output-files`.
4. Download the `_posts` directory from `output-files` and add it to the repo.
5. Deploy the app to an Azure Static Web App.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
