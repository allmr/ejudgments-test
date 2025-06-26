
let dirName = process.argv.slice(2)[0];
var PetitionerData = require(`./aio/petitionerData.json`);
var fs = require('fs')
var PetitionerArray = [];
PetitionerData.forEach((element,index) => {
        PetitionerArray.push({id:index, view:element})
});
fs.writeFile(`./src/model/petitionerData.js`,`var Pdata=${JSON.stringify(PetitionerArray)};export default Pdata;`,()=>{
        console.log('Done :', dirName);
});
