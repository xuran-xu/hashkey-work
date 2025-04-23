import json
import os
import requests
import time

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
    
    prompt = f"""
    Generate a detailed Markdown document about {term['title']} ({term['id']}) in the context of blockchain and Web3 technology.
    
    Include the following sections:
    1. Overview and Definition (based on: {term['description']})
    2. How It Works
    3. Technical Implementation
    4. Use Cases in Web3
    5. Benefits and Challenges
    6. Future Developments
    
    Format as a well-structured Markdown document with headers, bullet points, and code examples where relevant.
    Keep the total content to 1000-1500 words.
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
        response.raise_for_status()  # Raise an exception for HTTP errors
        result = response.json()
        
        # Extract the generated text
        generated_text = result['candidates'][0]['content']['parts'][0]['text']
        return generated_text
    
    except requests.exceptions.RequestException as e:
        print(f"Error calling Gemini API: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        return None

# Function to save content to a Markdown file
def save_to_markdown(content, filepath):
    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Created file: {filepath}")

# Main function to generate Markdown files
def generate_markdown_files():
    # Read the API key from environment variable
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set")
        return
    
    # Read vocabulary data
    vocab_data = read_vocabulary_data()
    
    # Filter for tech terms that have contentPath specified
    tech_terms = [term for term in vocab_data if term.get('type') == 'Technology' and 'contentPath' in term]
    
    # Ensure the content/tech directory exists
    ensure_directory('content/tech')
    
    # Generate content for each term
    for term in tech_terms:
        # Check if the term already has content (file exists and is not empty)
        filepath = term['contentPath']
        
        # If the file exists and is not empty, skip it
        if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
            print(f"Skipping {term['id']} - file already exists")
            continue
        
        print(f"Generating content for {term['title']} ({term['id']})...")
        
        # Call the Gemini API to generate content
        content = generate_content_with_gemini(term, api_key)
        
        if content:
            # Save the content to a Markdown file
            save_to_markdown(content, filepath)
            print(f"Successfully generated content for {term['id']}")
            
            # Sleep to avoid hitting API rate limits
            time.sleep(5)
        else:
            print(f"Failed to generate content for {term['id']}")

if __name__ == "__main__":
    generate_markdown_files() 