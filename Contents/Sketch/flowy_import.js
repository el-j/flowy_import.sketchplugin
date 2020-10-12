var onRun = function(context) {
  // b87f0364144ebee8c0f812e29bd9e054443b2e3894d08d083fac881ddcfc4fe2
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
  let update = false;
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
      "Choose the flowy Project you want to render", {
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
            update = true;
            // console.log("show me the result",isIdentifier,sketch.find(`Shape, [name="flowy-identifier:${value}"]`));
            UI.message(`Update the Project: ${value}`)

          } else {
            update = false;
          }
          loadProject(value, update, cb => {
            if (cb = "done") {
              let identiferText = new ShapePath({
                parent: page,
                name: `flowy-identifier:${value}`,
                frame: {
                  x: 10000,
                  y: 10000,
                  width: 1,
                  height: 1
                },
                style: {
                  fills: ['#35E6C9']
                }

              })
            } else {
              UI.message('Flowy Error: Canceled Rendering')
            }
          })
        }
      }
    )

  } else {
    UI.alert('FLOWY ERROR:', `${allData.message} ${allData.reason}`)
  }


  function cleanOld(thisNodeName) {
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





  function makeConnectors(thisNode,currentArtboard,nodeId) {
      // console.log("we do the node", thisNode.name);
      let thisPortNames = Object.keys(thisNode.ports)
      let nodeWidth, nodeHeight = ''
      nodeWidth = thisNode.size.width
      nodeHeight = thisNode.size.height
      let nodeName = thisNode.name

      let nodePosX = thisNode.position.x
      let nodePosY = thisNode.position.y
      let inputPortGroup = new Group({
        name: `inputs`,
        parent: currentArtboard,
        frame:{x:0,y:0,width:500,height:32}
      })
      // positionInArtboard
      // // console.log("add all input ports", nodeName);
      let allInputPorts = thisPortNames.reduce((ports,port) => {
        let thisPort = thisNode.ports[port]
        let x = thisPort.position.x;
        let y = thisPort.position.y;
        let type = thisPort.type;
        let text = thisPort.properties.value;
        let myPort, myPortInfo

        if (type === "input") {
          console.log("input x",x);
          myPort = new ShapePath({
            name: `${nodeId}:${port}:${type}`,
            parent: currentArtboard,
            frame: {
              x: x,
              y: 0,
              width: 24,
              height: 24
            },
            style: {
              fill: '#FF00FF',
              stroke: '#00FF00'
              }
            })

          myPortInfo = new Text({
            fixedWidth: true,
            parent: currentArtboard,
            name: `${nodeId}:${port}:${type}_Info`,
            frame: {
              x: x,
              y: 24,
              width: 120,
              height: 32
            },
            text: text ? text : "no labeltext",
            style: {
              textColor: '#111',
              fontSize: 10,
              lineHeight: null,
              aligenment: 'center'
            },
          })
          ports.push(myPort,myPortInfo)
        }
        return ports

      },[])
      console.log(allInputPorts);
      console.log("add the inputPort Group", nodeName,"width",nodeWidth,"x:",nodePosX,"y:",nodePosY);
      inputPortGroup.layers = allInputPorts

      let outputPortGroup = new Group({
        name: `outputs`,
        parent: currentArtboard,
        frame:{x:0,y:nodeHeight+32,width:500,height:32}
      })
      // positionInArtboard
      // // console.log("add all input ports", nodeName);
      let allOutputPorts = thisPortNames.reduce((ports,port) => {
        let thisPort = thisNode.ports[port]
        let x = thisPort.position.x;
        let y = thisPort.position.y;
        let type = thisPort.type;
        let text = thisPort.properties.value;
        let myPort, myPortInfo

        if (type === "output") {
          console.log("output x",x);
          myPort = new ShapePath({
            name: `${nodeId}:${port}:${type}`,
            parent: currentArtboard,
            frame: {
              x: x,
              y: 8,
              width: 24,
              height: 24
            },
            style: {
              fill: '#FF00FF',
              stroke: '#00FF00'
              }
            })

          myPortInfo = new Text({
            fixedWidth: true,
            parent: currentArtboard,
            name: `${nodeId}:${port}:${type}_Info`,
            frame: {
              x: x,
              y: 0,
              width: 120,
              height: 32
            },
            text: text ? text : "no labeltext",
            style: {
              textColor: '#111',
              fontSize: 10,
              lineHeight: null,
              aligenment: 'center'
            },
          })
          ports.push(myPort,myPortInfo)
        }
        return ports

      },[])
      console.log(allOutputPorts);
      console.log("add the outputPort Group", nodeName,"width",nodeWidth,"x:",nodePosX,"y:",nodePosY);
      outputPortGroup.layers = allOutputPorts
      return
    }


  function makeHotSpotFromLinks(thisProject,artboards) {
    let thisProjectLinkNames = Object.keys(thisProject.projectJson.links)
    let thisProjectLinks = thisProject.projectJson.links
    thisProjectLinkNames.map(link => {
      let thisLink = thisProjectLinks[link]

      let fromHotSpot
      console.log("From Artboard Name",artboards[thisLink.from.nodeId].name,"to Artboardname >",artboards[thisLink.to.nodeId].name);
      // let thisFromConnections = sketch.find(`[name="nodeId:${thisLink.from.nodeId}"]`)
      let fromArtboard = artboards[thisLink.from.nodeId]
      // console.log("see the link", link, thisLink)
      let fromArtboardlayers = fromArtboard.layers
      let temp
      let thisFromPort = {}

      let fromArtboardOutputs = fromArtboardlayers.filter(layer => {
          if (layer.name === 'outputs') {
            temp = layer.layers
            return temp
          }
      })
      if (fromArtboardOutputs.length >= 1) {
        thisFromPort = fromArtboardOutputs.filter(port => {
          // console.log("show me portname",port.name,port);
              if(port.name === `${thisLink.from.nodeId}:${thisLink.from.portId}:output`){
                console.log("show me portname",port.name);
                return port
            }
        })
        console.log(fromArtboardOutputs ,thisFromPort);
      }


      // let toPort = toArtboard.layers
      // toPort.filter(layer => {
      //     if (layer.name === 'inputs') {
      //       return layer.layers.filter(port => {
      //         // console.log(port.name === `${thisLink.to.nodeId}:${thisLink.to.portId}:input`);
      //             if(port.name === `${thisLink.to.nodeId}:${thisLink.to.portId}:input`){
      //               return port
      //           // console.log("see port",port.name,`${thisLink.to.nodeId}:${thisLink.to.portId}:input`,port.name === `${thisLink.to.nodeId}:${thisLink.to.portId}:input`);
      //           }
      //       });
      //     }
      // })
      // console.log("from Artboard",fromArtboard.name,"Port:",fromPort, "to Artbaord",toArtboard.name,"Port:",toPort);
      // let thisFromPort = sketch.find(`[name="${thisLink.from.nodeId}:${thisLink.from.portId}:output"]`)
      // // let thisFromPortDesc = sketch.find(`[name="${thisLink.from.nodeId}:${thisLink.from.portId}:output_Info"]`)
      // let fromConnectionArtboardName = thisFromConnections[0].parent.name.split('_')
      // fromConnectionArtboardName = fromConnectionArtboardName[0]
      // let fromArtboard = artboards[thisLink.from.nodeId].name

      let toArtboard = artboards[thisLink.to.nodeId].name

      // if (thisFromPort.length >= 1 && currentToArtboard.length >= 1) {
      //   console.log("so much connections we have", thisFromPort[0].frame.x, thisLink, thisFromPort[0].name, thisToConnections.length, currentToArtboard[0]);
      //   new HotSpot({
      //     parent: thisFromPort[0].parent,
      //     name: thisFromPort[0].name,
      //     flow: {
      //       target: currentToArtboard[0],
      //     },
      //     frame: {
      //       x: 0 + thisFromPort[0].frame.x,
      //       y: 0,
      //       width: 32,
      //       height: 32
      //     }
      //   })
      // }
    })
    // thisProjectLinks.map(link => {
    //   let thisLink = thisProject.projectJson.links[link]
    //
    //   let fromHotSpot
    //   // console.log("see the link", link, thisLink)
    //   let thisFromConnections = sketch.find(`[name="nodeId:${thisLink.from.nodeId}"]`)
    //   let thisFromPort = sketch.find(`[name="${thisLink.from.nodeId}:${thisLink.from.portId}:output"]`)
    //   // let thisFromPortDesc = sketch.find(`[name="${thisLink.from.nodeId}:${thisLink.from.portId}:output_Info"]`)
    //   let fromConnectionArtboardName = thisFromConnections[0].parent.name.split('_')
    //   fromConnectionArtboardName = fromConnectionArtboardName[0]
    //   let currentFromArtboard = sketch.find(`[name="${fromConnectionArtboardName}"]`)
    //
    //   let thisToConnections = sketch.find(`[name="nodeId:${thisLink.to.nodeId}"]`)
    //   let toConnectionArboardName = thisToConnections[0].parent.name.split('_')
    //   toConnectionArboardName = toConnectionArboardName[0]
    //   let currentToArtboard = sketch.find(`[name="${toConnectionArboardName}"]`)
    //
    //   let thisToPort = sketch.find(`[name="${thisLink.to.nodeId}:${thisLink.to.portId}:input"]`)
    //   console.log(thisToPort.length, thisToPort);
    //   if (thisToPort.length >= 1 && currentFromArtboard.length >= 1) {
    //     new HotSpot({
    //       parent: thisToPort[0].parent,
    //       name: thisToPort[0].name,
    //       flow: {
    //         target: currentFromArtboard[0],
    //       },
    //       frame: {
    //         x: thisToPort[0].frame.x,
    //         y: 0,
    //         width: 32,
    //         height: 32
    //       }
    //     })
    //   }
    // })
  }




  function makeFlowyContent(thisProjectNode, currentArtboard) {

    let nodeWidth = thisProjectNode.size.width
    let nodeHeight = thisProjectNode.size.height

    let picWidth = thisProjectNode.picSize.width
    let picHeight = thisProjectNode.picSize.height
    // console.log(thisProjectNode)
    let nodePosX = thisProjectNode.position.x
    let nodePosY = thisProjectNode.position.y
    let nodeName = thisProjectNode.name

    // console.log("do the node",nodeName);
    let infoPanel = new Group({
      name: `${nodeName}_InfoPanel`,
      frame: {
        x: 0,
        y: 32,
        width: nodeWidth,
        height: nodeHeight
      },
      parent: currentArtboard
    })

    let exportSlice = new Slice({
      parent: infoPanel,
      frame: {
        x: 0,
        y: 0,
        width: nodeWidth,
        height: picHeight
      },
      name: `${thisProjectNode.picture}`
    })
    let imagePath = `${projectsUrl}/projects/${thisProjectNode.path}`
    if (imagePath === 'http://localhost:9023/projects/no_image.png') {
      imagePath = "http://localhost:9023/no_image.png"
    }

    let imageurl_nsurl = NSURL.alloc().initWithString(imagePath);
    let nsimage = NSImage.alloc().initByReferencingURL(imageurl_nsurl);
    // console.log(imagePath);
    let nodeId = new ShapePath({
      parent: infoPanel,
      name: `nodeId:${nodeName}`,
      frame: {
        x: 0,
        y: 0,
        width: 1,
        height: 1
      },
      style: {
        fills: ['#35E6C9']
      }
    })
    let nodePicture = new ShapePath({
      name: thisProjectNode.picture,
      parent: infoPanel,
      frame: {
        x: 0,
        y: 0,
        width: picWidth,
        height: picHeight
      },
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
      name: `${thisProjectNode.picture}_bg`,
      parent: infoPanel,
      frame: {
        x: 0,
        y: picHeight,
        width: nodeWidth,
        height: nodeHeight - picHeight
      },
      style: {
        fills: [{
          fill: '#FFFFFF',
        }]
      }
    })
    let infoPanelNodeName = new Text({
      fixedWidth: true,
      parent: infoPanel,
      name: `${nodeName}`,
      text: `${nodeName}`,
      frame: {
        x: 20,
        y: picHeight + 10,
        width: nodeWidth-20,
        height: perectage(20, nodeHeight - picHeight)
      },
      style: {
        textColor: '#111',
        fontSize: 20,
        lineHeight: null,
        paragraphSpacing: perectage(120, 20),
        aligenment: 'left'
      },
    })
    let infoPanelNodeDescription = new Text({
      fixedWidth: true,
      parent: infoPanel,
      name: `${thisProjectNode.text}`,
      text: `${thisProjectNode.text}`,
      frame: {
        x: 20,
        y: picHeight + 40,
        width: nodeWidth-20,
        height: perectage(80, nodeHeight - picHeight)
      },
      style: {
        textColor: '#333',
        lineHeight: null,
        paragraphSpacing: perectage(120, 10),
        fontSize: 10,
      },
    })
    infoPanel.layers = [nodeId, exportSlice, infoPanelBgSquare, infoPanelNodeDescription, infoPanelNodeName, nodePicture]
        // frame: { x: 0, y: 0, width: width, height: height}
    infoPanelNodeName.style.borders = [{
      enabled: false
    }]
    nodePicture.style.borders = [{
      enabled: false
    }]
    infoPanelNodeDescription.style.borders = [{
      enabled: false
    }]

    return
  }

// we load the project from the backend
function loadProject(project, update, cb) {
  let thisProject = networkRequest([`${api}/loadProject/:${project}`])
  let currentIdentifier = sketch.find(`[name="flowy-identifier:${project}"]`)
  if (currentIdentifier.length >= 1) {
    // console.log('have at least one identifier that we remove now', currentIdentifier.length);
    currentIdentifier.map(identifier => identifier.remove())
  }

  let thisProjectJson = thisProject.projectJson
  let thisProjectNodes = thisProjectJson.nodes
  let thisProjectNodeNames = Object.keys(thisProjectNodes);
  if (update) {
    // console.log("we good an update");
    thisProjectNodeNames = Object.keys(thisProject.projectJson.nodes)
    thisProjectNodeNames.map((node) => {
      let thisNodeName = thisProject.projectJson.nodes[node].name
      cleanOld(thisNodeName)
    })
  }

  let allArtBoards = {}

  // we create all nodes as artboards
  thisProjectNodeNames.map((node) => {
    let thisNode = thisProjectNodes[node]
    let nodeWidth, nodeHeight = ''

    nodeWidth = thisNode.size.width
    nodeHeight = thisNode.size.height + 64

    let nodePosX = thisNode.position.x
    let nodePosY = thisNode.position.y

    let artBoardName = thisNode.name
    // if (artBoardName.includes('_')) {
    artBoardName = artBoardName.replace(/_/g, ' / ')
    // }

    allArtBoards[node] = new Artboard({
      parent: page,
      frame: {
        x: nodePosX,
        y: nodePosY,
        width: nodeWidth,
        height: nodeHeight
      },
      name: artBoardName
    })
    let thisArtboard = allArtBoards[node]
    console.log("we have create the artboards and do the conent now");
    makeFlowyContent(thisNode, thisArtboard)
    console.log("the content is done, we try to make the connectors from the links now");
    makeConnectors(thisNode,thisArtboard, node)

  })
  console.log("done with the artboards,contentent and connectors, try to make hotspots now");
  makeHotSpotFromLinks(thisProject, allArtBoards,)
  console.log("all done, make the callback to end to process");

  cb("done")
}



// helper function doing the api requests
function networkRequest(args) {
  const task = NSTask.alloc().init();
  task.setLaunchPath("/usr/bin/curl");
  task.setArguments(args);
  const outputPipe = [NSPipe pipe];
  [task setStandardOutput: outputPipe];
  task.launch();
  const responseData = [[outputPipe fileHandleForReading] readDataToEndOfFile];
  const responseString = [[[NSString alloc] initWithData: responseData encoding: NSUTF8StringEncoding]];
  const parsed = tryParseJSON(responseString);
  if (!parsed) {
    log("Error invoking curl");
    log("args:");
    log(args);
    log("responseString");
    log(responseString);
    return {
      error: 'ERROR',
      message: "Your Projects cannot be loaded. Maybe flowy Api is down?",
      reason: responseData
    }
  }
  return parsed;
}

// helper function Object.keys() seems to not work inside sketch plugin.
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    const hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({
        toString: null
      }).propertyIsEnumerable('toString'),
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

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      let result = [],
        prop, i;

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
function perectage(input, max) {
  let temp = (max / 100) * input
  console.log(temp)
  return temp
}
// helper function parsing the answer from the api
function tryParseJSON(jsonString) {
  try {
    let o = JSON.parse(jsonString);

    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns 'null', and typeof null === "object",
    // so we must check for that, too.
    if (o && typeof o === "object" && o !== null) {
      return o;
    }
  } catch (e) {}

  return false;
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
  var parentOffset = {offset:{ x:x, y:y}}
  console.log(layer);
  if (layer.parent != undefined) {
  parentOffset = parentOffsetInArtboard(layer);
  }
  console.log("the parent offset",parentOffset);
  var newFrame = new sketch.Rectangle(layer.frame);
  newFrame.x = x - parentOffset.x;
  newFrame.y = y - parentOffset.y;
  console.log("and a new frame with:",newFrame);
  layer.frame = newFrame;
}
};
