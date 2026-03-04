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

        for i, page in enumerate(reader.pages):
            writer = PdfWriter()
            writer.add_page(page)

            output_filename = os.path.join(args.output_dir, f"{base_name}_page_{i+1}.pdf")
            with open(output_filename, "wb") as f_out:
                writer.write(f_out)

        print(f"Successfully split into {len(reader.pages)} files in {args.output_dir}")
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

    args = parser.parse_args()
    try:
        args.func(args)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
