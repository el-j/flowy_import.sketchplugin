var onRun = function(context) {
  // b87f0364144ebee8c0f812e29bd9e054443b2e3894d08d083fac881ddcfc4fe2
  const sketch = require('sketch')
  const UI = require('sketch/ui')
  const Style = sketch.Style
  const Artboard = sketch.Artboard
  const Shape = sketch.Shape
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
    const borders = [{ color: '#c0ffee',
      fillType: Style.FillType.Color,
      position: Style.BorderPosition.Inside
    }]
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
              fills: ['#FF00FF'],
              borders: borders
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
              alignment: 'center'
            },
          })
          ports.push(myPort,myPortInfo)
        }
        return ports

      },[])
      // console.log(allInputPorts);
      // console.log("add the inputPort Group", nodeName,"width",nodeWidth,"x:",nodePosX,"y:",nodePosY);
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
          // console.log("output x",x);
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
              fills: ['#FF00FF'],
              borders: borders
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
              alignment: 'center'
            },
          })
          ports.push(myPort,myPortInfo)
        }
        return ports

      },[])
      // console.log(allOutputPorts);
      // console.log("add the outputPort Group", nodeName,"width",nodeWidth,"x:",nodePosX,"y:",nodePosY);
      outputPortGroup.layers = allOutputPorts
      return
    }


  function makeHotSpotFromLinks(thisProject,artboards) {
    let thisProjectLinkNames = Object.keys(thisProject.projectJson.links)
    let thisProjectLinks = thisProject.projectJson.links
    thisProjectLinkNames.map(link => {
      let thisLink = thisProjectLinks[link]
      let fromArtboard = artboards[thisLink.from.nodeId]
      let toArtboard = artboards[thisLink.to.nodeId]
      let fromArtboardlayers = fromArtboard.layers
      let temp, fromHotSpot
      let thisFromPorts = {}

      let fromArtboardOutputs = fromArtboardlayers.filter(layer => {
          if (layer.name === 'outputs') {
            temp = layer.layers
            return temp
          }
      })
      if (fromArtboardOutputs.length >= 1) {
        thisFromPorts = fromArtboardOutputs[0].layers.filter(port => {
              if(port.name === `${thisLink.from.nodeId}:${thisLink.from.portId}:output`){
                console.log("show me portname",port.name);
                return port
            }
        })
      }
      // console.log("after filter",thisFromPorts[0].name,thisFromPorts[0].parent.name,fromArtboardOutputs[0].parent.name);

      // console.log(toArtboard,artboards[thisLink.to.nodeId].id);
      if (thisFromPorts.length >= 1) {
        // console.log("so much connections we have", thisFromPorts[0].frame.x, thisLink, thisFromPorts[0].name);
        new HotSpot({
          parent: thisFromPorts[0].parent,
          name: thisFromPorts[0].name,
          flow: {
            target: toArtboard,
          },
          frame: {
            x:  thisFromPorts[0].frame.x,
            y: 8,
            width: 24,
            height: 24
          }
        })
      }


      let toArtboardlayers = toArtboard.layers
      let temp2, toHotSpot
      let thisToPorts = {}

      let toArtboardOutputs = toArtboardlayers.filter(layer => {
          if (layer.name === 'inputs') {
            temp2 = layer.layers
            return temp2
          }
      })
      if (toArtboardOutputs.length >= 1) {
        thisToPorts = toArtboardOutputs[0].layers.filter(port => {
              if(port.name === `${thisLink.to.nodeId}:${thisLink.to.portId}:input`){
                console.log("show me portname",port.name);
                return port
            }
        })
      }
      // console.log("after filter",thisToPorts[0].name,thisToPorts[0].parent.name,fromArtboardOutputs[0].parent.name);

      // console.log(toArtboard,artboards[thisLink.to.nodeId].id);
      if (thisToPorts.length >= 1) {
        // console.log("so much connections we have", thisToPorts[0].frame.x, thisLink, thisToPorts[0].name);
        new HotSpot({
          parent: thisToPorts[0].parent,
          name: thisToPorts[0].name,
          flow: {
            target: fromArtboard,
          },
          frame: {
            x:  thisToPorts[0].frame.x,
            y: 0,
            width: 24,
            height: 24
          }
        })
      }
    })

  }




  function makeFlowyNodesContent(thisProjectNode, currentArtboard) {

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
        alignment: 'left'
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

  function makeFlowyDecisionContent(thisProjectNode, currentArtboard) {

    let nodeWidth = thisProjectNode.size.width
    let nodeHeight = thisProjectNode.size.height

    console.log(thisProjectNode.size)
    let nodePosX = thisProjectNode.position.x
    let nodePosY = thisProjectNode.position.y
    let nodeName = thisProjectNode.name

    let nodeId = new ShapePath({
      // parent: infoPanel,
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


    console.log(nodeWidth,nodeHeight, perectage(20, nodeHeight));
    let infoPanelNodeName = new Text({
      fixedWidth: true,

      name: `${nodeName}`,
      text: `${nodeName}`,
      frame: {
        x: 20,
        y: 10,
        width: nodeWidth-20,
        height: perectage(20, nodeHeight)
      },
    })



    let infoPanelNodeDescription = new Text({
      fixedWidth: true,
      // parent: infoPanel,
      name: `${thisProjectNode.text}`,
      text: `${thisProjectNode.text}`,
      frame: {
        x: 20,
        y: 40,
        width: nodeWidth-20,
        height: perectage(80, nodeHeight)
      },
      style: {
        textColor: '#333',
        // lineHeight: 12,
        paragraphSpacing: perectage(120, 10),
        fontSize: 10,
        borders: [{
          enabled: false
        }]
      },
    })

    let diamondWidhtHeight = (Math.sqrt(2)*nodeWidth)/2
    console.log(diamondWidhtHeight);

    let decisionDiamond = new Rectangle(0, 0, diamondWidhtHeight/2, diamondWidhtHeight/2)
    let decisionDiamondStyle = new sketch.Style()
        decisionDiamondStyle.fills = ['#DDf']


    let diamondWrapper = new ShapePath({frame: decisionDiamond, style:decisionDiamondStyle});
        diamondWrapper.frame.width = diamondWidhtHeight/2
        diamondWrapper.frame.height = diamondWidhtHeight/2
        diamondWrapper.transform.rotation = 45
        diamondWrapper.frame.x = 0
        diamondWrapper.frame.y = 0

    let headWrapper = new Shape(infoPanelNodeName);


    let diamondLayers = [diamondWrapper, infoPanelNodeName, infoPanelNodeDescription, nodeId]
    // infoPanelNodeName.adjustToFit()
    // infoPanelNodeDescription.adjustToFit()
    // infoPanelNodeName.frame.widht = nodeWidth-32
    console.log(infoPanelNodeName);

    let infoPanel = new Group({
        layers: diamondLayers,
        name: `${nodeName}_InfoPanel`,
        frame: {
          x: 0,
          y: 32,
          width: nodeWidth,
          height: nodeHeight
        },
        parent: currentArtboard
      })

      infoPanel.adjustToFit()

      return
  }
// we load the project from the backend
function loadProject(project, update, cb) {
  let thisProject = networkRequest([`${api}/loadProject/:${project}`])
  let currentIdentifier = sketch.find(`[name="flowy-identifier:${project}"]`)
  if (currentIdentifier.length >= 1) {
    update = true
    // console.log('have at least one identifier that we remove now', currentIdentifier.length);
    currentIdentifier.map(identifier => identifier.remove())
  }

  let thisProjectJson = thisProject.projectJson
  let thisProjectNodes = thisProjectJson.nodes
  let thisProjectNodeNames = Object.keys(thisProjectNodes);
    let allArtBoards = {}
  if (update) {
    // console.log("we good an update");
    thisProjectNodeNames = Object.keys(thisProject.projectJson.nodes)
    thisProjectNodeNames.map((node) => {
      let thisNodeName = thisProject.projectJson.nodes[node].name
    //  console.log('Cleanall',thisNodeName);
      cleanOld(thisNodeName)
      allArtBoards[node] = sketch.find(`[name="${thisNodeName}"]`)
    })
  }



  // we create all nodes as artboards
  thisProjectNodeNames.map((node) => {
    // console.log(node,thisProjectNodes[node])
    let thisNode = thisProjectNodes[node]
    let nodeWidth, nodeHeight = ''

    nodeWidth = thisNode.size.width
    nodeHeight = thisNode.size.height + 64

    let nodePosX = thisNode.position.x
    let nodePosY = thisNode.position.y
    let displayType = thisNode.displayType
    let artBoardName = thisNode.name
    // if (artBoardName.includes('_')) {
    // artBoardName = artBoardName.replace(/_/g, ' / ')
    // }
    // if (update) {
    //   console.log("we have all artboards allready, is an update");
    // }else {
    // console.log(nodePosX,nodePosY,nodeWidth,nodeHeight);
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
    // }
    let thisArtboard = allArtBoards[node]

    console.log("we have create the artboards and do the conent now");
    switch (displayType) {
      case 'decision':
          console.log("We have a ",displayType);
          makeFlowyDecisionContent(thisNode, thisArtboard)
        break;
      case 'point':
          console.log("We have a ",displayType);
        break;
      default:
        console.log("We have default ",displayType);
          makeFlowyNodesContent(thisNode, thisArtboard)
    }

    console.log("the content is done, we try to make the connectors from the links now");
    makeConnectors(thisNode,thisArtboard, node)

  })
  console.log("done with the artboards,contentent and connectors, try to make hotspots now");
  makeHotSpotFromLinks(thisProject, allArtBoards)
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
  // console.log(temp)
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
  // console.log(layer);
  if (layer.parent != undefined) {
  parentOffset = parentOffsetInArtboard(layer);
  }
  // console.log("the parent offset",parentOffset);
  var newFrame = new sketch.Rectangle(layer.frame);
  newFrame.x = x - parentOffset.x;
  newFrame.y = y - parentOffset.y;
  // console.log("and a new frame with:",newFrame);
  layer.frame = newFrame;
}
};
