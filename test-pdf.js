const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\sayv\\AppData\\Local\\Temp\\playwright-mcp-output\\1766368917626\\RoschCapital-Receipt-cmjfuympi00fenm0p7clod8bo.pdf';

fs.readFile(pdfPath, (err, dataBuffer) => {
  if (err) {
    console.error('Error reading PDF:', err);
    return;
  }

  pdf(dataBuffer).then(data => {
    console.log('\n=== PDF ANALYSIS ===');
    console.log('Number of pages:', data.numpages);
    console.log('Number of renders:', data.numrender);
    console.log('\n=== PDF TEXT CONTENT ===');
    console.log(data.text);
    console.log('\n=== END ===');
  }).catch(err => {
    console.error('Error parsing PDF:', err);
  });
});
