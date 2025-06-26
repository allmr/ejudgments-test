let dirName = process.argv.slice(2)[0];
var CitationData = require(`./${dirName}/equivalentCitationData.json`);
var fs = require('fs')
var CitationArray = [];
CitationData.forEach((element,index) => {
        CitationArray.push({id:index, view:element})
});
fs.writeFile(`./src/model/equalCitationData.js`,`var equivalentCitationData=${JSON.stringify(CitationArray)};export default equivalentCitationData;`,()=>{
    console.log('Done :', dirName);
})
