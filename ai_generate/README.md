# Web3 Vocabulary Markdown Generator

This project provides tools to automatically generate detailed Markdown content for Web3 and blockchain vocabulary terms using Google's Gemini API.

## Prerequisites

- Python 3.6 or higher
- Google Gemini API key

## Installation

1. Clone this repository or download the files
2. Install required Python packages:

```bash
pip install requests
```

## Configuration

To use this tool, you need a Gemini API key from Google AI Studio.

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create an API key from the settings menu
3. Set the API key as an environment variable:

### Windows (PowerShell)
```powershell
$env:GEMINI_API_KEY = "your-api-key-here"
```

### Windows (Command Prompt)
```cmd
set GEMINI_API_KEY=your-api-key-here
```

### Linux/macOS
```bash
export GEMINI_API_KEY="your-api-key-here"
```

## Usage

### Batch Generation Script

The `batch_generate.py` script allows you to generate Markdown content for multiple terms at once.

```bash
python batch_generate.py [category] [specific_id] [max_items]
```

Parameters:
- `category`: (Optional) Filter by term type (e.g., 'Technology')
- `specific_id`: (Optional) Generate content for a specific term ID
- `max_items`: (Optional) Maximum number of items to process

Examples:
```bash
# Process all terms
python batch_generate.py

# Process only Technology terms
python batch_generate.py Technology

# Process only the RPC term
python batch_generate.py Technology rpc

# Process up to 5 Technology terms
python batch_generate.py Technology null 5
```

### Single File Generation Script

The `generate_md_files.py` script processes all Technology terms with contentPath attributes.

```bash
python generate_md_files.py
```

## How It Works

1. The scripts read the vocabulary data from `code.txt`
2. They filter terms based on your criteria
3. For each term, they:
   - Check if the content already exists
   - Generate a prompt for Google's Gemini AI
   - Call the Gemini API to generate detailed content
   - Save the content to a Markdown file
   - Pause between requests to respect API rate limits

## File Structure

- `batch_generate.py`: Main script for batch generation with filtering options
- `generate_md_files.py`: Script for generating all Technology term content
- `code.txt`: Source data containing vocabulary terms

## Customization

You can modify the prompts in the scripts to customize the generated content structure, tone, and focus.

## Troubleshooting

- **API Key Not Found**: Ensure you've set the GEMINI_API_KEY environment variable
- **API Rate Limits**: The script includes a 5-second delay between requests; increase if needed
- **File Creation Issues**: Ensure proper write permissions in the target directories

## License

This project is licensed under the MIT License - see the LICENSE file for details. 