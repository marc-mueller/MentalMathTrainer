# Azure Static Web Apps deployment

The deployment token must stay out of source control. Store it in a local `.env.local` file or set it as an environment variable named `SWA_CLI_DEPLOYMENT_TOKEN`.

Recommended local setup:

```bash
printf 'SWA_CLI_DEPLOYMENT_TOKEN=%s\n' 'your-token-here' > .env.local
npm run deploy:azure
```

Temporary shell setup:

```bash
read -rsp "Azure SWA deployment token: " SWA_CLI_DEPLOYMENT_TOKEN
export SWA_CLI_DEPLOYMENT_TOKEN
npm run deploy:azure
```

The deployment script builds the Vite app and deploys the generated `dist` folder to the production Azure Static Web Apps environment.
