import * as dotenv from "dotenv";
dotenv.config();

export default ({ config }) => {
  const appConfig = ({
    ...config,
    "plugins": [
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsDownloadToken": process.env.MAPBOX_SECRET_TOKEN
        }
      ]
    ],
  });

  return appConfig;
};
