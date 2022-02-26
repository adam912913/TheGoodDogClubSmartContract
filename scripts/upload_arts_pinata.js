require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const recursive = require('recursive-fs');
const basePathConverter = require('base-path-converter');
const FormData = require('form-data');

const pin_api_key = process.env.PIN_API_KEY;
const pin_api_secret = process.env.PIN_API_SECRET;

const dir_arts = './assets/arts/';
const dir_metadata = './assets/metadata/';
const art_extension = 'gif';
const conf_upload_arts_pinata = './assets/config/conf_upload_arts_pinata.json';
const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
const gateway_url = "https://gateway.pinata.cloud/ipfs/";

function naturalCompare(a, b) {
  var ax = [], bx = [];

  a.replace(/(\d+)|(\D+)/g, function (_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
  b.replace(/(\d+)|(\D+)/g, function (_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });

  while (ax.length && bx.length) {
    var an = ax.shift();
    var bn = bx.shift();
    var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
    if (nn) return nn;
  }

  return ax.length - bx.length;
}

upload_item = async (art_file_name, art_key, upload_status) => {
  try {
    let metadata_file_path = dir_metadata + art_key + '.json';
    if (fs.existsSync(metadata_file_path)) {
      print_current_time();
      // let art_file_name = dir_arts + art_key + '.' + art_extension;
      let art_file_path = dir_arts + art_file_name;
      let data = new FormData();
      data.append(`file`, fs.createReadStream(art_file_path), {
        filepath: basePathConverter(dir_arts, art_file_path)
      });
      let response = await axios.post(url, data, {
        maxContentLength: 'Infinity', //this is needed to prevent axios from erroring out with large directories
        maxBodyLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
          'pinata_api_key': pin_api_key,
          'pinata_secret_api_key': pin_api_secret
        }
      });
      if (response.status == 200) {
        let images_hash = response.data.IpfsHash;
        let cur_art_metadata = JSON.parse(fs.readFileSync(metadata_file_path));
        cur_art_metadata.image = gateway_url + images_hash;

        fs.writeFileSync(metadata_file_path, JSON.stringify(cur_art_metadata, null, '\t'));

        upload_status.uploaded_art_keys.push(art_key);
        upload_status.uploaded_art_hashes[art_key] = images_hash;
        console.log(art_key + ' -----> Success');
        if (response.data.isDuplicate) {
          console.log('isDuplicate - ' + art_key);
        }
        fs.writeFileSync(conf_upload_arts_pinata, JSON.stringify(upload_status, null, '\t'));
        remove_art_file(art_file_path);
        return true;
      }
      else {
        console.log(art_key + ' -----> False' + response.status)
      }
    }
    else {
      console.log('metadata no exist - ' + art_key + '.json')
    }
  } catch (err) {
    console.error(err)
    console.error('error occured - ' + art_key)
  }
  return false;
}

remove_art_file = async (art_file_path) => {
  fs.unlinkSync(art_file_path);
}

print_current_time = () => {
  let date_ob = new Date();

  // current date
  // adjust 0 before single digit date
  let date = ("0" + date_ob.getDate()).slice(-2);

  // current month
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

  // current year
  let year = date_ob.getFullYear();

  // current hours
  let hours = date_ob.getHours();

  // current minutes
  let minutes = date_ob.getMinutes();

  // current seconds
  let seconds = date_ob.getSeconds();
  // prints date & time in YYYY-MM-DD HH:MM:SS format
  console.log('---------- ' + year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + ' ----------');
}

upload_arts = async () => {
  recursive.readdirr(dir_arts, async function (err, dirs, files) {
    files.sort(naturalCompare)
    if (files.length > 0) {
      // upload_item(files[0]);
      let art_file_name = '';
      for (let i = 0; i < files.length; i++) {
        let art_file_path = files[i];
        var splitted = art_file_path.split("/");
        art_file_name = splitted[splitted.length - 1];
        art_key = parseInt(art_file_name.slice(0, art_file_name.indexOf('.', -1)));
        let upload_status = JSON.parse(fs.readFileSync(conf_upload_arts_pinata));
        var found = upload_status.uploaded_art_keys.find(element => element === art_key);
        if (found === undefined) {
          let res = await upload_item(art_file_name, art_key, upload_status);
          if (!res) {
            break;
          }
        }
        else {
          console.log('already uploaded - ' + art_file_name)
          remove_art_file(art_file_path);
        }
      }
    }
    else {
      console.log('There is nothing to upload.')
    }
  });
}

upload_arts();