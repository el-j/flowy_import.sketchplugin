var onRun = function(context) {
  const sketch = require('sketch')
  const dom = require('sketch/dom')
  const UI = require('sketch/ui')
  const Style = sketch.Style
  const Artboard = sketch.Artboard
  const ShapePath = sketch.ShapePath
  const Text = sketch.Text
  const Slice = sketch.Slice
  const Image = sketch.Image
  const Rectangle = sketch.Rectangle
  const api = 'http://localhost:9023/api'
  const projectsUrl = 'http://localhost:9023'
  String.prototype.replaceAll = function(str1, str2, ignore){
      return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
  }

  const emptyProject = (name) => {
    return ({
      projectId: name,
      name: name,
      description: '',
      mmd: '',
      id: '',
      files:[],
      projectJson:{
        offset: {
          x: 0,
          y: 0
        },
        nodes: {},
        links: {},
        selected: {},
        hovered: {}
    }})
  }


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
      "What is your new Project name?", {
        initialValue: 'Appleseed',
      },
      (err, value) => {
        if (err) {
          UI.alert('FLOWY ERROR:', `${allData.message}
         ${allData.reason}`)
          // most likely the user canceled the input
          return
        } else {
          console.log("from user input dialog",allProjects,allProjects.indexOf(value),value);
          if (allProjects.indexOf(value)>=0) {
            console.log('update',value)
              updateProject(value)
          }
          else {
              createProject(value)
          }

        }
      },

    )

  } else {
    UI.alert('FLOWY ERROR:', `${allData.message}
  ${allData.reason}`)
  }

  function shrinkSlice_by(slice,value) {
    let frame = slice.frame
    frame.x = frame.x
    frame.y = frame.y
    frame.width = frame.width
    frame.height = value
    slice.frame = frame
    return slice
  }

  // we create a new project at the backend
  function createProject(project) {
    // let thisProjectData = emptyProject(project)
    let selectedLayers = document.selectedLayers
    let selectedCount = selectedLayers.length
    console.log(project);
    if (selectedCount != 0) {
      networkRequest([`${api}/createProject/:${project}`])
      const optionsSave = {
        formats: 'png',
        output: '~/tempFlowyUpload/'
      }

      let myRequests = []
      selectedLayers.forEach(async function(layer, i) {
        console.log((i + 1) + '. ' + layer.name,layer.frame)
        let myOutputLayer = layer
        let height = layer.frame.height
        let outFileName = myOutputLayer.name.replaceAll(' / ','_')
        myOutputLayer.name = outFileName
        let mySlice = sketch.find('Slice',layer)
        console.log(outFileName,height,mySlice.frame);
        myoutput = shrinkSlice_by(myOutputLayer,perectage(20,height))
        dom.export(myoutput, optionsSave)

        layer.frame.height = height
        // uploadFile(project,outFileName)

        if (i === selectedCount-1) {
          console.log(i,selectedCount);
          UI.alert('Created Project:', `${project}`)
        }
        console.log(i);
        let request = ["-F",`projectName=${project}`,"-F",`data=@/Users/fabianalthaus/tempFlowyUpload/${outFileName}.png`,`${api}/uploadProjectData/:${project}`];
        networkRequest(request)
      })

    } else {
      console.log('nothing to export');
    }
  }



function updateProject(project) {
  UI.alert('Update Project:', `${project}`)

  // thisProjectNodes.map((node) => {
  //   let currentArtboard = sketch.find(`[name="${thisProject.projectJson.nodes[node].name}"]`)
  // })


  let selectedLayers = document.selectedLayers
  let selectedCount = selectedLayers.length
  if (selectedCount != 0) {
    const optionsSave = {
      formats: 'png',
      output: '~/tempFlowyUpload/'
    }
      console.log("we have selected layers", selectedLayers);

    selectedLayers.forEach(async function(layer, i) {
      let myOutputLayer = layer
      let height = layer.frame.height
      let outFileName = myOutputLayer.name.replaceAll(' / ','_')
      myOutputLayer.name = outFileName
      let mySlice = sketch.find('Slice',layer)
      // let slices = sketch.find('no_image.png',layer)
      console.log("mySLIOCE",mySlice,mySlice[0].frame);
      let mySliceHeight = mySlice[0].frame.height
      console.log("mySLIOCE",mySliceHeight);
      myoutput = shrinkSlice_by(myOutputLayer,mySliceHeight)
      dom.export(myoutput, optionsSave)
      // uploadFile(project,outFileName)
      // dom.setHeight(layer, )
      layer.frame.height = height
      if (i === selectedCount-1) {
        console.log(i,selectedCount);
        UI.alert('Updated Project:', `${project}`)
      }
      console.log(i);
      let request = ["-F",`projectName=${project}`,"-F",`data=@/Users/fabianalthaus/tempFlowyUpload/${outFileName}.png`,`${api}/uploadProjectData/:${project}`];
      networkRequest(request)
    })

  } else {
    console.log('nothing to export');
  }
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

// helper function doing the api requests
function networkRequest(args) {
  const task = NSTask.alloc().init();
  task.setLaunchPath("/usr/bin/curl");
  task.setArguments(args);
  console.log(args,"this is the task",task);
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

function perectage(input,max){
  let temp = (max/100)*input
  console.log(temp)
  return temp
}
};
