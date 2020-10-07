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
const HotSpot = sketch.HotSpot
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
          updateProject(value,cb => {
            if (cb ="done") {
              let identiferText = new ShapePath({
                parent: page,
                name: `flowy-identifier:${value}`,
                frame: { x: 10000, y: 10000, width: 1, height: 1 },
                style: { fills: ['#35E6C9']}

              })
            }
              else {
                UI.message('Flowy Error: Canceled Rendering')
            }
          })
        }
        else {

          loadProject(value, cb => {
            if (cb ="done") {
              let identiferText = new ShapePath({
                parent: page,
                name: `flowy-identifier:${value}`,
                frame: { x: 10000, y: 10000, width: 1, height: 1 },
                style: { fills: ['#35E6C9']}

              })
            }
              else {
                UI.message('Flowy Error: Canceled Rendering')
            }

          })

        }
    }
  }
)

}
else {
    UI.alert('FLOWY ERROR:',`${allData.message}
${allData.reason}`)
}


function cleanOld(thisNodeName){
  let currentInfoPanelGroup = sketch.find(`[name="${thisNodeName}_InfoPanel"]`)
  let currentOutputGroup = sketch.find(`[name="outputs"]`)
  let currentInputGroup = sketch.find(`[name="inputs"]`)



  if (currentInputGroup.length >= 1) {
    currentInputGroup.map(input => {
      if (input.parent.name === thisNodeName) {
        input.remove()
      }
    })
    }
    if (currentOutputGroup.length >= 1) {
      currentOutputGroup.map(input => {
        if (input.parent.name === thisNodeName) {
          input.remove()
        }
      })
    }
  if (currentInfoPanelGroup.length >= 1) {
    currentInfoPanelGroup[0].remove()
  }
}


function updateProject(project,cb){
  let currentIdentifier = sketch.find(`[name="flowy-identifier:${project}"]`)
      currentIdentifier[0].remove()

  let thisProject = networkRequest([`${api}/loadProject/:${project}`])

  let thisProjectNodes = Object.keys(thisProject.projectJson.nodes)
  let thisProjectLinks = Object.keys(thisProject.projectJson.links)
  let selectedLayers = document.selectedLayers
  let allArtBoards = selectedLayers.layers

  thisProjectNodes.map((node) => {
    let thisNodeName = thisProject.projectJson.nodes[node].name
    let currentArtboard = sketch.find(`[name="${thisNodeName}"]`)
    cleanOld(thisNodeName)

    let width, height = ''
    // if (!thisProject.projectJson.nodes[node].size) {
    //   width = thisProject.projectJson.nodes[node].position.width
    //   height = thisProject.projectJson.nodes[node].position.height
    // }
    // else {
      width = thisProject.projectJson.nodes[node].size.width
      height = thisProject.projectJson.nodes[node].size.height
    // }
    // console.log("Allports are:", allPorts);

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
    let nodeId = new ShapePath({
      parent: currentArtboard[0],
      name: `nodeId:${node}`,
      frame: { x: 0, y: 0, width: 1, height: 1 },
      style: { fills: ['#35E6C9']}
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
      layers:[nodeId,exportSlice,infoPanelBgSquare,infoPanelNodeName,infoPanelNodeDescription,nodePicture],
    })


        let thisPorts = Object.keys(thisProject.projectJson.nodes[node].ports)
        let inputPortGroup = new Group({
          name: `inputs`,
          parent: currentArtboard[0],
          frame: {x: 0, y:-16,  widht: width, height: 32 },
                  })
        let allInputPorts = thisPorts.map(port => {
          let x = thisProject.projectJson.nodes[node].ports[port].position.x;
          let y = thisProject.projectJson.nodes[node].ports[port].position.y;
          let type = thisProject.projectJson.nodes[node].ports[port].type;
          let text = thisProject.projectJson.nodes[node].ports[port].properties.value;
          let myPort, myPortInfo
          if (type === "input") {
            myPort = new ShapePath({
             name: `${node}:${port}:${type}`,
             parent: inputPortGroup,
             frame: { x: x, y: 0, width: 32, height: 32 },
             style: {
             fills: [{
               fill: '#FF00FF',
             }]
           }
           })
          myPortInfo = new Text({
             parent: inputPortGroup,
             name: `${node}:${port}:${type}_Info`,
             frame: { x: x, y: 16, width: 32, height: 32 },
             text: text,
               style: {
                 textColor: '#111',
                 fontSize: 10,
                 lineHeight: null,
                 aligenment: 'center'
               },
           })
         }
           return
        })

        let outputPortGroup = new Group({
          name: `outputs`,
          parent: currentArtboard[0],
          frame: {x: 0, y:height-16,  widht: width, height: 32 }
        })
        let allOutputPorts = thisPorts.map(port => {
          let x = thisProject.projectJson.nodes[node].ports[port].position.x;
          let y = thisProject.projectJson.nodes[node].ports[port].position.y;
          let type = thisProject.projectJson.nodes[node].ports[port].type;
          let text = thisProject.projectJson.nodes[node].ports[port].properties.value;
          let myPort, myPortInfo

                  if (type === "output") {
                    myPort = new ShapePath({
                     name: `${node}:${port}:${type}`,
                     parent: outputPortGroup,
                     frame: { x: width-x, y: height-16, width: 32, height: 32 },
                     style: {
                     fills: [{
                       fill: '#FF00FF',
                     }]
                   }
                   })
                   myPortInfo = new Text({
                      parent: outputPortGroup,
                      name: `${node}:${port}:${type}_Info`,
                      frame: { x: width-x, y: height-32, width: 32, height: 32 },
                      text: text,
                        style: {
                          textColor: '#111',
                          fontSize: 10,
                          lineHeight: null,
                          aligenment: 'center'
                        }
                    })
                  }
                  return
            })
  })

  thisProjectLinks.map(link => {
      let thisLink = thisProject.projectJson.links[link]

      let fromHotSpot
      // console.log("see the link", link, thisLink)
      let thisFromConnections = sketch.find(`[name="nodeId:${thisLink.from.nodeId}"]`)
      let thisFromPort = sketch.find(`[name="${thisLink.from.nodeId}:${thisLink.from.portId}:output"]`)
      // let thisFromPortDesc = sketch.find(`[name="${thisLink.from.nodeId}:${thisLink.from.portId}:output_Info"]`)
      let fromConnectionArtboardName = thisFromConnections[0].parent.name.split('_')
      fromConnectionArtboardName = fromConnectionArtboardName[0]
      let currentFromArtboard = sketch.find(`[name="${fromConnectionArtboardName}"]`)

      let thisToConnections = sketch.find(`[name="nodeId:${thisLink.to.nodeId}"]`)
      let toConnectionArboardName = thisToConnections[0].parent.name.split('_')
      toConnectionArboardName = toConnectionArboardName[0]
      let currentToArtboard = sketch.find(`[name="${toConnectionArboardName}"]`)

      if (thisFromPort.length >= 1 && currentToArtboard.length >= 1) {
        console.log("so much connections we have",thisFromPort[0].frame.x,thisLink,thisFromPort[0].name, thisToConnections.length, currentToArtboard[0]);
        new HotSpot({
          parent: thisFromPort[0].parent,
            name: thisFromPort[0].name,
            flow: {
              target: currentToArtboard[0],
            },
            frame: { x: 0 + thisFromPort[0].frame.x ,y:0,width:32,height:32}
          })
      }
      })
      thisProjectLinks.map(link => {
          let thisLink = thisProject.projectJson.links[link]

          let fromHotSpot
          // console.log("see the link", link, thisLink)
          let thisFromConnections = sketch.find(`[name="nodeId:${thisLink.from.nodeId}"]`)
          let thisFromPort = sketch.find(`[name="${thisLink.from.nodeId}:${thisLink.from.portId}:output"]`)
          // let thisFromPortDesc = sketch.find(`[name="${thisLink.from.nodeId}:${thisLink.from.portId}:output_Info"]`)
          let fromConnectionArtboardName = thisFromConnections[0].parent.name.split('_')
          fromConnectionArtboardName = fromConnectionArtboardName[0]
          let currentFromArtboard = sketch.find(`[name="${fromConnectionArtboardName}"]`)

          let thisToConnections = sketch.find(`[name="nodeId:${thisLink.to.nodeId}"]`)
          let toConnectionArboardName = thisToConnections[0].parent.name.split('_')
          toConnectionArboardName = toConnectionArboardName[0]
          let currentToArtboard = sketch.find(`[name="${toConnectionArboardName}"]`)

          let thisToPort = sketch.find(`[name="${thisLink.to.nodeId}:${thisLink.to.portId}:input"]`)
          console.log(thisToPort.length, thisToPort);
          if (thisToPort.length >= 1 && currentFromArtboard.length >= 1) {
            new HotSpot({
              parent: thisToPort[0].parent,
                name: thisToPort[0].name,
                flow: {
                  target: currentFromArtboard[0],
                },
                frame: { x: thisToPort[0].frame.x ,y:0,width:32,height:32}
              })
          }
        })



  cb("done")
}


// we load the project from the backend
function loadProject(project,cb){
  let thisProject = networkRequest([`${api}/loadProject/:${project}`])
  let thisProjectNodes = Object.keys(thisProject.projectJson.nodes)
  let thisProjectLinks = Object.keys(thisProject.projectJson.links)
  // console.log("these are the project links",thisProjectLinks.map(link => {
  //     return thisProject.projectJson.links[link]
  // })
  // )
  let allArtBoards = {}
  let currentIdentifier = sketch.find(`[name="flowy-identifier:${project}"]`)
  if (currentIdentifier.length >= 1) {

    currentIdentifier[0].remove()
  }
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
    let nodeId = new ShapePath({
      parent: allArtBoards[node],
      name: `nodeId:${node}`,
      frame: { x: 0, y: 0, width: 1, height: 1 },
      style: { fills: ['#35E6C9']}
    })
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
      layers:[nodeId,exportSlice,infoPanelBgSquare,infoPanelNodeDescription,infoPanelNodeName,nodePicture],
    })
    // frame: { x: 0, y: 0, width: width, height: height}

    infoPanelNodeName.style.borders = [{enabled:false}]
    nodePicture.style.borders = [{enabled:false}]
    infoPanelNodeDescription.style.borders = [{enabled:false}]

  })

  thisProjectLinks.map(link => {
      let thisLink = thisProject.projectJson.links[link]
      console.log("see the link", link, thisLink)
      let thisFromConnections = sketch.find(`[name="nodeId:${thisLink.from.nodeId}"]`)
      let thisToConnections = sketch.find(`[name="nodeId:${thisLink.to.nodeId}"]`)
      console.log("see if we have connections found", link, thisFromConnections, thisToConnections)
  })

  cb("done")
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

function parentOffsetInArtboard (layer) {
  var offset = {x: 0, y: 0};
  var parent = layer.parent;
  while (parent.name && parent.type !== 'Artboard') {
    offset.x += parent.frame.x;
    offset.y += parent.frame.y;
    parent = parent.parent;
  }
  return offset;
}

function positionInArtboard (layer, x, y) {
  var parentOffset = parentOffsetInArtboard(layer);
  var newFrame = new sketch.Rectangle(layer.frame);
  newFrame.x = x - parentOffset.x;
  newFrame.y = y - parentOffset.y;
  layer.frame = newFrame;
}
};
