# Quick City Bikes API

## Deployment

Using CapRover

1. `npm run build`
2. `tar -cvf ./deploy.tar --exclude='node_modules' ./*`
3. `caprover deploy -t ./deploy.tar`
