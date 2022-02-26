const xlsx = require('xlsx')
var fs = require('fs')

async function createMetadataFiles(sheetdata) {
  let i = 0
  let j = 0
  const len = sheetdata.length
  for (i = 0; i < len; i++) {
    const element = sheetdata[i]
    const key_list = Object.keys(element)
    if (key_list.length < 13) {
      break
    }
    let json_data = {
      name: 'Good Dog Club #' + element.No,
      description: 'Good Dog Club #' + element.No,
      // image: element.FileName,
      image: "https://gateway.pinata.cloud/ipfs/QmTmdUxUmRA6dDduxQCiAuxkqBQZrziJntMZNXXJ6XmEp9",
      Properties: {
        files: [
          {
            uri: 'image.gif',
            type: 'image/gif',
          },
        ],
        category: 'image',
      },
    }
    let attributes = []
    for (j = 2; j < key_list.length; j++) {
      attributes.push({ trait_type: key_list[j], value: element[key_list[j]] })
    }
    json_data['attributes'] = attributes
    let metadata_file_name = element.No + '.json'
    console.log(metadata_file_name)
    fs.writeFileSync(
      './assets/metadata/' + metadata_file_name,
      JSON.stringify(json_data, null, '\t'),
    )
  }
  return
}

function convertExcelFileToJsonUsingXlsx() {
  // Read the file using pathname
  const file = xlsx.readFile('./assets/excel/Metadata_GoodDogClub.xlsx')
  // Grab the sheet info from the file
  const sheetNames = file.SheetNames
  const totalSheets = sheetNames.length
  if (totalSheets > 0) {
    // Convert to json using xlsx
    const tempData = xlsx.utils.sheet_to_json(file.Sheets[sheetNames[0]])
    // Skip header row which is the colum names
    // tempData.shift()
    createMetadataFiles(tempData)
  }
}

convertExcelFileToJsonUsingXlsx()
