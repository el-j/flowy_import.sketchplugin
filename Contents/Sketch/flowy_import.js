var onRun = function(context) {

const sketch = require('sketch')
const UI = require('sketch/ui')
const Style = sketch.Style
const Artboard = sketch.Artboard
const ShapePath = sketch.ShapePath
const Text = sketch.Text
const Image = sketch.Image
const Slice = sketch.Slice
const Rectangle = sketch.Rectangle
const Group = sketch.Group
const api = 'http://localhost:9023/api'
const projectsUrl = 'http://localhost:9023'
Text.Alignment.left

//we get all projects form the api
const allData = networkRequest([`${api}/getProjects`])
const allProjects = Object.keys(allData)
let document = sketch.getSelectedDocument()
// console.log(document);
let page = document.selectedPage
// console.log(allData);
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
          UI.message(`Update the Project: ${value}`)
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
  let selectedLayers = document.selectedLayers
  let allArtBoards = selectedLayers.layers

  thisProjectNodes.map((node) => {

  let currentArtboard = sketch.find(`[name="${thisProject.projectJson.nodes[node].name}"]`)
  let currentInfoPanelGroup = sketch.find(`[name="${thisProject.projectJson.nodes[node].name}_InfoPanel"]`)
  console.log("thisis the current artboard found",currentArtboard,node,currentInfoPanelGroup,thisProject.projectJson.nodes[node].name,selectedLayers.layers)
  // console.log("thisis the current artboard found",currentArtboard,thisProject.projectJson.nodes[node].name)
  if (currentInfoPanelGroup.length >= 1) {
    currentInfoPanelGroup[0].remove()
  }
  let width, height = ''
  if (!thisProject.projectJson.nodes[node].size) {
    width = thisProject.projectJson.nodes[node].position.width
    height = thisProject.projectJson.nodes[node].position.height
  }
  else {
    width = thisProject.projectJson.nodes[node].size.width
    height = thisProject.projectJson.nodes[node].size.height
  }

  let picWidth = thisProject.projectJson.nodes[node].picSize.width
  let picHeight = thisProject.projectJson.nodes[node].picSize.height
  let x = thisProject.projectJson.nodes[node].position.x
  let y = thisProject.projectJson.nodes[node].position.y
  let nodeName = thisProject.projectJson.nodes[node].name
  let artBoardName = thisProject.projectJson.nodes[node].name

  let exportSlice = new Slice({
    parent: currentArtboard[0],
    frame:  { x: 0, y: 0, width: width, height: picHeight },
    name: `${thisProject.projectJson.nodes[node].picture}`
  })
  let imagePath = `${projectsUrl}/projects/${thisProject.projectJson.nodes[node].path}`
  if (imagePath === 'http://localhost:9023/projects/no_image.png') {
    imagePath = "http://localhost:9023/no_image.png"
  }

  let imageurl_nsurl = NSURL.alloc().initWithString(imagePath);
  let nsimage = NSImage.alloc().initByReferencingURL(imageurl_nsurl);
  // console.log(imagePath);
  let nodePicture = new ShapePath({
    name: thisProject.projectJson.nodes[node].picture,
    parent: currentArtboard[0],
    frame: { x: 0, y: 0, width: picWidth, height: picHeight},
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
  /*
    The info area from flowy. create all the elements and add them at the end to a group
  */
  let infoPanelBgSquare = new ShapePath({
    name: `${thisProject.projectJson.nodes[node].picture}_bg`,
    parent: currentArtboard[0],
    frame: { x: 0, y: picHeight, width: width, height: height-picHeight},
    style: {
    fills: [{
      fill: '#FFFFFF',
    }]
  }
  })
  let infoPanelNodeName = new Text({
    parent: currentArtboard[0],
    name: `${nodeName}`,
    text: `${nodeName}`,
    frame: { x: 20, y: picHeight+10,width: width, height: perectage(20,height-picHeight)},
      style: {
        textColor: '#111',
        fontSize: 20,
        lineHeight: null,
        paragraphSpacing:perectage(120,20),
        aligenment: 'left'
      },
  })
  let infoPanelNodeDescription = new Text({
    parent: currentArtboard[0],
    name: `${thisProject.projectJson.nodes[node].text}`,
    text: `${thisProject.projectJson.nodes[node].text}`,
    frame: { x: 20, y: picHeight+40, width: width, height: perectage(80,height-picHeight) },
      style: {
        textColor: '#333',
        lineHeight: null,
        paragraphSpacing:perectage(120,10),
        fontSize: 10,
      },
  })
  nodePicture.style.borders = [{enabled:false}]
  infoPanelNodeName.style.borders = [{enabled:false}]
  infoPanelNodeDescription.style.borders = [{enabled:false}]
  currentArtboard[0].frame.height = height

  let infoPanel = new Group({
    name: `${thisProject.projectJson.nodes[node].name}_InfoPanel`,
    parent: currentArtboard[0],
    layers:[exportSlice,infoPanelBgSquare,infoPanelNodeName,infoPanelNodeDescription,nodePicture],
  })
  // frame: { x: 0, y: 0, width: width, height: height}


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
    let picWidth = thisProject.projectJson.nodes[node].picSize.width
    let picHeight = thisProject.projectJson.nodes[node].picSize.height
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

    let exportSlice = new Slice({
      parent: allArtBoards[node],
      frame:  { x: 0, y: 0, width: width, height: picHeight },
      name: `${thisProject.projectJson.nodes[node].picture}`
    })
    let imagePath = `${projectsUrl}/projects/${thisProject.projectJson.nodes[node].path}`
    if (imagePath === 'http://localhost:9023/projects/no_image.png') {
      imagePath = "http://localhost:9023/no_image.png"
    }

    let imageurl_nsurl = NSURL.alloc().initWithString(imagePath);
    let nsimage = NSImage.alloc().initByReferencingURL(imageurl_nsurl);
    // console.log(imagePath);
    let nodePicture = new ShapePath({
      name: thisProject.projectJson.nodes[node].picture,
      parent: allArtBoards[node],
      frame: { x: 0, y: 0, width: picWidth, height: picHeight},
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

    /*
      The info area from flowy. create all the elements and add them at the end to a group
    */
    let infoPanelBgSquare = new ShapePath({
      name: `${thisProject.projectJson.nodes[node].picture}_bg`,
      parent: allArtBoards[node],
      frame: { x: 0, y: picHeight, width: width, height: height-picHeight},
      style: {
      fills: [{
        fill: '#FFFFFF',
      }]
    }
    })
    let infoPanelNodeName = new Text({
      parent: allArtBoards[node],
      name: `${nodeName}`,
      text: `${nodeName}`,
      frame: { x: 20, y: picHeight+10,width: width, height: perectage(20,height-picHeight)},
        style: {
          textColor: '#111',
          fontSize: 20,
          lineHeight: null,
          paragraphSpacing:perectage(120,20),
          aligenment: 'left'
        },
    })
    let infoPanelNodeDescription = new Text({
      parent: allArtBoards[node],
      name: `${thisProject.projectJson.nodes[node].text}`,
      text: `${thisProject.projectJson.nodes[node].text}`,
      frame: { x: 20, y: picHeight+40, width: width, height: perectage(80,height-picHeight) },
        style: {
          textColor: '#333',
          lineHeight: null,
          paragraphSpacing:perectage(120,10),
          fontSize: 10,
        },
    })
    let infoPanel = new Group({
      name: `${thisProject.projectJson.nodes[node].name}_InfoPanel`,
      parent: allArtBoards[node],
      layers:[exportSlice,infoPanelBgSquare,infoPanelNodeDescription,infoPanelNodeName,nodePicture],
    })
    // frame: { x: 0, y: 0, width: width, height: height}

    infoPanelNodeName.style.borders = [{enabled:false}]
    nodePicture.style.borders = [{enabled:false}]
    infoPanelNodeDescription.style.borders = [{enabled:false}]

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
