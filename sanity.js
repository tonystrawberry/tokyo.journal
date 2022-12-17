import sanityClient from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const client = sanityClient({
  projectId: "fsashav3",
  dataset: "production",
  useCdn: false,
  apiVersion: "2021-10-21"
});

const builder = imageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);

export default client;
