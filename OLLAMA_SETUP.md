# Ollama Setup Guide for Mock Interview Feature

## What Changed

The Mock Interview feature now uses **Ollama with Llama3 LLM** for intelligent scoring instead of static mock data.

### Backend Changes (`app.py`)
1. **Added Ollama import** at the top of the file
2. **Updated `/mock-interview` endpoint** with two new modes:
   - `action: 'get_question'` - Uses Ollama to generate challenging technical questions
   - `action: 'evaluate'` - Uses Ollama with **rubric-based scoring** to evaluate answers
3. **Structured JSON responses** - Forces the LLM to output valid JSON format for:
   - `score` (0-10)
   - `feedback` (critical evaluation)
   - `improved` (professional answer example)
4. **Fallback mechanism** - If Ollama fails, uses mock data

## Prerequisites

### Step 1: Download and Install Ollama
1. Visit **https://ollama.ai** or **https://ollama.com**
2. Download the Windows installer
3. Run the installer and follow the setup wizard
4. Restart your computer

### Step 2: Pull the Llama3 Model
After installation, open PowerShell and run:

ollama pull llama3

### Step 3: Keep Ollama Running while running this project
