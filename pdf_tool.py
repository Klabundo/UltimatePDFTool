#!/usr/bin/env python3
import argparse
import sys
import os
from pypdf import PdfReader, PdfWriter

def merge(args):
    print(f"Merging {len(args.inputs)} files into {args.output}...")
    writer = PdfWriter()
    try:
        for input_pdf in args.inputs:
            reader = PdfReader(input_pdf)
            for page in reader.pages:
                writer.add_page(page)
        with open(args.output, "wb") as f_out:
            writer.write(f_out)
        print(f"Successfully merged into {args.output}")
    except Exception as e:
        raise RuntimeError(f"Error during merge: {e}")

def split(args):
    print(f"Splitting {args.input} into directory: {args.output_dir}...")
    try:
        if not os.path.exists(args.output_dir):
            os.makedirs(args.output_dir)

        reader = PdfReader(args.input)
        base_name = os.path.splitext(os.path.basename(args.input))[0]

        if hasattr(args, 'pages') and args.pages:
            try:
                pages_to_split = [int(p) - 1 for p in args.pages]
            except ValueError:
                raise ValueError("Error: Page numbers must be integers.")
        else:
            pages_to_split = list(range(len(reader.pages)))

        count = 0
        for i, page in enumerate(reader.pages):
            if i in pages_to_split:
                writer = PdfWriter()
                writer.add_page(page)

                output_filename = os.path.join(args.output_dir, f"{base_name}_page_{i+1}.pdf")
                with open(output_filename, "wb") as f_out:
                    writer.write(f_out)
                count += 1

        print(f"Successfully split into {count} files in {args.output_dir}")
    except Exception as e:
        raise RuntimeError(f"Error during split: {e}")

def delete(args):
    try:
        pages_to_delete = [int(p) - 1 for p in args.pages]
    except ValueError:
        raise ValueError("Error: Page numbers must be integers.")

    print(f"Deleting {len(pages_to_delete)} pages from {args.input}...")
    try:
        reader = PdfReader(args.input)
        writer = PdfWriter()
        num_pages = len(reader.pages)

        for i, page in enumerate(reader.pages):
            if i not in pages_to_delete:
                writer.add_page(page)

        with open(args.output, "wb") as f_out:
            writer.write(f_out)
        print(f"Successfully deleted pages and saved to {args.output}")
    except Exception as e:
        raise RuntimeError(f"Error during delete: {e}")


def rotate(args):
    try:
        if "all" in args.pages:
            pages_to_rotate = "all"
        else:
            pages_to_rotate = [int(p) - 1 for p in args.pages]
    except ValueError:
        raise ValueError("Error: Page numbers must be integers or 'all'.")

    print(f"Rotating pages by {args.angle} degrees in {args.input}...")
    try:
        reader = PdfReader(args.input)
        writer = PdfWriter()

        for i, page in enumerate(reader.pages):
            if pages_to_rotate == "all" or i in pages_to_rotate:
                page.rotate(args.angle)
            writer.add_page(page)

        with open(args.output, "wb") as f_out:
            writer.write(f_out)
        print(f"Successfully rotated pages and saved to {args.output}")
    except Exception as e:
        raise RuntimeError(f"Error during rotate: {e}")

def compress(args):
    print(f"Compressing {args.input}...")
    try:
        reader = PdfReader(args.input)
        writer = PdfWriter()

        for page in reader.pages:
            writer.add_page(page)

        writer.add_metadata(reader.metadata)

        for page in writer.pages:
            page.compress_content_streams()

        with open(args.output, "wb") as f_out:
            writer.write(f_out)
        print(f"Successfully compressed and saved to {args.output}")
    except Exception as e:
        raise RuntimeError(f"Error during compress: {e}")

def protect(args):
    print(f"Protecting {args.input} with password...")
    try:
        reader = PdfReader(args.input)
        writer = PdfWriter()

        for page in reader.pages:
            writer.add_page(page)

        writer.encrypt(args.password)

        with open(args.output, "wb") as f_out:
            writer.write(f_out)
        print(f"Successfully protected and saved to {args.output}")
    except Exception as e:
        raise RuntimeError(f"Error during protect: {e}")

def unlock(args):
    print(f"Unlocking {args.input}...")
    try:
        reader = PdfReader(args.input)
        if reader.is_encrypted:
            reader.decrypt(args.password)
        else:
            print("Warning: The file is not encrypted. Proceeding as copy.")

        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)

        with open(args.output, "wb") as f_out:
            writer.write(f_out)
        print(f"Successfully unlocked and saved to {args.output}")
    except Exception as e:
        raise RuntimeError(f"Error during unlock: {e}")

def extract(args):
    try:
        pages_to_extract = [int(p) - 1 for p in args.pages]
    except ValueError:
        raise ValueError("Error: Page numbers must be integers.")

    print(f"Extracting {len(pages_to_extract)} pages from {args.input}...")
    try:
        reader = PdfReader(args.input)
        writer = PdfWriter()
        num_pages = len(reader.pages)

        for p in pages_to_extract:
            if 0 <= p < num_pages:
                writer.add_page(reader.pages[p])
            else:
                print(f"Warning: Page {p+1} is out of bounds and will be skipped.")

        with open(args.output, "wb") as f_out:
            writer.write(f_out)
        print(f"Successfully extracted pages and saved to {args.output}")
    except Exception as e:
        raise RuntimeError(f"Error during extract: {e}")

def metadata(args):
    print(f"Updating metadata for {args.input}...")
    try:
        reader = PdfReader(args.input)
        writer = PdfWriter()

        for page in reader.pages:
            writer.add_page(page)

        meta = reader.metadata or {}
        new_meta = {k: v for k, v in meta.items()}

        if args.title is not None:
            new_meta["/Title"] = args.title
        if args.author is not None:
            new_meta["/Author"] = args.author

        writer.add_metadata(new_meta)

        with open(args.output, "wb") as f_out:
            writer.write(f_out)
        print(f"Successfully updated metadata and saved to {args.output}")
    except Exception as e:
        raise RuntimeError(f"Error during metadata update: {e}")

def auto_rotate(args):
    print(f"Auto-rotating pages in {args.input} based on text orientation...")
    try:
        import fitz

        # We will use PyMuPDF to analyze the orientation of text blocks
        # and then apply the rotation in PyPDF.
        doc = fitz.open(args.input)

        reader = PdfReader(args.input)
        writer = PdfWriter()

        for i, page in enumerate(reader.pages):
            fitz_page = doc.load_page(i)
            # A simple heuristic: get text blocks and see which direction text flows
            # fitz block structure: (x0, y0, x1, y1, "lines in block", block_no, block_type)
            # Actually, fitz's page.get_text("dict") provides 'dir' (direction) of text.
            page_dict = fitz_page.get_text("dict")

            # Count character orientations
            dir_counts = {0: 0, 90: 0, 180: 0, 270: 0} # in degrees

            if "blocks" in page_dict:
                for block in page_dict["blocks"]:
                    if block["type"] == 0: # text block
                        for line in block.get("lines", []):
                            # The first element of dir is cosine, second is sine
                            # e.g., (1,0) = 0 deg, (0,1) = 90 deg, (-1,0) = 180 deg
                            line_dir = line["dir"]
                            if line_dir[0] > 0.9: angle = 0
                            elif line_dir[1] > 0.9: angle = 270 # fitz y-axis goes down, so dir=(0,1) is reading downwards, which means page is rotated 90 deg counter-clockwise, meaning we need to rotate 90. Actually wait, (0,1) is down. Text going down means the page is sideways (rotated -90). We need to rotate +90.
                            elif line_dir[0] < -0.9: angle = 180
                            elif line_dir[1] < -0.9: angle = 90 # Text going up, page is rotated +90. We need to rotate -90 / +270.
                            else: angle = 0

                            # Weight by number of characters
                            chars = sum(len(span["text"]) for span in line.get("spans", []))
                            dir_counts[angle] += chars

            # Find the most common text direction
            if sum(dir_counts.values()) > 0:
                most_common_angle = max(dir_counts, key=dir_counts.get)
                if most_common_angle != 0:
                    print(f"Auto-rotating page {i+1} by {most_common_angle} degrees.")
                    page.rotate(most_common_angle)

            writer.add_page(page)

        with open(args.output, "wb") as f_out:
            writer.write(f_out)

        print(f"Successfully auto-rotated and saved to {args.output}")
    except Exception as e:
        raise RuntimeError(f"Error during auto_rotate: {e}")

def images_to_pdf(args):
    print(f"Converting {len(args.inputs)} images into {args.output}...")
    try:
        from PIL import Image
        images = []
        first_image = None
        for i, img_path in enumerate(args.inputs):
            img = Image.open(img_path).convert("RGB")
            if i == 0:
                first_image = img
            else:
                images.append(img)

        if first_image:
            first_image.save(args.output, save_all=True, append_images=images)
            print(f"Successfully converted images into {args.output}")
        else:
            raise ValueError("No input images provided.")
    except Exception as e:
        raise RuntimeError(f"Error during images_to_pdf: {e}")

def pdf_to_images(args):
    print(f"Extracting images from {args.input} into {args.output_dir}...")
    try:
        import fitz
        import os
        if not os.path.exists(args.output_dir):
            os.makedirs(args.output_dir)

        doc = fitz.open(args.input)
        base_name = os.path.splitext(os.path.basename(args.input))[0]

        count = 0
        for i in range(len(doc)):
            page = doc.load_page(i)
            pix = page.get_pixmap(dpi=300)
            output_filename = os.path.join(args.output_dir, f"{base_name}_page_{i+1}.png")
            pix.save(output_filename)
            count += 1

        print(f"Successfully saved {count} images in {args.output_dir}")
    except Exception as e:
        raise RuntimeError(f"Error during pdf_to_images: {e}")

def extract_text(args):
    print(f"Extracting text from {args.input}...")
    try:
        reader = PdfReader(args.input)
        text_content = []

        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                text_content.append(f"--- Page {i + 1} ---\n{text}\n")

        with open(args.output, "w", encoding="utf-8") as f_out:
            f_out.write("\n".join(text_content))

        print(f"Successfully extracted text to {args.output}")
    except Exception as e:
        raise RuntimeError(f"Error during extract_text: {e}")

def watermark(args):
    print(f"Applying watermark '{args.text}' to {args.input}...")
    try:
        import tempfile
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter

        reader = PdfReader(args.input)
        writer = PdfWriter()

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_wm:
            c = canvas.Canvas(temp_wm.name, pagesize=letter)
            c.setFont("Helvetica", 60)
            c.setFillColorRGB(0.5, 0.5, 0.5, alpha=0.3)
            c.translate(300, 400)
            c.rotate(45)
            c.drawCentredString(0, 0, args.text)
            c.save()
            wm_path = temp_wm.name

        wm_reader = PdfReader(wm_path)
        wm_page = wm_reader.pages[0]

        for page in reader.pages:
            page.merge_page(wm_page)
            writer.add_page(page)

        with open(args.output, "wb") as f_out:
            writer.write(f_out)

        print(f"Successfully applied watermark and saved to {args.output}")
    except Exception as e:
        raise RuntimeError(f"Error during watermark: {e}")

def crop(args):
    print(f"Cropping {args.input} margins (L:{args.left}, R:{args.right}, T:{args.top}, B:{args.bottom})...")
    try:
        reader = PdfReader(args.input)
        writer = PdfWriter()

        for page in reader.pages:
            current_ll = page.cropbox.lower_left
            current_ur = page.cropbox.upper_right

            new_ll = (current_ll[0] + args.left, current_ll[1] + args.bottom)
            new_ur = (current_ur[0] - args.right, current_ur[1] - args.top)

            page.cropbox.lower_left = new_ll
            page.cropbox.upper_right = new_ur

            writer.add_page(page)

        with open(args.output, "wb") as f_out:
            writer.write(f_out)

        print(f"Successfully cropped and saved to {args.output}")
    except Exception as e:
        raise RuntimeError(f"Error during crop: {e}")

def deskew(args):
    try:
        if "all" in args.pages:
            pages_to_deskew = "all"
        else:
            pages_to_deskew = [int(p) - 1 for p in args.pages]
    except ValueError:
        raise ValueError("Error: Page numbers must be integers or 'all'.")

    print(f"Deskewing pages in {args.input}...")
    try:
        import fitz
        from deskew import determine_skew
        from pypdf import Transformation

        reader = PdfReader(args.input)
        writer = PdfWriter()

        # Open with PyMuPDF for rendering
        doc = fitz.open(args.input)

        for i, page in enumerate(reader.pages):
            if pages_to_deskew == "all" or i in pages_to_deskew:
                fitz_page = doc.load_page(i)
                # Render to grayscale image
                pix = fitz_page.get_pixmap(colorspace=fitz.csGRAY)
                # Convert to numpy array
                import numpy as np
                img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width)

                # Determine skew angle
                angle = determine_skew(img)
                if angle is not None and abs(angle) > 0.1:
                    print(f"Deskewing page {i + 1} by {angle:.2f} degrees")

                    # We need to rotate the page.
                    # We want to rotate around the center of the page.
                    # calculate center of the page
                    cx = float(page.mediabox.left) + float(page.mediabox.right - page.mediabox.left) / 2
                    cy = float(page.mediabox.bottom) + float(page.mediabox.top - page.mediabox.bottom) / 2

                    # PyPDF Transformation:
                    # Translate center to origin, rotate, translate back
                    op = Transformation().translate(-cx, -cy).rotate(angle).translate(cx, cy)
                    page.add_transformation(op)

            writer.add_page(page)

        with open(args.output, "wb") as f_out:
            writer.write(f_out)
        print(f"Successfully deskewed pages and saved to {args.output}")
    except Exception as e:
        raise RuntimeError(f"Error during deskew: {e}")

def reorder(args):
    try:
        # Order inputs are 1-based, we need 0-based for pypdf
        new_order = [int(p) - 1 for p in args.order]
    except ValueError:
        raise ValueError("Error: Reorder sequence must be integers.")

    print(f"Reordering pages in {args.input}...")
    try:
        reader = PdfReader(args.input)
        writer = PdfWriter()

        num_pages = len(reader.pages)
        for p in new_order:
            if p < 0 or p >= num_pages:
                raise ValueError(f"Error: Page number {p + 1} is out of bounds (1-{num_pages}).")
            writer.add_page(reader.pages[p])

        with open(args.output, "wb") as f_out:
            writer.write(f_out)
        print(f"Successfully reordered pages and saved to {args.output}")
    except Exception as e:
        raise RuntimeError(f"Error during reorder: {e}")

def main():
    parser = argparse.ArgumentParser(description="The Ultimate PDF Tool for merging, splitting, modifying and more.")
    subparsers = parser.add_subparsers(dest="command", required=True, help="Subcommands")

    # Merge subcommand
    parser_merge = subparsers.add_parser("merge", help="Merge multiple PDFs into one.")
    parser_merge.add_argument("-i", "--inputs", nargs='+', required=True, help="Input PDF files.")
    parser_merge.add_argument("-o", "--output", required=True, help="Output PDF file.")
    parser_merge.set_defaults(func=merge)

    # Split subcommand
    parser_split = subparsers.add_parser("split", help="Split a PDF into single pages.")
    parser_split.add_argument("-i", "--input", required=True, help="Input PDF file.")
    parser_split.add_argument("-o", "--output-dir", required=True, help="Output directory for split pages.")
    parser_split.add_argument("-p", "--pages", nargs='*', help="Optional list of 1-based page numbers to split.")
    parser_split.set_defaults(func=split)

    # Delete subcommand
    parser_delete = subparsers.add_parser("delete", help="Delete specific pages from a PDF.")
    parser_delete.add_argument("-i", "--input", required=True, help="Input PDF file.")
    parser_delete.add_argument("-o", "--output", required=True, help="Output PDF file.")
    parser_delete.add_argument("-p", "--pages", nargs='+', required=True, help="List of 1-based page numbers to delete.")
    parser_delete.set_defaults(func=delete)

    # Rotate subcommand
    parser_rotate = subparsers.add_parser("rotate", help="Rotate specific pages in a PDF.")
    parser_rotate.add_argument("-i", "--input", required=True, help="Input PDF file.")
    parser_rotate.add_argument("-o", "--output", required=True, help="Output PDF file.")
    parser_rotate.add_argument("-a", "--angle", type=int, required=True, choices=[90, 180, 270], help="Angle to rotate (90, 180, 270).")
    parser_rotate.add_argument("-p", "--pages", nargs='+', required=True, help="List of 1-based page numbers to rotate. Use 'all' for all pages.")
    parser_rotate.set_defaults(func=rotate)

    # Reorder subcommand
    parser_reorder = subparsers.add_parser("reorder", help="Reorder pages in a PDF.")
    parser_reorder.add_argument("-i", "--input", required=True, help="Input PDF file.")
    parser_reorder.add_argument("-o", "--output", required=True, help="Output PDF file.")
    parser_reorder.add_argument("-p", "--order", nargs='+', required=True, help="New order of 1-based page numbers (e.g., 3 1 2).")
    parser_reorder.set_defaults(func=reorder)

    # Deskew subcommand
    parser_deskew = subparsers.add_parser("deskew", help="Deskew pages in a PDF.")
    parser_deskew.add_argument("-i", "--input", required=True, help="Input PDF file.")
    parser_deskew.add_argument("-o", "--output", required=True, help="Output PDF file.")
    parser_deskew.add_argument("-p", "--pages", nargs='+', required=True, help="List of 1-based page numbers to deskew. Use 'all' for all pages.")
    parser_deskew.set_defaults(func=deskew)

    # Compress subcommand
    parser_compress = subparsers.add_parser("compress", help="Compress PDF content streams.")
    parser_compress.add_argument("-i", "--input", required=True, help="Input PDF file.")
    parser_compress.add_argument("-o", "--output", required=True, help="Output PDF file.")
    parser_compress.set_defaults(func=compress)

    # Protect subcommand
    parser_protect = subparsers.add_parser("protect", help="Encrypt PDF with a password.")
    parser_protect.add_argument("-i", "--input", required=True, help="Input PDF file.")
    parser_protect.add_argument("-o", "--output", required=True, help="Output PDF file.")
    parser_protect.add_argument("-pw", "--password", required=True, help="Password for encryption.")
    parser_protect.set_defaults(func=protect)

    # Unlock subcommand
    parser_unlock = subparsers.add_parser("unlock", help="Decrypt a password-protected PDF.")
    parser_unlock.add_argument("-i", "--input", required=True, help="Input PDF file.")
    parser_unlock.add_argument("-o", "--output", required=True, help="Output PDF file.")
    parser_unlock.add_argument("-pw", "--password", required=True, help="Password for decryption.")
    parser_unlock.set_defaults(func=unlock)

    # Extract subcommand
    parser_extract = subparsers.add_parser("extract", help="Extract specific pages into a new PDF.")
    parser_extract.add_argument("-i", "--input", required=True, help="Input PDF file.")
    parser_extract.add_argument("-o", "--output", required=True, help="Output PDF file.")
    parser_extract.add_argument("-p", "--pages", nargs='+', required=True, help="List of 1-based page numbers to extract.")
    parser_extract.set_defaults(func=extract)

    # Metadata subcommand
    parser_metadata = subparsers.add_parser("metadata", help="Update PDF metadata.")
    parser_metadata.add_argument("-i", "--input", required=True, help="Input PDF file.")
    parser_metadata.add_argument("-o", "--output", required=True, help="Output PDF file.")
    parser_metadata.add_argument("-t", "--title", help="New title.")
    parser_metadata.add_argument("-a", "--author", help="New author.")
    parser_metadata.set_defaults(func=metadata)

    args = parser.parse_args()
    try:
        args.func(args)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
