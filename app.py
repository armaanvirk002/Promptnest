#!/usr/bin/env python3
"""
Flask wrapper for PromptNest Node.js application
This serves as a bridge to run the Node.js app via Python/gunicorn on Render
"""
import os
import subprocess
import signal
import sys
from flask import Flask, request, jsonify
import requests
import time
import threading

app = Flask(__name__)

# Node.js process
node_process = None
NODE_PORT = 5001  # Use different port to avoid conflicts

def start_node_app():
    """Start the Node.js application"""
    global node_process
    try:
        # Set environment variables
        env = os.environ.copy()
        env['PORT'] = str(NODE_PORT)
        env['NODE_ENV'] = 'production'
        
        # Start Node.js app
        node_process = subprocess.Popen(
            ['npm', 'start'],
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait for Node.js to start
        time.sleep(10)
        print(f"Node.js app started on port {NODE_PORT}")
        
    except Exception as e:
        print(f"Error starting Node.js app: {e}")

def stop_node_app():
    """Stop the Node.js application"""
    global node_process
    if node_process:
        node_process.terminate()
        node_process.wait()

# Start Node.js app in background thread
threading.Thread(target=start_node_app, daemon=True).start()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def proxy(path):
    """Proxy all requests to the Node.js application"""
    try:
        # Forward request to Node.js app
        url = f'http://localhost:{NODE_PORT}/{path}'
        
        if request.method == 'GET':
            resp = requests.get(url, params=request.args)
        elif request.method == 'POST':
            resp = requests.post(url, json=request.json, params=request.args)
        else:
            resp = requests.request(request.method, url, json=request.json, params=request.args)
        
        return resp.content, resp.status_code, dict(resp.headers)
    
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Node.js application not ready"}), 503
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health')
def health():
    """Health check endpoint"""
    try:
        resp = requests.get(f'http://localhost:{NODE_PORT}/api/stats', timeout=5)
        if resp.status_code == 200:
            return jsonify({"status": "healthy", "node_app": "running"})
    except:
        pass
    
    return jsonify({"status": "unhealthy", "node_app": "down"}), 503

# Cleanup on exit
def signal_handler(sig, frame):
    stop_node_app()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)