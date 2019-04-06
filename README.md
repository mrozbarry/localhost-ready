# localhost-ready

Check to see if a local tcp server can be connected to. On success, return status code 0, otherwise status code 1.

## Using in your project

### Add as a dev dependency

```bash
npm install --save-dev localhost-ready
# or
yarn add --dev localhost-ready
```

### Use it

From cli:

```bash
$(npm bin)/localhost-ready --port 8080 --timeout 60000 && echo "Server running"
# or
$(yarn bin)/localhost-ready --port 8080 --timeout 60000 && echo "Server running"
```

In your package.json (using concurrently, but any multi-runner like npm-run-all is fine, too):

```json
{
  ...
  "scripts": {
    "dev": "run-your-dev-server",
    "testcafe": "localhost-ready --port 8080 --timeout 10000 && testcafe",
    "test:e2e": "concurrently \"yarn dev\" \"yarn testcafe\""
  }
}
```
