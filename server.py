from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import tempfile
import os
import shutil
import zipfile

# Import underlying logic from our CLI tool
from pdf_tool import merge, split, delete, rotate, reorder

app = FastAPI(title="Ultimate PDF Tool API")

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MockArgs:
    """Helper class to simulate argparse Namespace required by pdf_tool.py"""
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

def cleanup_temp_dir(dir_path: str):
    """Background task to delete temporary files after sending the response."""
    if os.path.exists(dir_path):
        shutil.rmtree(dir_path)

@app.post("/api/merge")
async def api_merge(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
    if not files or len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 PDF files are required for merging.")

    temp_dir = tempfile.mkdtemp()
    background_tasks.add_task(cleanup_temp_dir, temp_dir)

    input_paths = []
    try:
        for file in files:
            file_path = os.path.join(temp_dir, file.filename)
            with open(file_path, "wb") as f:
                shutil.copyfileobj(file.file, f)
            input_paths.append(file_path)

        output_path = os.path.join(temp_dir, "merged_output.pdf")
        args = MockArgs(inputs=input_paths, output=output_path)

        merge(args)

        return FileResponse(output_path, media_type="application/pdf", filename="merged_output.pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/split")
async def api_split(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    pages: Optional[str] = Form(None) # Space separated e.g. "1 3"
):
    temp_dir = tempfile.mkdtemp()
    background_tasks.add_task(cleanup_temp_dir, temp_dir)

    try:
        input_path = os.path.join(temp_dir, file.filename)
        with open(input_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        split_dir = os.path.join(temp_dir, "splits")
        pages_list = pages.strip().split() if pages else []
        args = MockArgs(input=input_path, output_dir=split_dir, pages=pages_list)

        split(args)

        # Since split produces multiple files, we zip them
        zip_path = os.path.join(temp_dir, "split_pages.zip")
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(split_dir):
                for f in files:
                    zipf.write(os.path.join(root, f), f)

        return FileResponse(zip_path, media_type="application/zip", filename="split_pages.zip")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/delete")
async def api_delete(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    pages: str = Form(...) # Space separated e.g. "1 3"
):
    temp_dir = tempfile.mkdtemp()
    background_tasks.add_task(cleanup_temp_dir, temp_dir)

    try:
        input_path = os.path.join(temp_dir, file.filename)
        with open(input_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        output_path = os.path.join(temp_dir, "deleted_output.pdf")
        pages_list = pages.strip().split()

        args = MockArgs(input=input_path, output=output_path, pages=pages_list)
        delete(args)

        return FileResponse(output_path, media_type="application/pdf", filename="deleted_output.pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rotate")
async def api_rotate(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    pages: str = Form(...), # "all" or "1 2"
    angle: int = Form(...) # 90, 180, 270
):
    if angle not in [90, 180, 270]:
        raise HTTPException(status_code=400, detail="Angle must be 90, 180, or 270")

    temp_dir = tempfile.mkdtemp()
    background_tasks.add_task(cleanup_temp_dir, temp_dir)

    try:
        input_path = os.path.join(temp_dir, file.filename)
        with open(input_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        output_path = os.path.join(temp_dir, "rotated_output.pdf")
        pages_list = pages.strip().split()

        args = MockArgs(input=input_path, output=output_path, pages=pages_list, angle=angle)
        rotate(args)

        return FileResponse(output_path, media_type="application/pdf", filename="rotated_output.pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reorder")
async def api_reorder(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    order: str = Form(...) # "3 1 2"
):
    temp_dir = tempfile.mkdtemp()
    background_tasks.add_task(cleanup_temp_dir, temp_dir)

    try:
        input_path = os.path.join(temp_dir, file.filename)
        with open(input_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        output_path = os.path.join(temp_dir, "reordered_output.pdf")
        order_list = order.strip().split()

        args = MockArgs(input=input_path, output=output_path, order=order_list)
        reorder(args)

        return FileResponse(output_path, media_type="application/pdf", filename="reordered_output.pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
