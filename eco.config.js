module.exports = {
  apps: [
    {
      name: 'portfolio-server',
      script: './server/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'portfolio-client',
      script: 'npm',
      args: 'run preview',
      cwd: './client',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};