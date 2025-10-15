#!/bin/bash

# Python Environment Setup Script for NER + TF-IDF Topic Extraction

echo "🐍 Setting up Python environment for NER + TF-IDF topic extraction..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run the setup first:"
    echo "   python3 -m venv venv"
    echo "   source venv/bin/activate"
    echo "   pip install -r scripts/requirements.txt"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.local..."
    if [ -f ".env.local" ]; then
        cp .env.local .env
        echo "✅ Copied .env.local to .env"
    else
        echo "❌ No .env.local found. Please create .env file with:"
        echo "   TURSO_DATABASE_URL=your_database_url"
        echo "   TURSO_AUTH_TOKEN=your_auth_token"
        echo "   GOOGLE_API_KEY=your_google_api_key"
        exit 1
    fi
fi

# Test Python environment
echo "🧪 Testing Python environment..."
python -c "
import sys
print(f'Python version: {sys.version}')

try:
    import libsql_client
    print('✅ libsql-client imported successfully')
except ImportError as e:
    print(f'❌ libsql-client import failed: {e}')

try:
    import google.generativeai as genai
    print('✅ google-generativeai imported successfully')
except ImportError as e:
    print(f'❌ google-generativeai import failed: {e}')

try:
    import sklearn
    print('✅ scikit-learn imported successfully')
except ImportError as e:
    print(f'❌ scikit-learn import failed: {e}')

try:
    import pandas
    print('✅ pandas imported successfully')
except ImportError as e:
    print(f'❌ pandas import failed: {e}')

try:
    import jupyter
    print('✅ jupyter imported successfully')
except ImportError as e:
    print(f'❌ jupyter import failed: {e}')
"

echo ""
echo "🚀 Environment setup complete!"
echo ""
echo "To start Jupyter notebook:"
echo "   source venv/bin/activate"
echo "   jupyter notebook scripts/backfill_topics.ipynb"
echo ""
echo "To run the notebook directly:"
echo "   source venv/bin/activate"
echo "   cd scripts"
echo "   python -c \"import jupyter; jupyter.notebook.main()\""
