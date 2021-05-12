import { promisify } from "util";
import fs from "fs";

export default {
  readFile: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
};
