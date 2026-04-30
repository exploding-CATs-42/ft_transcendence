import express from "express";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import SwaggerParser from "@apidevtools/swagger-parser";

export const docsRouter = express.Router();

// ----------------- Redirects ----------------- //
// Redirect /docs to /docs/rest-api
docsRouter.get("/", (_, res) => {
  res.redirect("/docs/rest-api");
});

// ----------------- Swagger ----------------- //

docsRouter.use("/rest-api", swaggerUi.serve);

docsRouter.get("/rest-api", async (_req, res, next) => {
  try {
    const rootPath = path.resolve(
      __dirname,
      "../../../docs/rest_api/swagger.yaml"
    );

    const swaggerDocument = await SwaggerParser.dereference(rootPath);

    const html = swaggerUi.generateHTML(swaggerDocument);
    res.send(html);
  } catch (error) {
    next(error);
  }
});

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
