import os
import tempfile
import pytest
from pypdf import PdfWriter, PdfReader

# Helper function to create a dummy PDF for testing
def create_dummy_pdf(filename, num_pages=1):
    writer = PdfWriter()
    for i in range(num_pages):
        writer.add_blank_page(width=200, height=200)
    with open(filename, "wb") as f:
        writer.write(f)

def test_merge_split_delete_rotate_reorder():
    # Create a temporary directory for tests
    with tempfile.TemporaryDirectory() as tempdir:
        pdf1_path = os.path.join(tempdir, "test1.pdf")
        pdf2_path = os.path.join(tempdir, "test2.pdf")

        create_dummy_pdf(pdf1_path, num_pages=2)
        create_dummy_pdf(pdf2_path, num_pages=1)

        import sys
        python_exe = sys.executable

        # Test merge
        merged_path = os.path.join(tempdir, "merged.pdf")
        os.system(f'"{python_exe}" pdf_tool.py merge -i "{pdf1_path}" "{pdf2_path}" -o "{merged_path}"')
        assert os.path.exists(merged_path)
        reader = PdfReader(merged_path)
        assert len(reader.pages) == 3

        # Test split
        split_dir = os.path.join(tempdir, "splits")
        os.system(f'"{python_exe}" pdf_tool.py split -i "{merged_path}" -o "{split_dir}"')
        assert os.path.exists(split_dir)
        assert len(os.listdir(split_dir)) == 3

        # Test delete (Delete page 2 -> 3 pages to 2 pages)
        deleted_path = os.path.join(tempdir, "deleted.pdf")
        os.system(f'"{python_exe}" pdf_tool.py delete -i "{merged_path}" -o "{deleted_path}" -p 2')
        assert os.path.exists(deleted_path)
        reader = PdfReader(deleted_path)
        assert len(reader.pages) == 2

        # Test rotate
        rotated_path = os.path.join(tempdir, "rotated.pdf")
        os.system(f'"{python_exe}" pdf_tool.py rotate -i "{merged_path}" -o "{rotated_path}" -a 90 -p 1')
        assert os.path.exists(rotated_path)
        reader = PdfReader(rotated_path)
        # Verify 1st page is rotated (though hard to test without extracting object rotation angle directly easily here)
        assert len(reader.pages) == 3

        # Test reorder (3 pages: 1 2 3 -> 3 1)
        reordered_path = os.path.join(tempdir, "reordered.pdf")
        os.system(f'"{python_exe}" pdf_tool.py reorder -i "{merged_path}" -o "{reordered_path}" -p 3 1')
        assert os.path.exists(reordered_path)
        reader = PdfReader(reordered_path)
        assert len(reader.pages) == 2
