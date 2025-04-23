import json
import os
import requests
import time
import sys

# Function to read the vocabulary data from code.txt
def read_vocabulary_data():
    with open('code.txt', 'r', encoding='utf-8') as file:
        data = json.load(file)
    return data

# Function to ensure the content directory exists
def ensure_directory(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")

# Function to call the Gemini API to generate content for a term
def generate_content_with_gemini(term, api_key):
    api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    
    # Create a detailed prompt based on the term
    prompt = f"""
    Create a comprehensive Markdown document about {term['title']} in blockchain and Web3 technology.
    
    Term ID: {term['id']}
    Description: {term['description']}
    
    Your markdown should include:
    
    # {term['title']}
    
    ## Overview and Definition
    [Expand on the description provided above with 2-3 paragraphs]
    
    ## How It Works
    [Detailed technical explanation with 2-3 paragraphs]
    
    ## Technical Implementation
    [Code examples or technical details where relevant]
    
    ## Use Cases in Web3
    [At least 3-4 specific applications and examples]
    
    ## Benefits and Challenges
    [Balanced discussion with bullet points for both]
    
    ## Future Developments
    [Trends and potential future directions]
    
    Make sure the content is technically accurate, well-structured, and formatted with proper Markdown.
    Include headers, bullet points, and code blocks where appropriate.
    Total length should be 1000-1500 words.
    """
    
    headers = {
        "Content-Type": "application/json"
    }
    
    data = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 8192
        }
    }
    
    url = f"{api_url}?key={api_key}"
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        
        # Extract the generated text
        generated_text = result['candidates'][0]['content']['parts'][0]['text']
        return generated_text
    
    except requests.exceptions.RequestException as e:
        print(f"Error calling Gemini API for {term['id']}: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        return None

# Function to save content to a Markdown file
def save_to_markdown(content, filepath):
    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Created file: {filepath}")
    return True

# Main function to generate Markdown files
def generate_markdown_files(category=None, specific_id=None, max_items=None):
    # Read the API key from environment variable
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set")
        print("Please set it with: $env:GEMINI_API_KEY = 'your-api-key'")
        return
    
    # Read vocabulary data
    vocab_data = read_vocabulary_data()
    
    # Filter terms based on parameters
    filtered_terms = []
    for term in vocab_data:
        # If contentPath is there but content is not, we need to generate content
        has_content_path = 'contentPath' in term
        
        # Match category filter if specified
        category_match = category is None or term.get('type') == category
        
        # Match ID filter if specified
        id_match = specific_id is None or term.get('id') == specific_id
        
        if has_content_path and category_match and id_match:
            filtered_terms.append(term)
    
    # Limit number of items to process if specified
    if max_items is not None and max_items > 0:
        filtered_terms = filtered_terms[:max_items]
    
    print(f"Found {len(filtered_terms)} terms to process")
    
    # Create directories for different categories
    created_directories = set()
    for term in filtered_terms:
        filepath = term['contentPath']
        directory = os.path.dirname(filepath)
        
        if directory not in created_directories:
            ensure_directory(directory)
            created_directories.add(directory)
    
    # Generate content for each term
    success_count = 0
    error_count = 0
    
    for i, term in enumerate(filtered_terms):
        filepath = term['contentPath']
        
        # If the file exists and is not empty, skip it
        if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
            print(f"[{i+1}/{len(filtered_terms)}] Skipping {term['id']} - file already exists")
            continue
        
        print(f"[{i+1}/{len(filtered_terms)}] Generating content for {term['title']} ({term['id']})...")
        
        # Call the Gemini API to generate content
        content = generate_content_with_gemini(term, api_key)
        
        if content:
            # Save the content to a Markdown file
            if save_to_markdown(content, filepath):
                success_count += 1
                print(f"Successfully generated content for {term['id']}")
            else:
                error_count += 1
                print(f"Failed to save content for {term['id']}")
        else:
            error_count += 1
            print(f"Failed to generate content for {term['id']}")
        
        # Sleep to avoid hitting API rate limits (except for the last item)
        if i < len(filtered_terms) - 1:
            print(f"Waiting for 5 seconds before processing the next term...")
            time.sleep(5)
    
    print(f"\nSummary:")
    print(f"Total terms processed: {len(filtered_terms)}")
    print(f"Successful generations: {success_count}")
    print(f"Failed generations: {error_count}")

if __name__ == "__main__":
    # Parse command line arguments
    category = None
    specific_id = None
    max_items = None
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--help" or sys.argv[1] == "-h":
            print("Usage: python batch_generate.py [category] [specific_id] [max_items]")
            print("  category: Filter by type (e.g., 'Technology')")
            print("  specific_id: Generate content for a specific term ID")
            print("  max_items: Maximum number of items to process")
            print("\nExamples:")
            print("  python batch_generate.py                       # Process all terms")
            print("  python batch_generate.py Technology            # Process only Technology terms")
            print("  python batch_generate.py Technology rpc        # Process only the RPC term")
            print("  python batch_generate.py Technology null 5     # Process up to 5 Technology terms")
            sys.exit(0)
        else:
            category = sys.argv[1]
    
    if len(sys.argv) > 2 and sys.argv[2] != "null":
        specific_id = sys.argv[2]
    
    if len(sys.argv) > 3 and sys.argv[3] != "null":
        try:
            max_items = int(sys.argv[3])
        except ValueError:
            print(f"Invalid value for max_items: {sys.argv[3]}")
            sys.exit(1)
    
    generate_markdown_files(category, specific_id, max_items) 