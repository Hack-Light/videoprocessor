const fs = require("fs");
const path = require("path");
// let { success, fail } = require("./response");
let { downloadAsJson, uploadFromMemory } = require("./gcloud-bucket");

let local = true;

exports.createFile = async (res, name, data, type, folder, num = 0) => {
  if (!local) {
    let res1 = await uploadFromMemory(name, folder, data, type);

    if (res1) {
      res.status(201).json({ success: true });
    } else {
      res.status(200).json({ success: false });
    }
  } else {
    let dir = path.join(
      "/Users/light/Documents/projects/blockOsphereSever",
      `${folder}`
    );

    console.log("directory", dir, data);

    fs.writeFile(`${dir}/${name}.${type}`, data, function (err) {
      if (err) {
        console.log("got error now");

        res.status(200).json({ success: false });
      }

      console.log("got here now");

      res.status(201).json({ success: true });
    });
  }
};

exports.readFile = async (name) => {
  console.log("result1");
  try {
    if (!local) {
      let result = await downloadAsJson(name, "Blocks");

      console.log("result", result);

      return result;
    } else {
      const feedback = fs.readFileSync(`./blocks/${name}.json`);
      return JSON.parse(feedback);
    }
  } catch (error) {
    console.log(error);
  }
};
