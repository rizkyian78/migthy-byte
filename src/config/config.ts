export default () => ({
  app: {
    interval: Number(process.env.INTERVAL) || 5000,
    port: Number(process.env.PORT) || 3000,
  },
});
