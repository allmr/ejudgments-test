
let dirName = process.argv.slice(2)[0];
var CitationData = require(`./${dirName}/citationData.json`);
var fs = require('fs')
var CitationArray = [];
CitationData.forEach((element,index) => {
        CitationArray.push({id:index, Citation:element})
});
fs.writeFile(`./src/model/CitationData.js`,`var citationData=${JSON.stringify(CitationArray)};export default citationData;`,()=>{
        console.log('Done :', dirName);
});
