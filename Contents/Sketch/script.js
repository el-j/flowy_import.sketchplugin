          var onRun = function(context) {
          console.log('This is an example Sketch script.')

const sketch = require('sketch')
const Style = sketch.Style
const Artboard = sketch.Artboard
const ShapePath = sketch.ShapePath
const Text = sketch.Text
const Image = sketch.Image
const Rectangle = sketch.Rectangle
const api = 'http://localhost:9023/api'
const projectsUrl = 'http://localhost:9023/projects'

const allData = networkRequest([`${api}/getProjects`])
const allProjects = Object.keys(allData)


let thisProject = networkRequest([`${api}/loadProject/:a-b`])
console.log(thisProject.projectJson.nodes)
let thisProjectNodes = Object.keys(thisProject.projectJson.nodes)
let thisProjectLinks = Object.keys(thisProject.projectJson.links)
let document = sketch.getSelectedDocument()
let page = document.selectedPage
let allArtBoards = {}


thisProjectNodes.map((node) => {
  console.log(thisProject.projectJson.nodes[node].path)


  let width = thisProject.projectJson.nodes[node].size.width
  let height = thisProject.projectJson.nodes[node].size.height
  let x = thisProject.projectJson.nodes[node].position.x
  let y = thisProject.projectJson.nodes[node].position.y
  allArtBoards[node] = new Artboard({ parent: page,
    frame: { x: x, y: y, width: width, height: height },
    name: node
  })
  let myText = new Text({
    parent: allArtBoards[node],
    name: `nodeText${node}`,
    text: `What a nice thing ${node}`
  })

  let imagePath = `${projectsUrl}${thisProject.projectJson.nodes[node].path}`
  if (imagePath === 'http://localhost:9023/projects/no_image.png') {
    imagePath = "http://localhost:9023/no_image.png"
  }

  let imageurl_nsurl = NSURL.alloc().initWithString(imagePath);
  let nsimage = NSImage.alloc().initByReferencingURL(imageurl_nsurl);
  console.log(nsimage);
  let mySquare = new ShapePath({
    name: node,
    parent: allArtBoards[node],
    frame: { x: 0, y: 0, width: width, height: height },
    style: {
    fills: [{
      fill: 'Pattern',
      pattern: {
        patternType: Style.PatternFillType.Fill,
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



let selectedLayers = document.selectedLayers
let selectedCount = selectedLayers.length

if (selectedCount === 0) {
  console.log('No layers are selected.')
} else {
  console.log('Selected layers:');
  selectedLayers.forEach(function (layer, i) {
    console.log((i + 1) + '. ' + layer.name)
  })
}

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
    throw "Error communicating with server"
  }
  return parsed;
}

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
          