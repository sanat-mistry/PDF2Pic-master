import { Box, CircularProgress, Grid } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'
import *  as fabric  from 'fabric';
import useEyeDropper from 'use-eye-dropper'
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';

var pdfjsLib = window["pdfjs-dist/build/pdf"];
pdfjsLib.GlobalWorkerOptions.workerSrc = "./assets/js/pdf.worker.js";

var rawData = [
  [[910, 274], [1637, 274], [1637, 395], [910, 395]],
  [[868, 388], [1347, 388], [1347, 477], [868, 477]],
  [[1339, 380], [1684, 380], [1684, 509], [1339, 509]],
  [[951, 479], [1588, 479], [1588, 601], [951, 601]],
  [[885, 1754], [1123, 1754], [1123, 1810], [885, 1810]],
  [[1366, 1746], [1736, 1746], [1736, 1818], [1366, 1818]],
  [[848, 1813], [1152, 1813], [1152, 1874], [848, 1874]],
  [[1360, 1811], [1741, 1811], [1741, 1876], [1360, 1876]],
  [[1923, 1846], [2269, 1846], [2269, 1912], [1923, 1912]],
  [[856, 1874], [1147, 1874], [1147, 1930], [856, 1930]],
  [[216, 1849], [716, 1849], [716, 2033], [216, 2033]],
  [[878, 1935], [1125, 1935], [1125, 1991], [878, 1991]],
  [[1467, 1899], [1595, 1899], [1595, 1960], [1467, 1960]],
  [[1932, 1906], [2263, 1906], [2263, 1959], [1932, 1959]],
  [[826, 1996], [1179, 1996], [1179, 2064], [826, 2064]],
  [[1471, 1976], [1624, 1976], [1624, 2032], [1471, 2032]],
  [[1936, 1965], [2259, 1965], [2259, 2030], [1936, 2030]],
  [[917, 2053], [1094, 2053], [1094, 2109], [917, 2109]],
  [[1471, 2055], [1631, 2055], [1631, 2111], [1471, 2111]],
  [[149, 2363], [1085, 2363], [1085, 2428], [149, 2428]],
  [[1352, 2360], [1763, 2360], [1763, 2428], [1352, 2428]],
  [[207, 2467], [497, 2467], [497, 2544], [207, 2544]],
  [[577, 2467], [1014, 2467], [1014, 2546], [577, 2546]],
  [[1415, 2471], [1558, 2471], [1558, 2532], [1415, 2532]],
  [[1639, 2469], [2038, 2469], [2038, 2534], [1639, 2534]],
  [[2110, 2471], [2300, 2471], [2300, 2532], [2110, 2532]],
  [[207, 2553], [578, 2553], [578, 2619], [207, 2619]],
  [[658, 2544], [1197, 2544], [1197, 2632], [658, 2632]],
  [[1411, 2548], [1769, 2548], [1769, 2629], [1411, 2629]],
  [[1840, 2548], [2121, 2548], [2121, 2633], [1840, 2633]],
  [[2196, 2556], [2382, 2556], [2382, 2616], [2196, 2616]],
  [[864, 2824], [1262, 2824], [1262, 2881], [864, 2881]],
  [[1261, 2809], [1881, 2809], [1881, 2905], [1261, 2905]],
  [[855, 2882], [2155, 2882], [2155, 2966], [855, 2966]],
  [[863, 2985], [1435, 2985], [1435, 3048], [863, 3048]]
]

var idTypeMap = {}


function FileConverter({ pdfUrl, fileName }) {
  const myRef = React.createRef();
  const { open, close, isSupported } = useEyeDropper()
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [numOfPages, setNumOfPages] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [translatedTexts, setTranslatedTexts] = useState([])
  const [hoverBox, setHoverBox] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [selectedObjects,  setSelectedObjects] = useState([])
  const [canvas, setCanvas] = useState(null);
  const canvasRef = useRef(null);


  // Properties



  useEffect(() => {
    let texts = []
    rawData.forEach((data, index) => {
      let left = data[0][0]
      let top = data[0][1]
      let right = data[2][0]
      let bottom = data[2][1]
      texts.push({
        left,
        top, 
        right, 
        bottom,
        width: right-left,
        height: bottom-top,
        originalText: `Original text ${index+1}`,
        translatedText: `Translated text ${index+1}`
      })
    })
    setTranslatedTexts(texts)
  }, [])

  useEffect(() => {
    if (imageDimensions.width && imageDimensions.height) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: 'transparent',
        selection: true,
      });
      fabricCanvas.setWidth(imageDimensions.width);
      fabricCanvas.setHeight(imageDimensions.height);
      setCanvas(fabricCanvas);
      fabricCanvas.on({
        "object:added": (event) => handleAdd(event, canvas),
        "object:removed": (event) => handleRemove(event, canvas),
        "object:scaling": handleScaling,
        "selection:created": (event) => handleSelect(event, canvas),
        "selection:cleared": (event) => handleDeselect(event, canvas),
      })

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, [imageDimensions]);

  const handleAdd = (event) => {
    console.log(event);
  }

  const handleRemove = (event) => {
    console.log(event);
  }

  const handleScaling = (obj) => {
    if (!canvas) {
      return
    }
    if (obj.target && obj.target.id && obj.target.height && obj.target.scaleY) {
      if (idTypeMap[obj.target.id] == 'Text') {
        let lastHeight
        const updateTextSize = () => {
          if (obj.target) {
            if (obj.target.height && obj.target.scaleY) {
              lastHeight = obj.target.height * obj.target.scaleY;
            }

            obj.target.set({
              height: lastHeight || obj.target.height,
              scaleY: 1,
            });
          }
        };
        updateTextSize();
      }
    }
  }

  const handleSelect = (event) => {
    console.log(event);
    setSelectedObjects(event.selected)
  }

  const handleDeselect = (event) => {
    console.log(event);
    setSelectedObjects([])
  }

  const handleDelete = (event) => {
    console.log(event);
    canvas.remove(canvas.getActiveObject())
  }


  useEffect(() => {
    setLoading(false);
  }, [imageUrls]);

  const UrlUploader = (url) => {
    fetch(url).then((response) => {
      response.blob().then((blob) => {
        let reader = new FileReader();
        reader.onload = (e) => {
          const data = atob(e.target.result.replace(/.*base64,/, ""));
          renderPage(data);
        };
        reader.readAsDataURL(blob);
      });
    });
  };

  useMemo(() => {
    UrlUploader(pdfUrl);
  }, []);

  const renderPage = async (data) => {
    setLoading(true);
    const imagesList = [];
    const canvas = document.createElement("canvas");
    canvas.setAttribute("className", "canv");
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
      var page = await pdf.getPage(i);
      var viewport = page.getViewport({ scale: 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      var render_context = {
        canvasContext: canvas.getContext("2d"),
        viewport: viewport,
      };
      await page.render(render_context).promise;
      let img = canvas.toDataURL("image/png");
      imagesList.push(img);
    }
    setNumOfPages((e) => e + pdf.numPages);
    setImageUrls((e) => [...e, ...imagesList]);
  };

  const handleImageLoad = (event) => {
    const { width, height } = event.target;
    setImageDimensions({ width, height });
  };


  const addRectangle = () => {
    if (canvas) {
      let id = Math.random()
      const rect = new fabric.Rect({
        id,
        type: "rect",
        left: 100,
        top: 100,
        fill: 'white',
        width: 60,
        height: 70,
        hasControls: true, // Enable controls for resizing
        lockMovementX: false, // Enable horizontal movement
        lockMovementY: false, // Enable vertical movement,
        selectable: true,
      });
      canvas.add(rect);
      idTypeMap[id] = "Rectangle"
    }
  };

  const addText = () => {
      if (canvas) {
        let id = Math.random()
        const text = new fabric.Text('Add Text here..', {
          id,
          left: 100,
          top: 200,
          fill: 'black',
          fontSize: 12,
          hasControls: true, // Enable controls for resizing
          lockMovementX: false, // Enable horizontal movement
          lockMovementY: false, // Enable vertical movement
        });
        canvas.add(text);
        idTypeMap[id] = "Text"
      }
  };

  const handleObjectUpdate = (object, type) => {
    let active = canvas.getActiveObject()
    if (type == "Rectangle") {
      active.set('fill', object.fill)
    } else {
      console.log(object.text);
      active.set({
        'fill': object.fill,
        'text': object.text,
        'fontSize': object.fontSize
      })
    }
    
    canvas.renderAll()
  }

  const handleExport = async () => {
    const div = document.getElementById('image-wrapper');
    if (div) {
      const canvas = await html2canvas(div);
      const imageData = canvas.toDataURL('image/png');

      // Create a PDF document
      const pdfDoc = await PDFDocument.create();
      const image = await pdfDoc.embedPng(imageData);

      // Get the dimensions of the image
      const imageDims = image.scale(1);

      // Add a page with the same dimensions as the image
      const page = pdfDoc.addPage([imageDims.width, imageDims.height]);

      // Draw the image onto the page
      page.drawImage(image, {
          x: 0,
          y: 0,
          width: imageDims.width,
          height: imageDims.height,
      });

      // Serialize the PDF document to bytes (a Uint8Array)
      const pdfBytes = await pdfDoc.save();

      // Create a blob from the PDF bytes and create a URL for it
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Create a link element and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'div.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };



  return (
    <Box sx={{ my: 4, textAlign: "center" }} ref={myRef} id="image-container mt-0">
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {imageUrls.length > 0 && (
            <div class="flex gap-4 w-full">
              <div class="flex-1 min-w-0">
                {/* <div>
                  <SquareOutlined></SquareOutlined>
                  <div class="px-2 py-2 bg-primary bg-opacity-20 hover:bg-opacity-50" onClick={addRectangle}>Add Rectangle</div>
                  <div class="px-2 py-2 bg-primary bg-opacity-20 hover:bg-opacity-50" onClick={addText}>Add Text</div>
                </div> */}
                {/* {imageUrls.map((url, index) => ( */}
                  <div class="relative">
                    <div id="image-wrapper" class="border-2 border-slate-200 rounded-xl relative ">
                      {
                        hoverBox && 
                        <div
                          class="absolute border border-primary bg-primary bg-opacity-20"
                          style={{
                              top: `${hoverBox.top}px`,
                              left: `${hoverBox.left}px`,
                              width: `${hoverBox.width}px`,
                              height: `${hoverBox.height}px`
                          }}
                        />
                      }
                      <div class="relative">
                        <img
                          src={imageUrls[0]}
                          alt={`Page 1`}
                          className="h-full w-full object-cover rounded-xl"
                          onLoad={handleImageLoad}
                          />
                        <canvas
                          ref={canvasRef}
                          className="absolute top-0 left-0"
                          width={imageDimensions.width}
                          height={imageDimensions.height}
                        ></canvas>

                      </div>

                      
                    </div>
                  </div>
                {/* ))} */}
              </div>
              <div className="w-80 h-[90vh] sticky top-[5vh] bg-white flex flex-col border-2 border-slate-200 rounded-xl overflow-hidden">
                <div class="m-4 flex flex-col gap-2">  
                  <button className="w-full bg-primary text-white px-4 py-1 rounded" onClick={addRectangle}>Add Rectangle</button>
                  <button className="w-full bg-primary text-white px-4 py-1 rounded" onClick={addText}>Add Text</button>
                  <button className="w-full bg-primary text-white px-4 py-1 rounded" onClick={handleExport}>Export as PDF</button>
                </div>
                <hr></hr>

                <div class="m-4 flex flex-col gap-2">                  
                  {
                    selectedObjects.length > 0 &&
                    <ObjectProperties object={selectedObjects[0]} updateObject={handleObjectUpdate} deleteObject={handleDelete} />
                  }
                </div>

              </div>
            </div>
          )}
        </>
      )}
    </Box>
  );
}

const ObjectProperties = ({object, updateObject, deleteObject}) => {
  
  let type = idTypeMap[object.id]
  
  const [state, setState] = useState({
    fill: object.fill,
    text: object.text,
    fontSize: object.fontSize
  })
  const { open, close, isSupported } = useEyeDropper()
  const [color, setColor] = useState('#fff')
  
  const pickColor = useCallback(() => {
      const openPicker = async () => {
        try {
          const color = await open()
          if (color && color.sRGBHex) {
            handleUpdate('fill', color.sRGBHex)
          }
        } catch (e) {
          console.error(e)
        }
      }
      openPicker()
  }, [open])
  

  const handleUpdate = (key, val) => {
    let newState = {...state}
    newState[key] = val
    setState(newState)
  }

  useEffect(() => {
    updateObject(state, type)
  }, [state])

  return <>
    { type && <div className="text-left font-bold">Edit {type}</div>}

    {/* Rectangle */}
    { type == "Rectangle" &&
      <div className="flex flex-col gap-2 items-start">
        <div className="flex justify-between w-full">
          <span>Fill Color</span>
          <button onClick={pickColor} className="underline text-primary text-sm">Pick color</button>
        </div>
        <input className="border border-slate-200 rounded w-full" value={state.fill} type="text" onChange={(e) => handleUpdate("fill", e.target.value)} />
        <button className="w-full bg-red-500 text-white px-4 py-1 rounded" onClick={deleteObject}>Delete</button>
      </div>
    }

    {/* Text */}
    { type == "Text" &&
      <div className="flex flex-col gap-2 items-start">
        
        <div className="flex justify-between w-full">
          <span>Fill Color</span>
          <button onClick={pickColor} className="underline text-primary text-sm">Pick color</button>
        </div>
        <input className="border border-slate-200 rounded w-full" value={state.fill} type="text" onChange={(e) => handleUpdate("fill", e.target.value)} />
        <hr></hr>
        <span>Fill Color</span>
        <textarea className="border p-1 border-slate-200 rounded w-full" value={state.text} type="text" onChange={(e) => handleUpdate("text", e.target.value)} />
        <hr></hr>
        <span>Font size</span>
        <textarea className="border p-1 border-slate-200 rounded w-full" value={state.fontSize} type="text" onChange={(e) => handleUpdate("fontSize", e.target.value)} />
        <button className="w-full bg-red-500 text-white px-4 py-1 rounded" onClick={deleteObject}>Delete</button>
        
      </div>
    }
  </>
}

export default FileConverter;
