import express from "express";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import SwaggerParser from "@apidevtools/swagger-parser";

export const docsRouter = express.Router();

docsRouter.get("/", (req, res) => {
  const forwardedPrefix = req.get("x-forwarded-prefix") ?? "";
  const publicBaseUrl = `${forwardedPrefix}${req.baseUrl}`;

  res.redirect(`${publicBaseUrl}/rest-api/`);
});

docsRouter.use("/rest-api", swaggerUi.serve);

docsRouter.get("/rest-api/", async (_req, res, next) => {
  try {
    const rootPath = path.resolve(
      __dirname,
      "../../../docs/rest_api/swagger.yaml"
    );

    const swaggerDocument = await SwaggerParser.dereference(rootPath);

    res.send(swaggerUi.generateHTML(swaggerDocument));
  } catch (error) {
    console.error("Swagger load error:", error);
    next(error);
  }
});

docsRouter.get("/sockets", (_req, res) => {
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
            schema: { url: './asyncapi.yaml' },
            config: { show: { sidebar: true } },
          }, document.getElementById('asyncapi'));
        </script>
      </body>
    </html>
  `);
});

docsRouter.use(
  "/asyncapi.yaml",
  express.static(path.join(__dirname, "../../../docs/sockets/asyncapi.yaml"))
);