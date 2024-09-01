const fs = require('fs-extra');
const path = require('path');

function replacePlaceholders(dir, replacements) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        replacePlaceholders(filePath, replacements);
      } else {
        let content = fs.readFileSync(filePath, 'utf8');
        for (const [key, value] of Object.entries(replacements)) {
          content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  }
  

module.exports = replacePlaceholders;