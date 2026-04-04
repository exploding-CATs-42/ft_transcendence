import express from "express";
import path from "node:path";
import fs from "node:fs";
import swaggerUi from "swagger-ui-express";

export const docsRouter = express.Router();

// ----------------- Redirects ----------------- //
// Redirect /docs to /docs/rest-api
docsRouter.get("/", (_, res) => {
  res.redirect("/docs/rest-api");
});

// ----------------- Swagger ----------------- //
const swaggerDocument = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../../../docs/rest_api/swagger.json"),
    "utf-8"
  )
);

docsRouter.use("/rest-api", swaggerUi.serve);
docsRouter.get("/rest-api", swaggerUi.setup(swaggerDocument));

// ----------------- AsyncAPI ----------------- //
docsRouter.use("/sockets", (_, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>API Docs</title>
        <link rel="stylesheet" href="https://unpkg.com/@asyncapi/react-component@latest/styles/default.min.css">
      </head>
      <body>
        <div id="asyncapi"></div>
        <script src="https://unpkg.com/@asyncapi/react-component@latest/browser/standalone/index.js"></script>
        <script>
          AsyncApiStandalone.render({
            schema: { url: '/docs/asyncapi.yaml' },
            config: { show: { sidebar: true } },
          }, document.getElementById('asyncapi'));
        </script>
      </body>
    </html>
  `);
});

// Also expose the raw spec file
docsRouter.use(
  "/asyncapi.yaml",
  express.static(path.join(__dirname, "../../../docs/sockets/asyncapi.yaml"))
);
