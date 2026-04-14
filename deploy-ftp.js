const ftp = require('basic-ftp');
const path = require('path');

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: 's12.tarhelyadmin.com',
      user: 'aidreamh',
      password: 'nuIOAz;I]G$w',
      secure: false,
      port: 21,
    });

    console.log('Connected to FTP server');

    // Create auradef directory inside public_html
    await client.ensureDir('/public_html/auradef');
    console.log('Directory /public_html/auradef ready');

    // Upload the dist folder contents
    const distPath = path.join(__dirname, 'frontend', 'dist');
    console.log(`Uploading from: ${distPath}`);

    await client.clearWorkingDir(); // Clear old files
    await client.uploadFromDir(distPath);

    console.log('Upload complete!');
    console.log('Site available at: https://aidream.hu/auradef');

  } catch (err) {
    console.error('FTP Error:', err.message);
  } finally {
    client.close();
  }
}

deploy();
