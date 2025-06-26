let today = new Date();
let dd = today.getDate();
let mm = today.getMonth() + 1;
let yyyy = today.getFullYear();
if (dd < 10) {
  dd = "0" + dd; //like 01
}
if (mm < 10) {
  mm = "0" + mm; //like 03 for March
}

module.exports = {
  dd,
  mm,
  yyyy,
};
