
let dirName = process.argv.slice(2)[0];
var PartyNameData = require(`./aio/partyNameData.json`);
var fs = require('fs')
var PartyNameArray = [];
PartyNameData.forEach((element,index) => {
        PartyNameArray.push({id:index, partyName:element})
});
fs.writeFile(`./src/model/partyNameData.js`,`var partyNameData=${JSON.stringify(PartyNameArray)};export default partyNameData;`,()=>{
        console.log('Done :', dirName);
});
