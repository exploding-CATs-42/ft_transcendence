// Libraries
import express from "express";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import SwaggerParser from "@apidevtools/swagger-parser";
import RefParser from "@apidevtools/json-schema-ref-parser";
// Project level
import { getPublicUrl } from "utils";

export const docsRouter = express.Router();

docsRouter.get("/", (req, res) => {
  const publicUrl = getPublicUrl(req, "/rest-api/");

  res.redirect(publicUrl);
});

docsRouter.use("/rest-api", swaggerUi.serve);

docsRouter.get("/rest-api/", async (_, res, next) => {
  try {
    const rootPath = path.resolve(process.cwd(), "docs/rest_api/swagger.yaml");

    const swaggerDocument = await SwaggerParser.dereference(rootPath);

    res.send(swaggerUi.generateHTML(swaggerDocument));
  } catch (error) {
    console.error("Swagger load error:", error);
    next(error);
  }
});

docsRouter.get("/sockets", (req, res) => {
  const publicUrl = getPublicUrl(req, "/asyncapi.yaml");

  res.type("html").send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>API Docs</title>
        <link rel="stylesheet" href="https://unpkg.com/@asyncapi/react-component@3.1.3/styles/default.min.css">
      </head>
      <body>
        <div id="asyncapi"></div>
        <script src="https://unpkg.com/@asyncapi/react-component@3.1.3/browser/standalone/index.js"></script>
        <script>
          AsyncApiStandalone.render({
            schema: { url: '${publicUrl}' },
            config: { show: { sidebar: true } },
          }, document.getElementById('asyncapi'));
        </script>
      </body>
    </html>
  `);
});

docsRouter.get("/asyncapi.yaml", async (_, res, next) => {
  try {
    const rootPath = path.resolve(process.cwd(), "docs/sockets/asyncapi.yaml");

    const bundled = await RefParser.bundle(rootPath);

    res.json(bundled);
  } catch (error) {
    console.error("AsyncAPI load error:", error);
    next(error);
  }
});
