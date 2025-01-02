const fs = require("fs-extra");

const src = "./node_modules/monaco-editor/min/vs";
const dest = "./src/assets/monaco-editor/vs";

fs.copy(src, dest, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Monaco assets copied successfully");
});
