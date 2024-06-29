import { Box, CircularProgress, Grid } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
// import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'
import *  as fabric  from 'fabric';
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


function FileConverter({ pdfUrl, fileName }) {
  const myRef = React.createRef();
  // const { editor, onReady } = useFabricJSEditor()

  // const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [numOfPages, setNumOfPages] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [translatedTexts, setTranslatedTexts] = useState([])
  const [hoverBox, setHoverBox] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [canvas, setCanvas] = useState(null);
  const canvasRef = useRef(null);

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

      return () => {
        fabricCanvas.dispose();
      };
    }
}, [imageDimensions]);


  useEffect(() => {
    setLoading(false);
  }, [imageUrls]);

  useEffect(() => {
    if (hoverBox) console.log(hoverBox);
  }, [hoverBox]);

  // const handleClickOpen = (url, index) => {
  //   setSelectedImage({ url, index });
  //   setOpen(true);
  // };

  // const handleClose = () => {
  //   setSelectedImage(null);
  //   setOpen(false);
  // };

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

  useEffect(() => {
    myRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [imageUrls]);

  // const downloadImage = (url, index) => {
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `${fileName}_${index + 1}.png`;
  //   document.body.appendChild(a);
  //   a.click();
  //   document.body.removeChild(a);
  //   handleClose();
  // };

  const handleImageLoad = (event) => {
    const { width, height } = event.target;
    setImageDimensions({ width, height });
  };


  const addRectangle = () => {
    if (canvas) {
        const rect = new fabric.Rect({
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

    }
    // editor.addRectangle()
  };

  const addText = () => {
      if (canvas) {
          const text = new fabric.Text('Hello,\n World!', {
              left: 100,
              top: 200,
              fill: 'black',
              hasControls: true, // Enable controls for resizing
              lockMovementX: false, // Enable horizontal movement
              lockMovementY: false, // Enable vertical movement
          });
          canvas.add(text);
      }
    // editor.addText()

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
                <div>
                  <div class="px-2 py-2 bg-primary bg-opacity-20 hover:bg-opacity-50" onClick={addRectangle}>Add Rectangle</div>
                  <div class="px-2 py-2 bg-primary bg-opacity-20 hover:bg-opacity-50" onClick={addText}>Add Text</div>
                </div>
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
              <div className="w-80 h-[90vh] sticky top-[5vh] flex flex-col border-2 border-slate-200 rounded-xl overflow-hidden">
                <div class="bg-sky-300 p-4 ">Translated text</div>
                <div class="flex flex-col min-h-0 flex-1 p-4 gap-4 overflow-auto">
                  { 
                    translatedTexts.map((text, index) => {
                      return <div class="w-full rounded border border-slate-300 p-4 hover:border-primary" key={index}
                        onMouseEnter={() => setHoverBox(text)}
                        onMouseLeave={() => setHoverBox(null)}
                      >
                        {text.translatedText}
                      </div>
                    })
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

export default FileConverter;
