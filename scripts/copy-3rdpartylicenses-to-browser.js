const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '../', 'dist', 'launch-countdown-timer');

fs.copyFile(path.join(basePath, '3rdpartylicenses.txt'), path.join(basePath, 'browser/3rdpartylicenses.txt'), (err) => {

  if (err) {
    console.log(`3rdpartylicenses.txt wasn't copied`);
    process.exit(-1);
  }

  console.log(`3rdpartylicenses.txt was copied`);
});
