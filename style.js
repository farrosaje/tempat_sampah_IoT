// ================= WEB SERIAL API HANDLER =================

// Serial connection variables
let serialPort = null;
let reader = null;
let writer = null;
let isConnecting = false;

// Connection status
window.isConnected = false;

// ================= CONNECTION FUNCTIONS =================
async function connectArduino() {
    try {
        // Check browser support
        if (!navigator.serial) {
            showNotification('Browser tidak mendukung Web Serial API. Gunakan Chrome/Edge versi terbaru.', 'error');
            addLog('Web Serial API tidak didukung', 'error');
            return;
        }
        
        if (isConnecting) {
            showNotification('Sedang mencoba menghubungkan...', 'warning');
            return;
        }
        
        isConnecting = true;
        showNotification('Mencoba menghubungkan ke Arduino...', 'info');
        addLog('Memulai koneksi Arduino', 'info');
        
        // Request port
        serialPort = await navigator.serial.requestPort();
        
        // Get baud rate from settings
        const baudRate = parseInt(document.getElementById('baudRateSelect').value) || 115200;
        
        // Open port
        await serialPort.open({ baudRate: baudRate });
        
        // Setup reader and writer
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
        reader = textDecoder.readable.getReader();
        writer = serialPort.writable.getWriter();
        
        // Update connection status
        window.isConnected = true;
        isConnecting = false;
        
        // Update UI
        updateConnectionStatus();
        showNotification(`Arduino terhubung! (${baudRate} baud)`, 'success');
        addLog(`Arduino terhubung di ${baudRate} baud`, 'success');
        
        // Start reading data
        readSerialData();
        
        // Send initial command
        setTimeout(() => {
            sendSerialCommand('STATUS');
            addLog('Mengirim command STATUS ke Arduino', 'info');
        }, 1000);
        
    } catch (error) {
        console.error('Connection error:', error);
        isConnecting = false;
        
        if (error.name === 'NotFoundError') {
            showNotification('Tidak ada perangkat serial ditemukan', 'error');
            addLog('Tidak ada perangkat serial ditemukan', 'error');
        } else if (error.name === 'SecurityError') {
            showNotification('Izin akses serial ditolak', 'error');
            addLog('Izin akses serial ditolak', 'error');
        } else {
            showNotification('Gagal menghubungkan: ' + error.message, 'error');
            addLog('Gagal menghubungkan: ' + error.message, 'error');
        }
        
        // Reset connection
        window.isConnected = false;
        updateConnectionStatus();
    }
}

async function disconnectArduino() {
    try {
        if (reader) {
            await reader.cancel();
            reader = null;
        }
        
        if (writer) {
            writer.releaseLock();
            writer = null;
        }
        
        if (serialPort) {
            await serialPort.close();
            serialPort = null;
        }
        
        window.isConnected = false;
        updateConnectionStatus();
        
        showNotification('Arduino terputus', 'warning');
        addLog('Arduino terputus', 'warning');
        
    } catch (error) {
        console.error('Disconnection error:', error);
        showNotification('Error memutuskan koneksi: ' + error.message, 'error');
        addLog('Error memutuskan koneksi: ' + error.message, 'error');
    }
}

function updateConnectionStatus() {
    // Update UI elements
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const connectionStatus = document.getElementById('connectionStatus');
    const btnConnect = document.getElementById('btnConnect');
    const btnDisconnect = document.getElementById('btnDisconnect');
    
    if (window.isConnected) {
        statusDot.classList.add('online');
        statusText.textContent = 'Online';
        connectionStatus.textContent = 'Connected';
        connectionStatus.style.color = '#4CAF50';
        
        btnConnect.disabled = true;
        btnDisconnect.disabled = false;
        
        // Update baud rate display
        const baudRate = document.getElementById('baudRateSelect').value;
        document.getElementById('connectionBaud').textContent = baudRate;
        document.getElementById('connectionPort').textContent = 'COM' + (Math.floor(Math.random() * 10) + 1); // Simulated
        
    } else {
        statusDot.classList.remove('online');
        statusText.textContent = 'Offline';
        connectionStatus.textContent = 'Disconnected';
        connectionStatus.style.color = '#D32F2F';
        
        btnConnect.disabled = false;
        btnDisconnect.disabled = true;
        
        document.getElementById('connectionPort').textContent = '-';
    }
}

// ================= DATA READING =================
async function readSerialData() {
    try {
        while (true) {
            const { value, done } = await reader.read();
            
            if (done) {
                console.log('Serial reader done');
                reader.releaseLock();
                break;
            }
            
            if (value) {
                processSerialData(value);
            }
        }
    } catch (error) {
        console.error('Serial read error:', error);
        
        if (error.name !== 'InterruptedError') {
            showNotification('Error membaca data serial: ' + error.message, 'error');
            addLog('Error membaca data serial: ' + error.message, 'error');
            
            // Try to reconnect
            setTimeout(() => {
                if (window.isConnected) {
                    addLog('Mencoba reconnect...', 'info');
                    disconnectArduino().then(() => {
                        setTimeout(connectArduino, 1000);
                    });
                }
            }, 3000);
        }
    }
}

function processSerialData(data) {
    console.log('From Arduino:', data);
    
    // Split by newline and process each line
    const lines = data.split('\n');
    
    lines.forEach(line => {
        line = line.trim();
        if (line.length === 0) return;
        
        // Update last update time
        db.lastUpdate = new Date();
        
        // Parse different data formats
        if (line.includes(',')) {
            // Format: STATUS,KAPASITAS,JARAK,PENGGUNAAN_HARI,TOTAL_PENGGUNAAN
            const parts = line.split(',');
            if (parts.length >= 5) {
                updateFromArduinoData({
                    status: parts[0],
                    capacity: parseInt(parts[1]),
                    distance: parseInt(parts[2]),
                    dailyUsage: parseInt(parts[3]),
                    totalUsage: parseInt(parts[4])
                });
            }
        } else if (line.startsWith('STATUS:')) {
            // Simple status format
            const status = line.replace('STATUS:', '').trim();
            db.status = status;
            addLog(`Status dari Arduino: ${status}`, 'info');
            
        } else if (line.startsWith('DISTANCE:')) {
            // Distance data
            const distance = parseInt(line.replace('DISTANCE:', '').trim());
            db.distance = distance;
            db.capacity = calculateCapacity(distance);
            
        } else if (line.startsWith('USAGE:')) {
            // Usage data
            const usage = parseInt(line.replace('USAGE:', '').trim());
            db.dailyUsage = usage;
            
        } else {
            // Generic log
            addLog(`Arduino: ${line}`, 'info');
        }
    });
    
    // Update UI
    updateAllDisplays();
}

function updateFromArduinoData(data) {
    // Update database
    db.status = data.status;
    db.capacity = data.capacity;
    db.distance = data.distance;
    db.dailyUsage = data.dailyUsage;
    db.totalUsage = data.totalUsage;
    
    // Update last activity if door just opened
    if (data.status === "BUKA" && db.status !== "BUKA") {
        db.lastActivity = new Date();
        addLog('Tong dibuka oleh Arduino', 'success');
    } else if (data.status === "TUTUP" && db.status !== "TUTUP") {
        addLog('Tong ditutup oleh Arduino', 'success');
    }
    
    // Add to history
    addToUsageHistory(data.capacity);
    
    // Log the update
    addLog(`Data diterima: ${data.capacity}%, ${data.distance}cm`, 'info');
}

function calculateCapacity(distance) {
    // Convert distance to capacity percentage
    // Assuming: 0cm = 100% full, 50cm = 0% full
    const maxDistance = 50;
    const minDistance = 0;
    
    let capacity = 100 - ((distance - minDistance) / (maxDistance - minDistance)) * 100;
    capacity = Math.max(0, Math.min(100, Math.round(capacity)));
    
    return capacity;
}

// ================= COMMAND SENDING =================
async function sendSerialCommand(command) {
    try {
        if (!window.isConnected || !writer) {
            showNotification('Arduino tidak terhubung', 'error');
            return;
        }
        
        // Send command with newline
        await writer.write(new TextEncoder().encode(command + '\n'));
        console.log('Sent to Arduino:', command);
        
        // Log the command
        addLog(`Command dikirim ke Arduino: ${command}`, 'info');
        
    } catch (error) {
        console.error('Send command error:', error);
        showNotification('Gagal mengirim command: ' + error.message, 'error');
        addLog('Gagal mengirim command: ' + error.message, 'error');
        
        // Disconnect on error
        disconnectArduino();
    }
}

// ================= EXPORT TO WINDOW =================
window.connectArduino = connectArduino;
window.disconnectArduino = disconnectArduino;
window.sendSerialCommand = sendSerialCommand;

// Override the sendCommand function from script.js
const originalSendCommand = window.sendCommand;
window.sendCommand = function(command) {
    if (window.isConnected) {
        sendSerialCommand(command);
    } else {
        originalSendCommand(command);
    }
};
