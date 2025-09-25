export const flags = {
  GA: process.env.FEATURE_GA === '1',
  SHOW_INVITES: process.env.FEATURE_INVITES !== '0',
};
