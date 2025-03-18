const fs = require('fs');

// Read the JSON file
fs.readFile('readme.json', 'utf8', (err, data) => {
    if (err) throw err;

    // Parse JSON and extract readme content
    const jsonData = JSON.parse(data);
    const readmeContent = jsonData.readme;

    // Write to README.md
    fs.writeFile('README.md', readmeContent, 'utf8', (err) => {
        if (err) throw err;
        console.log('README.md has been generated successfully!');
    });
});