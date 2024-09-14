import dotenv from "dotenv";
import ConnectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});

const asciiDog = `
  / \\__
 (    @\\____
 /         O 
/   (_____/
/_____/  UU
`;

ConnectDB()
  .then(() => {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(asciiDog);
      console.log(`----------PORT:${port}--NODE-JS-SERVER-ACTIVE----------`);
    });
  })
  .catch((error) => console.log("Error DB : ", error));
