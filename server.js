// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

class StaticServer {
    constructor(port = 3000, directory = 'public') {
        this.port = port;
        this.directory = path.join(__dirname, directory);
        
        // MIME types for Godot web files
        this.mimeTypes = {
            '.html': 'text/html',
            '.htm': 'text/html',
            '.js': 'application/javascript',
            '.mjs': 'application/javascript',
            '.wasm': 'application/wasm',
            '.pck': 'application/octet-stream',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.json': 'application/json',
            '.css': 'text/css',
            '.txt': 'text/plain',
            '.ico': 'image/x-icon',
            '.webmanifest': 'application/manifest+json'
        };

        this.server = http.createServer(this.handleRequest.bind(this));
    }

    start() {
        // Create public directory if it doesn't exist
        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory, { recursive: true });
            console.log(`📁 Created directory: ${this.directory}`);
        }

        this.server.listen(this.port, () => {
            console.log(`🚀 Static file server running on http://localhost:${this.port}`);
            console.log(`📁 Serving files from: ${this.directory}`);
        });
    }

    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        let pathname = decodeURIComponent(parsedUrl.pathname);

        // Default to index.html
        if (pathname === '/') {
            pathname = '/index.html';
        }

        const filePath = path.join(this.directory, pathname);
        
        // Security: Prevent directory traversal
        if (!filePath.startsWith(this.directory)) {
            this.sendError(res, 403, 'Forbidden');
            return;
        }

        this.serveFile(filePath, res);
    }

    serveFile(filePath, res) {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    this.sendError(res, 404, 'File not found');
                } else {
                    this.sendError(res, 500, 'Server error');
                }
                return;
            }

            // Get file extension and MIME type
            const ext = path.extname(filePath).toLowerCase();
            const mimeType = this.mimeTypes[ext] || 'application/octet-stream';

            res.writeHead(200, {
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            });
            
            res.end(data);
        });
    }

    sendError(res, statusCode, message) {
        res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
        res.end(`${statusCode} - ${message}`);
    }
}

// Start the server
const server = new StaticServer(3000, 'public');
server.start();