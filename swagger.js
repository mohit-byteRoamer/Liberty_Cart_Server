import swaggerAutogen from "swagger-autogen";
const doc = {
  info: {
    title: "Liberty Cart API",
    description: "API documentation for Liberty Cart",
  },
  host: "localhost:3000",
  schemes: ["http"],
  components: {
    securitySchemas: {
      bearerAuth: {
        type: "http",
        schema: "bearer ",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    { name: "User", description: "User related endpoints" },
    { name: "Product", description: "Product related endpoints" },
    { name: "Order", description: "Order related endpoints" },
    { name: "Payment", description: "Payment related endpoints" },
    { name: "Dashboard", description: "Dashboard related endpoints" },
  ],
  apiVersion: "/api/v1",
};

const outputFile = "./swagger-output.json";
// const routes = ["./path/userRoutes.js", "./path/bookRoutes.js"];
const routes = ["./src/app"];

swaggerAutogen(outputFile, routes, doc);
