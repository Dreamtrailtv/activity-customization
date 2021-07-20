const fs = require("fs");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const customizationsDir = "./customizations";

const client = new MongoClient(process.env.MONGODB_URI, {
  appname: "PresenceDB-Updater",
  useUnifiedTopology: true,
});

const main = async () => {
  await client.connect();
  console.log("Connection to database succeeded.");
  const collection = client.db(process.env.MONGODB_DB).collection("activities");
  const dir = await fs.promises.opendir(customizationsDir);
  for await (const file of dir) {
    const json = JSON.parse(
      fs.readFileSync(`${customizationsDir}/${file.name}`)
    );

    for (const applicationId of json.ids) {
      const color = json.color;
      const imgUrl = json.imageUrl;

      await collection.findOneAndUpdate(
        { applicationId: applicationId },
        { $set: { color: color, imgUrl: imgUrl } }
      );
      console.log(`[${file.name}] Updated ${applicationId}`);
    }
  }
  process.exit(0);
};

main();
