#!/bin/bash

echo "Installing dependencies..."
pip3 install -r requirements.txt || pip install -r requirements.txt

echo "Starting PDF Tool GUI..."
python3 gui.py || python gui.py
