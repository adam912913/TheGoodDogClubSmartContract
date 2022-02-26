const fs = require('fs');
const recursive = require('recursive-fs');

const dir_metadata = './assets/metadata/';
const dir_tgdc_metadata = './assets/tgdc_metadata/';
const total_generate_count = 1000;

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

generate_randon_metadata = async () => {
  let metadata_file_list = [];
  recursive.readdirr(dir_metadata, async function (err, dirs, files) {
    files.sort(naturalCompare)
    for (let i = 0; i < files.length; i++) {
      let art_file_path = files[i];
      var splitted = art_file_path.split("/");
      metadata_file_list.push(splitted[splitted.length - 1]);
    }
    console.log(metadata_file_list)
    let existing_metadata_count = metadata_file_list.length;
    let rand_index = 0;
    for (let i = 1; i <= total_generate_count; i++) {
      rand_index = Math.floor(Math.random() * (existing_metadata_count - 1));
      console.log(rand_index)

      let data = JSON.parse(fs.readFileSync(dir_metadata + metadata_file_list[rand_index]));

      fs.writeFileSync(dir_tgdc_metadata + i + '.json', JSON.stringify(data, null, '\t'));
    }
  });
}

generate_randon_metadata();