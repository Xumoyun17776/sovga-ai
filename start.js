process.env.NODE_ENV = 'production';
if (typeof PhusionPassenger !== 'undefined') {
  PhusionPassenger.configure({ autoInstall: false });
}
import('./dist/server/index.js').catch((err) => {
  console.error('Failed to start server:', err);
});
