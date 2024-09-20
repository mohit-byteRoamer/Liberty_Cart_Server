import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" assert { type: "json" };

const setupSwagger = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      tags: {
        User: {
          name: "User",
          description: "User-related endpoints",
        },
        Product: {
          name: "Product",
          description: "Product-related endpoints",
        },
        // Add other tags here
      },
    })
  );
};

export default setupSwagger;
