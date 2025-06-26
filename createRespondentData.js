
let dirName = process.argv.slice(2)[0];
var RespondentData = require(`./aio/respondentData.json`);
var fs = require('fs')
var RespondentArray = [];
RespondentData.forEach((element,index) => {
        RespondentArray.push({id:index, view:element})
});
fs.writeFile(`./src/model/respondentData.js`,`var Rdata=${JSON.stringify(RespondentArray)};export default Rdata;`,()=>{
        console.log('Done :', dirName);
});
