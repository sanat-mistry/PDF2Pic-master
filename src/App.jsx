import React, { useState } from "react";
import "./App.css";
import { Grid } from "@mui/material";
import FileInput from "./Components/file-input";
import FileConverter from "./Components/file-converter";

export const primary = "#176ede";

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  return (
    <div class="min-h-screen bg-slate-100">
      <div container class="flex p-6" sx={{ py: 6, px: 4 }}>
        { !pdfFile && 
          <div class="border border-slate-200 box">
            <FileInput onFileChange={(file) => setPdfFile(file)} />
          </div>
        }
        {pdfFile && (
          <Grid item sx={{ width: "100%" }}>
            <FileConverter
              pdfUrl={URL.createObjectURL(pdfFile)}
              fileName={pdfFile.name}
            />
          </Grid>
        )}
      </div>
    </div>
  );
}

export default App;
