import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import os
import sys

# Import functions from pdf_tool.py
try:
    from pdf_tool import merge, split, delete, rotate, reorder
except ImportError:
    messagebox.showerror("Error", "Could not import pdf_tool.py. Make sure it is in the same directory.")
    sys.exit(1)

# Helper class to simulate argparse Namespace
class MockArgs:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

class PDFToolGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("The Ultimate PDF Tool")
        self.root.geometry("600x450")

        # Create Notebook (tabs)
        self.notebook = ttk.Notebook(root)
        self.notebook.pack(expand=True, fill='both', padx=10, pady=10)

        # Create frames for each tab
        self.tab_merge = ttk.Frame(self.notebook)
        self.tab_split = ttk.Frame(self.notebook)
        self.tab_delete = ttk.Frame(self.notebook)
        self.tab_rotate = ttk.Frame(self.notebook)
        self.tab_reorder = ttk.Frame(self.notebook)

        self.notebook.add(self.tab_merge, text='Merge')
        self.notebook.add(self.tab_split, text='Split')
        self.notebook.add(self.tab_delete, text='Delete')
        self.notebook.add(self.tab_rotate, text='Rotate')
        self.notebook.add(self.tab_reorder, text='Reorder')

        # Initialize tabs
        self.init_merge_tab()
        self.init_split_tab()
        self.init_delete_tab()
        self.init_rotate_tab()
        self.init_reorder_tab()

    # --- UI Helpers ---
    def select_files_for_merge(self):
        files = filedialog.askopenfilenames(filetypes=[("PDF Files", "*.pdf")])
        if files:
            self.merge_input_paths = files
            self.merge_inputs.set(f"{len(files)} files selected")

    def select_file(self, string_var):
        file = filedialog.askopenfilename(filetypes=[("PDF Files", "*.pdf")])
        if file:
            string_var.set(file)

    def save_file(self, string_var):
        file = filedialog.asksaveasfilename(defaultextension=".pdf", filetypes=[("PDF Files", "*.pdf")])
        if file:
            string_var.set(file)

    def select_directory(self, string_var):
        dir_path = filedialog.askdirectory()
        if dir_path:
            string_var.set(dir_path)

    # --- Initialization Methods for Tabs ---
    def init_merge_tab(self):
        self.merge_input_paths = []
        ttk.Label(self.tab_merge, text="Input PDFs:").grid(row=0, column=0, padx=5, pady=5, sticky='w')
        self.merge_inputs = tk.StringVar()
        ttk.Entry(self.tab_merge, textvariable=self.merge_inputs, width=50, state="readonly").grid(row=0, column=1, padx=5, pady=5)
        ttk.Button(self.tab_merge, text="Browse", command=self.select_files_for_merge).grid(row=0, column=2, padx=5, pady=5)

        ttk.Label(self.tab_merge, text="Output PDF:").grid(row=1, column=0, padx=5, pady=5, sticky='w')
        self.merge_output = tk.StringVar()
        ttk.Entry(self.tab_merge, textvariable=self.merge_output, width=50).grid(row=1, column=1, padx=5, pady=5)
        ttk.Button(self.tab_merge, text="Save As", command=lambda: self.save_file(self.merge_output)).grid(row=1, column=2, padx=5, pady=5)

        ttk.Button(self.tab_merge, text="Merge PDFs", command=self.do_merge).grid(row=2, column=1, pady=20)

    def init_split_tab(self):
        ttk.Label(self.tab_split, text="Input PDF:").grid(row=0, column=0, padx=5, pady=5, sticky='w')
        self.split_input = tk.StringVar()
        ttk.Entry(self.tab_split, textvariable=self.split_input, width=50).grid(row=0, column=1, padx=5, pady=5)
        ttk.Button(self.tab_split, text="Browse", command=lambda: self.select_file(self.split_input)).grid(row=0, column=2, padx=5, pady=5)

        ttk.Label(self.tab_split, text="Output Directory:").grid(row=1, column=0, padx=5, pady=5, sticky='w')
        self.split_output = tk.StringVar()
        ttk.Entry(self.tab_split, textvariable=self.split_output, width=50).grid(row=1, column=1, padx=5, pady=5)
        ttk.Button(self.tab_split, text="Select Dir", command=lambda: self.select_directory(self.split_output)).grid(row=1, column=2, padx=5, pady=5)

        ttk.Button(self.tab_split, text="Split PDF", command=self.do_split).grid(row=2, column=1, pady=20)

    def init_delete_tab(self):
        ttk.Label(self.tab_delete, text="Input PDF:").grid(row=0, column=0, padx=5, pady=5, sticky='w')
        self.delete_input = tk.StringVar()
        ttk.Entry(self.tab_delete, textvariable=self.delete_input, width=50).grid(row=0, column=1, padx=5, pady=5)
        ttk.Button(self.tab_delete, text="Browse", command=lambda: self.select_file(self.delete_input)).grid(row=0, column=2, padx=5, pady=5)

        ttk.Label(self.tab_delete, text="Pages to delete:").grid(row=1, column=0, padx=5, pady=5, sticky='w')
        self.delete_pages = tk.StringVar()
        ttk.Entry(self.tab_delete, textvariable=self.delete_pages, width=50).grid(row=1, column=1, padx=5, pady=5)
        ttk.Label(self.tab_delete, text="(e.g., 2 4)").grid(row=1, column=2, padx=5, pady=5, sticky='w')

        ttk.Label(self.tab_delete, text="Output PDF:").grid(row=2, column=0, padx=5, pady=5, sticky='w')
        self.delete_output = tk.StringVar()
        ttk.Entry(self.tab_delete, textvariable=self.delete_output, width=50).grid(row=2, column=1, padx=5, pady=5)
        ttk.Button(self.tab_delete, text="Save As", command=lambda: self.save_file(self.delete_output)).grid(row=2, column=2, padx=5, pady=5)

        ttk.Button(self.tab_delete, text="Delete Pages", command=self.do_delete).grid(row=3, column=1, pady=20)

    def init_rotate_tab(self):
        ttk.Label(self.tab_rotate, text="Input PDF:").grid(row=0, column=0, padx=5, pady=5, sticky='w')
        self.rotate_input = tk.StringVar()
        ttk.Entry(self.tab_rotate, textvariable=self.rotate_input, width=50).grid(row=0, column=1, padx=5, pady=5)
        ttk.Button(self.tab_rotate, text="Browse", command=lambda: self.select_file(self.rotate_input)).grid(row=0, column=2, padx=5, pady=5)

        ttk.Label(self.tab_rotate, text="Pages to rotate:").grid(row=1, column=0, padx=5, pady=5, sticky='w')
        self.rotate_pages = tk.StringVar()
        ttk.Entry(self.tab_rotate, textvariable=self.rotate_pages, width=50).grid(row=1, column=1, padx=5, pady=5)
        ttk.Label(self.tab_rotate, text="(e.g., 1 3 or 'all')").grid(row=1, column=2, padx=5, pady=5, sticky='w')

        ttk.Label(self.tab_rotate, text="Angle:").grid(row=2, column=0, padx=5, pady=5, sticky='w')
        self.rotate_angle = tk.IntVar(value=90)
        angles = ttk.Combobox(self.tab_rotate, textvariable=self.rotate_angle, values=(90, 180, 270), state="readonly")
        angles.grid(row=2, column=1, padx=5, pady=5, sticky='w')

        ttk.Label(self.tab_rotate, text="Output PDF:").grid(row=3, column=0, padx=5, pady=5, sticky='w')
        self.rotate_output = tk.StringVar()
        ttk.Entry(self.tab_rotate, textvariable=self.rotate_output, width=50).grid(row=3, column=1, padx=5, pady=5)
        ttk.Button(self.tab_rotate, text="Save As", command=lambda: self.save_file(self.rotate_output)).grid(row=3, column=2, padx=5, pady=5)

        ttk.Button(self.tab_rotate, text="Rotate Pages", command=self.do_rotate).grid(row=4, column=1, pady=20)

    def init_reorder_tab(self):
        ttk.Label(self.tab_reorder, text="Input PDF:").grid(row=0, column=0, padx=5, pady=5, sticky='w')
        self.reorder_input = tk.StringVar()
        ttk.Entry(self.tab_reorder, textvariable=self.reorder_input, width=50).grid(row=0, column=1, padx=5, pady=5)
        ttk.Button(self.tab_reorder, text="Browse", command=lambda: self.select_file(self.reorder_input)).grid(row=0, column=2, padx=5, pady=5)

        ttk.Label(self.tab_reorder, text="New Order:").grid(row=1, column=0, padx=5, pady=5, sticky='w')
        self.reorder_pages = tk.StringVar()
        ttk.Entry(self.tab_reorder, textvariable=self.reorder_pages, width=50).grid(row=1, column=1, padx=5, pady=5)
        ttk.Label(self.tab_reorder, text="(e.g., 3 1 2)").grid(row=1, column=2, padx=5, pady=5, sticky='w')

        ttk.Label(self.tab_reorder, text="Output PDF:").grid(row=2, column=0, padx=5, pady=5, sticky='w')
        self.reorder_output = tk.StringVar()
        ttk.Entry(self.tab_reorder, textvariable=self.reorder_output, width=50).grid(row=2, column=1, padx=5, pady=5)
        ttk.Button(self.tab_reorder, text="Save As", command=lambda: self.save_file(self.reorder_output)).grid(row=2, column=2, padx=5, pady=5)

        ttk.Button(self.tab_reorder, text="Reorder Pages", command=self.do_reorder).grid(row=3, column=1, pady=20)


    # --- Action Methods ---
    def do_merge(self):
        if not self.merge_input_paths or not self.merge_output.get():
            messagebox.showwarning("Input Error", "Please specify inputs and output.")
            return
        args = MockArgs(inputs=self.merge_input_paths, output=self.merge_output.get())
        try:
            merge(args)
            messagebox.showinfo("Success", "Files successfully merged!")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def do_split(self):
        if not self.split_input.get() or not self.split_output.get():
            messagebox.showwarning("Input Error", "Please specify input and output directory.")
            return
        args = MockArgs(input=self.split_input.get(), output_dir=self.split_output.get())
        try:
            split(args)
            messagebox.showinfo("Success", "File successfully split!")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def do_delete(self):
        if not self.delete_input.get() or not self.delete_output.get() or not self.delete_pages.get():
            messagebox.showwarning("Input Error", "Please fill all fields.")
            return
        pages = self.delete_pages.get().split()
        args = MockArgs(input=self.delete_input.get(), output=self.delete_output.get(), pages=pages)
        try:
            delete(args)
            messagebox.showinfo("Success", "Pages successfully deleted!")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def do_rotate(self):
        if not self.rotate_input.get() or not self.rotate_output.get() or not self.rotate_pages.get():
            messagebox.showwarning("Input Error", "Please fill all fields.")
            return
        pages = self.rotate_pages.get().split()
        args = MockArgs(input=self.rotate_input.get(), output=self.rotate_output.get(), pages=pages, angle=self.rotate_angle.get())
        try:
            rotate(args)
            messagebox.showinfo("Success", "Pages successfully rotated!")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def do_reorder(self):
        if not self.reorder_input.get() or not self.reorder_output.get() or not self.reorder_pages.get():
            messagebox.showwarning("Input Error", "Please fill all fields.")
            return
        order = self.reorder_pages.get().split()
        args = MockArgs(input=self.reorder_input.get(), output=self.reorder_output.get(), order=order)
        try:
            reorder(args)
            messagebox.showinfo("Success", "Pages successfully reordered!")
        except Exception as e:
            messagebox.showerror("Error", str(e))

if __name__ == "__main__":
    root = tk.Tk()
    app = PDFToolGUI(root)
    root.mainloop()
