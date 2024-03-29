          var onRun = function(context) {


const sketch = require('sketch')
const UI = require('sketch/ui')
const Style = sketch.Style
const Artboard = sketch.Artboard
const ShapePath = sketch.ShapePath
const Text = sketch.Text
const Image = sketch.Image
const Rectangle = sketch.Rectangle
const api = 'http://localhost:9023/api'
const projectsUrl = 'http://localhost:9023'
Text.Alignment.left

//we get all projects form the api
const allData = networkRequest([`${api}/getProjects`])
const allProjects = Object.keys(allData)
let document = sketch.getSelectedDocument()
// console.log(document);
let page = document.selectedPage
console.log(allData);
if (!allData.error) {


// the user has to choose the project that is loaded
UI.getInputFromUser(
  "Choose the flowy Project you want to render",
  {
   type: UI.INPUT_TYPE.selection,
   possibleValues: allProjects,
 },
  (err, value) => {
    if (err) {
      UI.message('Flowy Canceled')
      return
    } else {
      let idname = `flowy-identifier:${value}`
        let isIdentifier = sketch.find(`[name="${idname}"]`)
        if (isIdentifier.length > 0) {
          // console.log("show me the result",isIdentifier,sketch.find(`Shape, [name="flowy-identifier:${value}"]`));
          UI.message(`TODO: Update the Project: ${value}`)
          updateProject(value)
        }
        else {
          let identiferText = new ShapePath({
            parent: page,
            name: `flowy-identifier:${value}`,
            frame: { x: 10000, y: 10000, width: 1, height: 1 },
            style: { fills: ['#35E6C9']}

          })
          loadProject(value)
        }
    }
  }
)

}
else {
    UI.alert('FLOWY ERROR:',`${allData.message}
${allData.reason}`)
}


function updateProject(project){
  let thisProject = networkRequest([`${api}/loadProject/:${project}`])
  let thisProjectNodes = Object.keys(thisProject.projectJson.nodes)
  let thisProjectLinks = Object.keys(thisProject.projectJson.links)
  let allArtBoards = {}
  thisProjectNodes.map((node) => {
  let currentArtboard = sketch.find(`[name="${thisProject.projectJson.nodes[node].name}"]`)

  })
}

// we load the project from the backend
function loadProject(project){
  let thisProject = networkRequest([`${api}/loadProject/:${project}`])
  let thisProjectNodes = Object.keys(thisProject.projectJson.nodes)
  let thisProjectLinks = Object.keys(thisProject.projectJson.links)

  let allArtBoards = {}

  // we create all nodes as artboards
  thisProjectNodes.map((node) => {
    // console.log(thisProject.projectJson.nodes[node])
    let width, height = ''
    if (!thisProject.projectJson.nodes[node].size) {
      width = thisProject.projectJson.nodes[node].position.width
      height = thisProject.projectJson.nodes[node].position.height
    }
    else {
      width = thisProject.projectJson.nodes[node].size.width
      height = thisProject.projectJson.nodes[node].size.height
    }
    // console.log(thisProject.projectJson.nodes[node])
    let x = thisProject.projectJson.nodes[node].position.x
    let y = thisProject.projectJson.nodes[node].position.y
    let nodeName = thisProject.projectJson.nodes[node].name
    let artBoardName = thisProject.projectJson.nodes[node].name
    if (artBoardName.includes('_')) {
      artBoardName = artBoardName.replace(/_/g,' / ')
    }

    allArtBoards[node] = new Artboard({ parent: page,
      frame: { x: x, y: y, width: width, height: height },
      name: artBoardName
    })

    let nodeNameText = new Text({
      parent: allArtBoards[node],
      name: `${nodeName}`,
      text: `${nodeName}`,
      frame: { x: 20, y: perectage(85,height),width: width, height: 20},
        style: {
          textColor: '#111',
          fontSize: 20,
          lineHeight: null,
          paragraphSpacing:perectage(120,20),
          aligenment: 'left'
        },
    })
    let nodeDescriptionText = new Text({
      parent: allArtBoards[node],
      name: `${thisProject.projectJson.nodes[node].text}`,
      text: `${thisProject.projectJson.nodes[node].text}`,
      frame: { x: 20, y: perectage(85,height)+perectage(120,20), width: width, height: 10 },
        style: {
          textColor: '#333',
          lineHeight: null,
          paragraphSpacing:perectage(120,10),
          fontSize: 10,
        },
    })

    nodeNameText.style.borders = [{enabled:false}]
    nodeDescriptionText.style.borders = [{enabled:false}]

    let imagePath = `${projectsUrl}/projects/${thisProject.projectJson.nodes[node].path}`
    if (imagePath === 'http://localhost:9023/projects/no_image.png') {
      imagePath = "http://localhost:9023/no_image.png"
    }

    let imageurl_nsurl = NSURL.alloc().initWithString(imagePath);
    let nsimage = NSImage.alloc().initByReferencingURL(imageurl_nsurl);
    // console.log(imagePath);
    let mySquare = new ShapePath({
      name: thisProject.projectJson.nodes[node].picture,
      parent: allArtBoards[node],
      frame: { x: 0, y: 0, width: width, height: perectage(80,height) },
      style: {
      fills: [{
        fill: 'Pattern',
        pattern: {
          patternType: Style.PatternFillType.Fit,
          image: nsimage
        }
      }]
    }
    })
  //   var imageLayer = new Image({
  //     name:thisProject.projectJson.nodes[node].path,
  //         parent: allArtBoards[node],
  //   image: imageurl_nsurl,
  //   frame: new Rectangle(0, 0, 300, 200),
  // })

    // thisProjectLinks.map((link) => {
      // console.log(thisProject.projectJson.links[link])
      // let width = thisProject.projectJson.links[link].size.width
      // let height = thisProject.projectJson.links[link].size.height
      // let x = thisProject.projectJson.links[link].position.x
      // let y = thisProject.projectJson.links[link].position.y
      // allArtBoards[node] = new Artboard({ parent: page,
      //   frame: { x: x, y: y, width: width, height: height },
      //   name: node
      // })
      // let myText = new Text({
      //   parent: allArtBoards[node],
      //   name: `nodeText${link}`,
      //   text: `What a nice thing ${link}`
      // })
      // let mySquare = new ShapePath({
      //     parent: allArtBoards[node],
      //     frame: { x: 53, y: 213, width: 122, height: 122 },
      //     style: { fills: ['#35E6C9']}
      // })
    // })
  })
}



// let selectedLayers = document.selectedLayers
// let selectedCount = selectedLayers.length
//
// if (selectedCount === 0) {
//   console.log('No layers are selected.')
// } else {
//   console.log('Selected layers:');
//   selectedLayers.forEach(function (layer, i) {
//     console.log((i + 1) + '. ' + layer.name)
//   })
// }

function perectage(input,max){
  let temp = (max/100)*input
  console.log(temp)
  return temp
}
// helper function parsing the answer from the api
function tryParseJSON (jsonString){
  try {
    let o = JSON.parse(jsonString);

    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns 'null', and typeof null === "object",
    // so we must check for that, too.
    if (o && typeof o === "object" && o !== null) {
      return o;
    }
  }
  catch (e) { }

  return false;
}

// helper function doing the api requests
function networkRequest(args) {
  const task = NSTask.alloc().init();
  task.setLaunchPath("/usr/bin/curl");
  task.setArguments(args);
  const outputPipe = [NSPipe pipe];
  [task setStandardOutput:outputPipe];
  task.launch();
  const responseData = [[outputPipe fileHandleForReading] readDataToEndOfFile];
  const responseString = [[[NSString alloc] initWithData:responseData encoding:NSUTF8StringEncoding]];
  const parsed = tryParseJSON(responseString);
  if(!parsed) {
    log("Error invoking curl");
    log("args:");
    log(args);
    log("responseString");
    log(responseString);
    return {error:'ERROR',message:"Your Projects cannot be loaded. Maybe flowy Api is down?",reason:responseData}
  }
  return parsed;
}

// helper function Object.keys() seems to not work inside sketch plugin.
if (!Object.keys) {
  Object.keys = (function () {
    'use strict';
    const hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      let result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

          };
