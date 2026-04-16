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

    // Create vulntest directory inside public_html
    await client.ensureDir('/public_html/vulntest');
    console.log('Directory /public_html/vulntest ready');

    // Upload the vulntest folder contents
    const srcPath = path.join(__dirname, 'vulntest');
    console.log(`Uploading from: ${srcPath}`);

    await client.clearWorkingDir();
    await client.uploadFromDir(srcPath);

    console.log('Upload complete!');
    console.log('Vulntest available at: https://aidream.hu/vulntest/');

  } catch (err) {
    console.error('FTP Error:', err.message);
  } finally {
    client.close();
  }
}

deploy();
