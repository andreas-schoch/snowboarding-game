// Approach as described here for now: https://prateeksurana.me/blog/using-environment-variables-with-webpack/
const POCKETBASE_ENABLED = process.env.POCKETBASE_ENABLED === 'true' || process.env.POCKETBASE_ENABLED === 'True';
const POCKETBASE_API = process.env.POCKETBASE_API;

export const env = {
  POCKETBASE_ENABLED,
  POCKETBASE_API,
};
