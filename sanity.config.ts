import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { cloudinarySchemaPlugin } from 'sanity-plugin-cloudinary';
import { schemas } from './lib/sanity/schemas';

export default defineConfig({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET!,
  basePath: '/studio',
  // cloudinarySchemaPlugin serves images from the Cloudinary CDN rather than
  // copying them into Sanity's asset store — see lib/sanity/schemas/cloudinaryImage.ts
  plugins: [structureTool(), visionTool(), cloudinarySchemaPlugin()],
  schema: { types: schemas },
});
