const fs = require('fs');
const { MongoClient } = require("mongodb");
require("dotenv").config();

const activitiesDir = "./activities";

const client = new MongoClient(process.env.MONGODB_URI, {
    appname: "PresenceDB-Updater",
    useUnifiedTopology: true
});

const main = async () => {
    console.log("Starting update...");
    await client.connect();
    console.log("Connected to db");
    const collection = client.db(process.env.MONGODB_DB).collection("activities");
    const dir = await fs.promises.opendir(activitiesDir);
    for await (const file of dir) {
        const json = JSON.parse(fs.readFileSync(`${activitiesDir}/${file.name}`));
        const applicationId = file.name.replace(".json", "");
        const color = json.color;
        const imgUrl = json.imageUrl;

        console.log(`Updating ${applicationId}...`);
        await collection.findOneAndUpdate({"applicationId": applicationId}, {$set: {"color": color, "imgUrl": imgUrl}});
        console.log(`Finished ${applicationId}.`);
    };
    console.log("Update done.")
    process.exit(0);
}

main();