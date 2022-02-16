const fs = require('fs').promises;
async function moveFile(source, destination) {
    try {
        await fs.rename(source, destination);
        console.log(`Moved file from ${source} to ${destination}`);
    } catch (error) {
        console.error(`Got an error trying to move the file: ${error.message}`);
    }
}
async function readFile(filePath) {
    try {
        const data = await fs.readFile(filePath);
        return data;
    } catch (error) {
        console.error(`Got an error trying to read the file: ${error.message}`);
    }
}

async function existFile(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch (error) {
        console.error(`Got an error trying to read the file: ${error.message}`);
        return false;
    }
}

async function deleteFile(filePath) {
    try {
        await fs.unlink(filePath);
        console.log(`Deleted ${filePath}`);
        return true;
    } catch (error) {
        console.error(`Got an error trying to delete the file: ${error.message}`);
        return false;
    }
}
module.exports = {
    moveFile,
    readFile,
    deleteFile,
    existFile
}