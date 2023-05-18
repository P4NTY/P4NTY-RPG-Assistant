const fs = require('fs');

function saveDataToFile(filename, data) {
//   const filePath = path.join(__dirname, filename);

  try {
    fs.writeFileSync('./'+filename, JSON.stringify(data));
    console.log('Data saved to file');
  } catch (error) {
    console.error(error);
  }
}

module.exports = {saveDataToFile}