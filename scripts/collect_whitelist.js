const fs = require('fs');
const WAValidator = require('wallet-address-validator');

var mint_step = 0;
var whitelist_src_txt_file_path = './assets/whitelist_txt/';
var whitelist_src_txt_file_name = 'whitelist.txt';

function jsonTotxt() {
  let address_list = JSON.parse(fs.readFileSync('./assets/whitelist_txt/whitelist_0.json'));
  let txtContents = '';
  for (let i = 0; i < address_list.length; i++) {
    const element = address_list[i];
    console.log(element)
    txtContents += element + "\n";
  }
  fs.writeFileSync(whitelist_src_txt_file_path + whitelist_src_txt_file_name, txtContents);
}

function txtTojson() {
  try {
    // read contents of the file
    const data = fs.readFileSync(whitelist_src_txt_file_path + whitelist_src_txt_file_name, 'UTF-8');
    // split the contents by new line
    const lines = data.split(/\r?\n/);
    let addressList = [];
    let invalidAddressList = [];
    // print all lines
    lines.forEach((line) => {
      if (line.includes('0x')) {
        let start = line.indexOf('0x');
        let address = line.slice(start);
        let end = address.indexOf(' ');
        if (end != -1)
          address = address.slice(start, end);
        address = address.trim();
        const valid = WAValidator.validate(address, 'ETH');
        if (valid) {
          addressList.push(address);
          // console.log(address, start, end, valid);
        } else {
          invalidAddressList.push(address);
          // console.log(address, start, end, valid);
        }
      }
    });

    console.log('Count: ', addressList.length);
    console.log('Invalid Count: ', invalidAddressList.length);
    console.log('Invalid Address: ', invalidAddressList);

    let cleanResult = [];
    for (let i = 0; i < addressList.length; i++) {
      const tmp = addressList[i];
      const tmpoutputJson = addressList.slice(i + 1);
      if (tmpoutputJson.indexOf(tmp) != -1) {
        console.log(`Repeated address - ${tmp}`);
      } else {
        cleanResult.push(tmp);
      }
    }

    console.log("Clean Result Count: ", cleanResult.length);

    const json = JSON.stringify(cleanResult, null, '\t');
    let json_file_name = whitelist_src_txt_file_path + 'whitelist_' + mint_step + '.json';
    fs.writeFile(json_file_name, json, 'utf8', function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log(json_file_name + ' is created.')
      }
    });
  } catch (err) {
    console.error(err);
  }

}

// jsonTotxt();
txtTojson();