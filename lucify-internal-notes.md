# Internal notes

These are internal notes for this project, intended only for internal use by Lucify.

## Update data

Run these in the project root:
```
src/scripts/download-unhcr-data.sh
./prepare.sh
```

Update the "updated at" date and (possibly) the end date in refugee-constants.

Test that everything works
```
gulp
```

## Deploying from your local machine

Run the following commands in the project root:

### Development

```shell
LUCIFY_ENV=development AWS_PROFILE=lucify-protected FLOW_TOKEN=$FLOW_TOKEN_MAIN npm run-script deploy
```

### Production

First, assume the admin role. Then run the following command:
```shell
LUCIFY_ENV=production FLOW_TOKEN=$FLOW_TOKEN_MAIN npm run-script deploy
```

Once deployed, check that embeds work. Note that it can take up to 10 minutes for the visualisation to update in CDN.
