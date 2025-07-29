import os
import subprocess
import time
import signal
import sys
from flask import Flask, request, Response, jsonify
import requests
import threading

app = Flask(__name__)

# Global variables
node_process = None
NODE_PORT = 3001

def start_node_app():
    """Start Node.js application"""
    global node_process
    try:
        print("Starting Node.js application...")
        
        # Environment setup
        env = os.environ.copy()
        env['PORT'] = str(NODE_PORT)
        env['NODE_ENV'] = 'production'
        
        # Start the Node.js app
        node_process = subprocess.Popen(
            ['node', 'dist/index.js'],
            env=env,
            cwd=os.getcwd()
        )
        
        # Wait for Node.js to start
        time.sleep(10)
        print(f"Node.js app started on port {NODE_PORT}")
        
    except Exception as e:
        print(f"Error starting Node.js: {e}")

def stop_node_app():
    """Stop Node.js application"""
    global node_process
    if node_process:
        node_process.terminate()
        node_process.wait()

# Start Node.js in background thread
startup_thread = threading.Thread(target=start_node_app)
startup_thread.daemon = True
startup_thread.start()

@app.route('/health')
def health():
    """Health check"""
    try:
        resp = requests.get(f'http://localhost:{NODE_PORT}/api/stats', timeout=5)
        return jsonify({"status": "healthy", "code": resp.status_code})
    except:
        return jsonify({"status": "starting"}), 503

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def proxy(path):
    """Proxy to Node.js app"""
    try:
        url = f'http://localhost:{NODE_PORT}/{path}'
        
        if request.method == 'GET':
            resp = requests.get(url, params=request.args)
        elif request.method == 'POST':
            resp = requests.post(url, json=request.get_json(), params=request.args)
        else:
            resp = requests.request(request.method, url, json=request.get_json())
        
        return Response(resp.content, resp.status_code, dict(resp.headers))
    
    except requests.ConnectionError:
        return jsonify({"error": "Node.js app starting"}), 503
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Cleanup handler
def cleanup(signum, frame):
    stop_node_app()
    sys.exit(0)

signal.signal(signal.SIGTERM, cleanup)
signal.signal(signal.SIGINT, cleanup)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
