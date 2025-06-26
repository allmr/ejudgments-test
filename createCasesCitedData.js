
let dirName = process.argv.slice(2)[0];
var CasesCitedData = require(`./${dirName}/casesCitedData.json`);
var fs = require('fs')
var CasesCitedArray = [];
CasesCitedData.forEach((element,index) => {
        CasesCitedArray.push({id:index, citation:element})
});
fs.writeFile(`./src/model/CasesCitedData.js`,`var casesCitedData=${JSON.stringify(CasesCitedArray)};export default casesCitedData;`,()=>{
        console.log('Done :', dirName);
});
