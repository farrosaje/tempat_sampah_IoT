// ================= TONG SAMPAH SMART MONITORING SYSTEM =================
// Version: 2.0.0 | Single File Optimized | Date: 2024-01-15
// Author: Operations Excellence Team | License: MIT

'use strict';

// ================= MODULE PATTERN: TONG SAMPAH APP =================
const TongSampahApp = (function() {
    // ================= PRIVATE VARIABLES =================
    let instance = null;
    
    // Core State Management
    const state = {
        db: null,
        serial: {
            port: null,
            reader: null,
            writer: null,
            isConnected: false,
            isConnecting: false,
            baudRate: 115200
        },
        timers: {
            autoRefresh: null,
            intervals: [],
            lastUpdate: 0
        },
        ui: {
            chart: null,
            notifications: [],
            modalOpen: false
        },
        config: {
            version: '2.0.0',
            storagePrefix: 'tongSampah_',
            api: {
                endpoints: {
                    simulate: '/api/simulate',
                    export: '/api/export',
                    backup: '/api/backup'
                },
                retryAttempts: 3,
                timeout: 10000
            }
        }
    };
    
    // Performance Optimizations
    const perf = {
        lastRender: 0,
        renderQueue: [],
        debounceTimers: {},
        cache: new Map()
    };
    
    // ================= PRIVATE METHODS =================
    
    // ===== STORAGE MANAGEMENT =====
    const Storage = {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(`${state.config.storagePrefix}${key}`);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Storage get error:', error);
                return defaultValue;
            }
        },
        
        set(key, value) {
            try {
                localStorage.setItem(`${state.config.storagePrefix}${key}`, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Storage set error:', error);
                return false;
            }
        },
        
        remove(key) {
            localStorage.removeItem(`${state.config.storagePrefix}${key}`);
        },
        
        clear() {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(state.config.storagePrefix)) {
                    localStorage.removeItem(key);
                }
            });
        },
        
        getSize() {
            let total = 0;
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(state.config.storagePrefix)) {
                    total += localStorage[key] ? localStorage[key].length : 0;
                }
            });
            return total;
        }
    };
    
    // ===== UTILITY FUNCTIONS =====
    const Utils = {
        // Debounce untuk performance
        debounce(func, wait, immediate = false) {
            return function() {
                const context = this;
                const args = arguments;
                
                const later = function() {
                    perf.debounceTimers[func.name] = null;
                    if (!immediate) func.apply(context, args);
                };
                
                const callNow = immediate && !perf.debounceTimers[func.name];
                
                clearTimeout(perf.debounceTimers[func.name]);
                perf.debounceTimers[func.name] = setTimeout(later, wait);
                
                if (callNow) func.apply(context, args);
            };
        },
        
        // Throttle untuk rate limiting
        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        // Format waktu
        formatTime(seconds) {
            const units = [
                { label: 'hari', value: 86400 },
                { label: 'jam', value: 3600 },
                { label: 'menit', value: 60 },
                { label: 'detik', value: 1 }
            ];
            
            for (const unit of units) {
                if (seconds >= unit.value) {
                    const value = Math.floor(seconds / unit.value);
                    return `${value} ${unit.label}`;
                }
            }
            return '0 detik';
        },
        
        // Generate unique ID
        generateId(prefix = '') {
            return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        },
        
        // Deep clone object
        deepClone(obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        
        // Validate email
        isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        
        // Format number
        formatNumber(num, decimals = 0) {
            return num.toLocaleString('id-ID', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        },
        
        // Calculate capacity from distance
        calculateCapacity(distance, maxDistance = 50, minDistance = 0) {
            const clamped = Math.max(minDistance, Math.min(maxDistance, distance));
            const capacity = 100 - ((clamped - minDistance) / (maxDistance - minDistance)) * 100;
            return Math.round(Math.max(0, Math.min(100, capacity)));
        }
    };
    
    // ===== DATA PROCESSING =====
    const DataProcessor = {
        // Process serial data efficiently
        processSerialChunk(chunk) {
            const lines = chunk.trim().split('\n');
            const results = [];
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                
                const result = this.parseSerialLine(trimmed);
                if (result) results.push(result);
            }
            
            return results;
        },
        
        parseSerialLine(line) {
            // Prioritize most common formats first
            if (line.includes(',')) {
                const parts = line.split(',');
                if (parts.length >= 5) {
                    return {
                        type: 'full',
                        status: parts[0],
                        capacity: parseInt(parts[1]) || 0,
                        distance: parseInt(parts[2]) || 0,
                        dailyUsage: parseInt(parts[3]) || 0,
                        totalUsage: parseInt(parts[4]) || 0,
                        raw: line
                    };
                }
            }
            
            // Check for specific patterns
            const patterns = {
                status: /^STATUS:(.+)$/,
                distance: /^DISTANCE:(\d+)/,
                usage: /^USAGE:(\d+)/,
                ready: /^SYSTEM_READY/,
                command: /^CMD_RECEIVED:(.+)$/
            };
            
            for (const [key, regex] of Object.entries(patterns)) {
                const match = line.match(regex);
                if (match) {
                    return {
                        type: key,
                        value: match[1] || true,
                        raw: line
                    };
                }
            }
            
            // Generic message
            return {
                type: 'message',
                value: line,
                raw: line
            };
        },
        
        // Batch process for performance
        batchUpdate(updates) {
            const fullUpdates = updates.filter(u => u.type === 'full');
            
            if (fullUpdates.length > 0) {
                const latest = fullUpdates[fullUpdates.length - 1];
                this.applyUpdate(latest);
                return true;
            }
            
            // Process individual updates
            updates.forEach(update => {
                this.applyPartialUpdate(update);
            });
            
            return updates.length > 0;
        },
        
        applyUpdate(data) {
            if (!data || data.type !== 'full') return;
            
            const oldStatus = state.db.status;
            state.db.status = data.status;
            state.db.capacity = data.capacity;
            state.db.distance = data.distance;
            state.db.dailyUsage = data.dailyUsage;
            state.db.totalUsage = data.totalUsage;
            state.db.lastUpdate = Date.now();
            
            // Check for status change
            if (oldStatus !== data.status) {
                this.handleStatusChange(data.status, oldStatus);
            }
            
            // Add to history
            HistoryManager.addToHistory(data.capacity);
        },
        
        applyPartialUpdate(data) {
            switch(data.type) {
                case 'status':
                    state.db.status = data.value;
                    break;
                case 'distance':
                    state.db.distance = parseInt(data.value);
                    state.db.capacity = Utils.calculateCapacity(state.db.distance);
                    break;
                case 'usage':
                    state.db.dailyUsage = parseInt(data.value);
                    break;
            }
            state.db.lastUpdate = Date.now();
        },
        
        handleStatusChange(newStatus, oldStatus) {
            if (newStatus === "BUKA" && oldStatus === "TUTUP") {
                state.db.lastActivity = Date.now();
                state.db.dailyUsage++;
                state.db.totalUsage++;
                Logger.log('Tong dibuka oleh Arduino', 'success');
            } else if (newStatus === "TUTUP" && oldStatus === "BUKA") {
                Logger.log('Tong ditutup oleh Arduino', 'success');
            }
        }
    };
    
    // ===== HISTORY MANAGER =====
    const HistoryManager = {
        maxHistorySize: 1000,
        
        addToHistory(capacity) {
            const timestamp = Date.now();
            const entry = { timestamp, capacity };
            
            // Add to daily history
            state.db.usageHistory.daily.push(entry);
            
            // Trim history if too large
            if (state.db.usageHistory.daily.length > this.maxHistorySize) {
                state.db.usageHistory.daily = state.db.usageHistory.daily.slice(-500);
            }
            
            // Aggregate weekly/monthly
            this.aggregateHistory(timestamp, capacity);
            
            // Auto-save every 10 entries
            if (state.db.usageHistory.daily.length % 10 === 0) {
                Storage.set('history', state.db.usageHistory);
            }
        },
        
        aggregateHistory(timestamp, capacity) {
            const date = new Date(timestamp);
            const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            
            // Weekly aggregation
            if (!state.db.usageHistory.weekly[weekKey]) {
                state.db.usageHistory.weekly[weekKey] = {
                    total: 0,
                    count: 0,
                    max: 0,
                    min: 100,
                    timestamps: []
                };
            }
            
            const week = state.db.usageHistory.weekly[weekKey];
            week.total += capacity;
            week.count++;
            week.max = Math.max(week.max, capacity);
            week.min = Math.min(week.min, capacity);
            week.timestamps.push(timestamp);
            
            // Monthly aggregation
            if (!state.db.usageHistory.monthly[monthKey]) {
                state.db.usageHistory.monthly[monthKey] = {
                    total: 0,
                    count: 0,
                    max: 0,
                    min: 100,
                    timestamps: []
                };
            }
            
            const month = state.db.usageHistory.monthly[monthKey];
            month.total += capacity;
            month.count++;
            month.max = Math.max(month.max, capacity);
            month.min = Math.min(month.min, capacity);
            month.timestamps.push(timestamp);
            
            // Clean up old data (keep 12 months)
            const months = Object.keys(state.db.usageHistory.monthly);
            if (months.length > 12) {
                const oldMonths = months.slice(0, -12);
                oldMonths.forEach(m => delete state.db.usageHistory.monthly[m]);
            }
        },
        
        getStats(period = 'daily') {
            const data = state.db.usageHistory[period];
            if (!data || data.length === 0) return null;
            
            const values = data.map(d => d.capacity);
            return {
                average: values.reduce((a, b) => a + b, 0) / values.length,
                max: Math.max(...values),
                min: Math.min(...values),
                last: values[values.length - 1],
                count: values.length
            };
        }
    };
    
    // ===== LOGGER =====
    const Logger = {
        maxLogs: 500,
        logTypes: {
            info: { icon: 'info-circle', color: '#2196F3' },
            success: { icon: 'check-circle', color: '#4CAF50' },
            warning: { icon: 'exclamation-triangle', color: '#FF9800' },
            error: { icon: 'times-circle', color: '#F44336' },
            arduino: { icon: 'microchip', color: '#9C27B0' }
        },
        
        log(message, type = 'info', data = null) {
            const logEntry = {
                id: Utils.generateId('log'),
                timestamp: Date.now(),
                message,
                type,
                data
            };
            
            // Add to logs array
            state.db.logs.unshift(logEntry);
            
            // Trim logs if too large
            if (state.db.logs.length > this.maxLogs) {
                state.db.logs = state.db.logs.slice(0, this.maxLogs);
            }
            
            // Auto-save logs
            if (state.db.logs.length % 20 === 0) {
                Storage.set('logs', state.db.logs);
            }
            
            // Update UI if needed
            if (UI.isInitialized) {
                UI.updateLogEntry(logEntry);
            }
            
            // Console output in development
            if (state.config.debug) {
                console.log(`[${type.toUpperCase()}] ${message}`, data || '');
            }
            
            return logEntry.id;
        },
        
        clearLogs() {
            state.db.logs = [];
            Storage.set('logs', []);
            UI.clearLogDisplay();
        },
        
        exportLogs(format = 'json') {
            const data = state.db.logs;
            
            if (format === 'csv') {
                const headers = ['Timestamp', 'Type', 'Message', 'Data'];
                const rows = data.map(log => [
                    new Date(log.timestamp).toISOString(),
                    log.type,
                    log.message,
                    JSON.stringify(log.data || '')
                ]);
                
                return {
                    content: [headers, ...rows].map(row => row.join(',')).join('\n'),
                    filename: `logs_${Date.now()}.csv`,
                    mimeType: 'text/csv'
                };
            } else {
                return {
                    content: JSON.stringify(data, null, 2),
                    filename: `logs_${Date.now()}.json`,
                    mimeType: 'application/json'
                };
            }
        }
    };
    
    // ===== SERIAL MANAGER =====
    const SerialManager = {
        async connect() {
            if (state.serial.isConnecting || state.serial.isConnected) return false;
            
            // Check browser support
            if (!this.checkSupport()) {
                UI.showNotification('Browser tidak mendukung Web Serial API', 'error');
                return false;
            }
            
            state.serial.isConnecting = true;
            UI.updateConnectionUI('connecting');
            Logger.log('Memulai koneksi Arduino...', 'info');
            
            try {
                // Request port
                state.serial.port = await navigator.serial.requestPort();
                
                // Open with baud rate
                const baudRate = state.db.settings.connectionBaud || 115200;
                await state.serial.port.open({ baudRate });
                
                // Setup streams
                const textEncoder = new TextEncoderStream();
                const writableStreamClosed = textEncoder.readable.pipeTo(state.serial.port.writable);
                state.serial.writer = textEncoder.writable.getWriter();
                
                const textDecoder = new TextDecoderStream();
                const readableStreamClosed = state.serial.port.readable.pipeTo(textDecoder.writable);
                state.serial.reader = textDecoder.readable.getReader();
                
                // Update state
                state.serial.isConnected = true;
                state.serial.isConnecting = false;
                state.serial.baudRate = baudRate;
                
                // Update UI
                UI.updateConnectionUI('connected');
                UI.showNotification(`Arduino terhubung (${baudRate} baud)`, 'success');
                Logger.log(`Arduino terhubung di ${baudRate} baud`, 'success');
                
                // Start reading
                this.startReading();
                
                // Initial status request
                setTimeout(() => this.send('STATUS'), 500);
                
                return true;
                
            } catch (error) {
                return this.handleConnectionError(error);
            }
        },
        
        async disconnect() {
            if (!state.serial.isConnected && !state.serial.isConnecting) return;
            
            Logger.log('Memutuskan koneksi Arduino...', 'info');
            
            try {
                // Close reader
                if (state.serial.reader) {
                    await state.serial.reader.cancel();
                    state.serial.reader.releaseLock();
                    state.serial.reader = null;
                }
                
                // Close writer
                if (state.serial.writer) {
                    await state.serial.writer.close();
                    state.serial.writer.releaseLock();
                    state.serial.writer = null;
                }
                
                // Close port
                if (state.serial.port) {
                    await state.serial.port.close();
                    state.serial.port = null;
                }
                
            } catch (error) {
                console.error('Disconnect error:', error);
            } finally {
                // Reset state
                state.serial.isConnected = false;
                state.serial.isConnecting = false;
                
                // Update UI
                UI.updateConnectionUI('disconnected');
                UI.showNotification('Arduino terputus', 'warning');
                Logger.log('Arduino terputus', 'warning');
            }
        },
        
        async startReading() {
            try {
                while (state.serial.isConnected && state.serial.reader) {
                    const { value, done } = await state.serial.reader.read();
                    
                    if (done) {
                        state.serial.reader.releaseLock();
                        break;
                    }
                    
                    if (value) {
                        this.processData(value);
                    }
                }
            } catch (error) {
                if (error.name !== 'InterruptedError') {
                    Logger.log('Error membaca data serial: ' + error.message, 'error');
                    this.disconnect();
                }
            }
        },
        
        processData(data) {
            const updates = DataProcessor.processSerialChunk(data);
            
            if (DataProcessor.batchUpdate(updates)) {
                // Throttle UI updates for performance
                UI.scheduleUpdate('all');
            }
            
            // Log non-data messages
            updates.forEach(update => {
                if (update.type === 'message' || update.type === 'ready') {
                    Logger.log(`Arduino: ${update.value}`, 'arduino');
                }
            });
        },
        
        async send(command) {
            if (!state.serial.isConnected || !state.serial.writer) {
                UI.showNotification('Arduino tidak terhubung', 'error');
                return false;
            }
            
            try {
                await state.serial.writer.write(new TextEncoder().encode(command + '\n'));
                Logger.log(`Command dikirim: ${command}`, 'info');
                return true;
            } catch (error) {
                Logger.log('Gagal mengirim command: ' + error.message, 'error');
                this.disconnect();
                return false;
            }
        },
        
        checkSupport() {
            return !!navigator.serial;
        },
        
        handleConnectionError(error) {
            state.serial.isConnecting = false;
            UI.updateConnectionUI('disconnected');
            
            let message = 'Gagal menghubungkan: ';
            
            switch(error.name) {
                case 'NotFoundError':
                    message = 'Tidak ada perangkat Arduino ditemukan';
                    break;
                case 'SecurityError':
                    message = 'Izin akses serial ditolak';
                    break;
                case 'InvalidStateError':
                    message = 'Port sedang digunakan';
                    break;
                default:
                    message += error.message;
            }
            
            UI.showNotification(message, 'error');
            Logger.log(message, 'error');
            
            return false;
        }
    };
    
    // ===== UI MANAGER =====
    const UI = {
        isInitialized: false,
        updateQueue: new Set(),
        pendingAnimationFrame: null,
        
        init() {
            this.setupEventListeners();
            this.initChart();
            this.updateAll();
            this.isInitialized = true;
            
            // Start update scheduler
            this.startUpdateScheduler();
        },
        
        setupEventListeners() {
            // Connection buttons
            this.on('#btnConnect', 'click', () => SerialManager.connect());
            this.on('#btnDisconnect', 'click', () => SerialManager.disconnect());
            
            // Door controls
            this.on('#btnBuka', 'click', () => this.sendCommand('BUKA'));
            this.on('#btnTutup', 'click', () => this.sendCommand('TUTUP'));
            
            // Data controls
            this.on('#btnRefresh', 'click', () => this.refreshData());
            this.on('#btnSimulate', 'click', () => this.simulateData());
            
            // Log controls
            this.on('#btnClearLogs', 'click', () => Logger.clearLogs());
            this.on('#btnExportLogs', 'click', () => this.exportLogs());
            
            // Settings
            this.on('#baudRateSelect', 'change', (e) => {
                state.db.settings.connectionBaud = parseInt(e.target.value);
                Storage.set('settings', state.db.settings);
            });
            
            this.on('#autoRefreshToggle', 'change', (e) => {
                state.db.settings.autoRefresh = e.target.checked;
                Storage.set('settings', state.db.settings);
                this.toggleAutoRefresh();
            });
            
            // Keyboard shortcuts
            document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
            
            // Window events
            window.addEventListener('beforeunload', () => {
                this.cleanup();
            });
        },
        
        on(selector, event, handler) {
            const element = document.querySelector(selector);
            if (element) {
                element.addEventListener(event, handler);
            }
        },
        
        handleKeyboardShortcuts(e) {
            // Prevent in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const shortcuts = {
                'Ctrl+R': () => this.refreshData(),
                'Ctrl+D': () => this.toggleDoor(),
                'Ctrl+L': () => Logger.clearLogs(),
                'Ctrl+C': () => !state.serial.isConnected && SerialManager.connect(),
                'Ctrl+X': () => state.serial.isConnected && SerialManager.disconnect(),
                'F1': () => this.showHelp()
            };
            
            const key = e.ctrlKey ? `Ctrl+${e.key.toUpperCase()}` : e.key;
            
            if (shortcuts[key]) {
                e.preventDefault();
                shortcuts[key]();
            }
        },
        
        sendCommand(command) {
            if (state.serial.isConnected) {
                SerialManager.send(command);
            } else {
                this.simulateCommand(command);
            }
        },
        
        simulateCommand(command) {
            switch(command) {
                case 'BUKA':
                    state.db.status = "BUKA";
                    state.db.lastActivity = Date.now();
                    state.db.dailyUsage++;
                    state.db.totalUsage++;
                    Logger.log('Tong dibuka (simulasi)', 'success');
                    break;
                    
                case 'TUTUP':
                    state.db.status = "TUTUP";
                    Logger.log('Tong ditutup (simulasi)', 'success');
                    break;
                    
                case 'STATUS':
                    this.generateSimulatedData();
                    Logger.log('Status diperbarui (simulasi)', 'info');
                    break;
            }
            
            this.scheduleUpdate('all');
            UI.showNotification(`Command "${command}" dieksekusi (simulasi)`, 'info');
        },
        
        toggleDoor() {
            this.sendCommand(state.db.status === "BUKA" ? "TUTUP" : "BUKA");
        },
        
        refreshData() {
            this.sendCommand('STATUS');
            Logger.log('Data direfresh', 'info');
        },
        
        // ===== UI UPDATE METHODS =====
        scheduleUpdate(type) {
            this.updateQueue.add(type);
            
            if (!this.pendingAnimationFrame) {
                this.pendingAnimationFrame = requestAnimationFrame(() => {
                    this.processUpdateQueue();
                    this.pendingAnimationFrame = null;
                });
            }
        },
        
        processUpdateQueue() {
            if (this.updateQueue.has('all')) {
                this.updateAll();
                this.updateQueue.clear();
            } else {
                this.updateQueue.forEach(type => {
                    this[`update${type.charAt(0).toUpperCase() + type.slice(1)}`]();
                });
                this.updateQueue.clear();
            }
        },
        
        updateAll() {
            this.updateCapacity();
            this.updateStatus();
            this.updateSensors();
            this.updateStats();
            this.updateConnection();
            this.updateAlerts();
            this.updateTime();
        },
        
        updateCapacity() {
            const capacity = state.db.capacity;
            const fillBar = document.getElementById('capacityFill');
            const percentElement = document.getElementById('capacityPercent');
            
            if (!fillBar || !percentElement) return;
            
            // Update with transform for better performance
            fillBar.style.transform = `scaleX(${capacity / 100})`;
            
            // Only update text if changed
            const newText = `${capacity}%`;
            if (percentElement.textContent !== newText) {
                percentElement.textContent = newText;
            }
            
            // Update color
            let color;
            if (capacity < 30) color = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
            else if (capacity < 70) color = 'linear-gradient(90deg, #FFA000, #FFB300)';
            else color = 'linear-gradient(90deg, #D32F2F, #F44336)';
            
            fillBar.style.background = color;
        },
        
        updateStatus() {
            const isOpen = state.db.status === "BUKA";
            const icon = document.getElementById('statusIcon');
            const text = document.getElementById('statusTextDisplay');
            const btnBuka = document.getElementById('btnBuka');
            const btnTutup = document.getElementById('btnTutup');
            
            if (icon) icon.innerHTML = isOpen ? 
                '<i class="fas fa-door-open"></i>' : 
                '<i class="fas fa-door-closed"></i>';
            
            if (text) text.textContent = isOpen ? "TERBUKA" : "TERTUTUP";
            
            if (btnBuka) btnBuka.disabled = isOpen;
            if (btnTutup) btnTutup.disabled = !isOpen;
            
            // Update last activity
            if (state.db.lastActivity) {
                const elapsed = Math.floor((Date.now() - state.db.lastActivity) / 1000);
                const element = document.getElementById('lastActivityTime');
                if (element) element.textContent = Utils.formatTime(elapsed) + " yang lalu";
            }
        },
        
        updateSensors() {
            // Distance
            const distanceValue = document.getElementById('distanceValue');
            const distanceBar = document.getElementById('distanceBar');
            if (distanceValue) distanceValue.textContent = `${state.db.distance} cm`;
            if (distanceBar) distanceBar.style.width = `${Math.min(state.db.distance * 2, 100)}%`;
            
            // Last update
            const lastUpdate = Math.floor((Date.now() - state.db.lastUpdate) / 1000);
            const lastUpdateElement = document.getElementById('lastUpdate');
            if (lastUpdateElement) lastUpdateElement.textContent = `${lastUpdate} detik`;
        },
        
        updateStats() {
            const elements = {
                dailyUsage: state.db.dailyUsage,
                totalUsage: state.db.totalUsage,
                avgDaily: state.db.totalUsage > 0 ? Math.round(state.db.totalUsage / 30) : 0
            };
            
            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            });
        },
        
        updateConnection() {
            const status = state.serial.isConnected ? 'connected' : 
                          state.serial.isConnecting ? 'connecting' : 'disconnected';
            this.updateConnectionUI(status);
        },
        
        updateConnectionUI(status) {
            const elements = {
                statusDot: document.getElementById('statusDot'),
                statusText: document.getElementById('statusText'),
                connectionStatus: document.getElementById('connectionStatus'),
                btnConnect: document.getElementById('btnConnect'),
                btnDisconnect: document.getElementById('btnDisconnect'),
                connectionBaud: document.getElementById('connectionBaud'),
                connectionPort: document.getElementById('connectionPort')
            };
            
            const configs = {
                connected: {
                    dotClass: 'online',
                    text: 'Online',
                    textColor: '#4CAF50',
                    status: 'Connected',
                    btnConnectText: '<i class="fas fa-plug"></i> Terhubung',
                    btnConnectDisabled: true,
                    btnDisconnectDisabled: false,
                    baud: state.serial.baudRate,
                    port: `COM${Math.floor(Math.random() * 10) + 1}`
                },
                connecting: {
                    dotClass: 'online pulse',
                    text: 'Connecting...',
                    textColor: '#FFA000',
                    status: 'Connecting',
                    btnConnectText: '<i class="fas fa-spinner fa-spin"></i> Menghubungkan...',
                    btnConnectDisabled: true,
                    btnDisconnectDisabled: true
                },
                disconnected: {
                    dotClass: '',
                    text: 'Offline',
                    textColor: '#D32F2F',
                    status: 'Disconnected',
                    btnConnectText: '<i class="fas fa-plug"></i> Hubungkan Arduino',
                    btnConnectDisabled: false,
                    btnDisconnectDisabled: true,
                    port: '-'
                }
            };
            
            const config = configs[status];
            
            if (elements.statusDot) {
                elements.statusDot.className = 'status-dot';
                if (config.dotClass) elements.statusDot.classList.add(config.dotClass);
            }
            
            if (elements.statusText) {
                elements.statusText.textContent = config.text;
                elements.statusText.style.color = config.textColor;
            }
            
            if (elements.connectionStatus) {
                elements.connectionStatus.textContent = config.status;
                elements.connectionStatus.style.color = config.textColor;
            }
            
            if (elements.btnConnect) {
                elements.btnConnect.disabled = config.btnConnectDisabled;
                elements.btnConnect.innerHTML = config.btnConnectText;
            }
            
            if (elements.btnDisconnect) {
                elements.btnDisconnect.disabled = config.btnDisconnectDisabled;
            }
            
            if (elements.connectionBaud && config.baud) {
                elements.connectionBaud.textContent = config.baud;
            }
            
            if (elements.connectionPort) {
                elements.connectionPort.textContent = config.port;
            }
        },
        
        updateAlerts() {
            const alertBox = document.getElementById('alertBox');
            if (!alertBox) return;
            
            const shouldAlert = state.db.capacity >= state.db.settings.alertThreshold;
            
            if (shouldAlert) {
                alertBox.classList.remove('hidden');
                
                // Trigger visual alert
                if (!alertBox.dataset.alerted) {
                    alertBox.dataset.alerted = 'true';
                    alertBox.style.animation = 'pulse 1s infinite';
                    Logger.log(`Peringatan: Kapasitas ${state.db.capacity}% mencapai threshold`, 'warning');
                }
            } else {
                alertBox.classList.add('hidden');
                delete alertBox.dataset.alerted;
                alertBox.style.animation = '';
            }
        },
        
        updateTime() {
            const now = Date.now();
            const elapsed = Math.floor((now - state.db.lastUpdate) / 1000);
            const element = document.getElementById('lastUpdateTime');
            
            if (element) {
                element.textContent = `Update: ${Utils.formatTime(elapsed)} yang lalu`;
            }
        },
        
        // ===== LOG DISPLAY =====
        updateLogEntry(logEntry) {
            const container = document.getElementById('logsContainer');
            if (!container) return;
            
            const logElement = this.createLogElement(logEntry);
            
            // Add to top
            container.insertBefore(logElement, container.firstChild);
            
            // Auto-scroll if enabled
            if (state.db.settings.autoScrollLogs) {
                container.scrollTop = 0;
            }
            
            // Trim if too many
            const logs = container.querySelectorAll('.log-entry');
            if (logs.length > 100) {
                for (let i = 100; i < logs.length; i++) {
                    logs[i].remove();
                }
            }
        },
        
        createLogElement(log) {
            const type = Logger.logTypes[log.type] || Logger.logTypes.info;
            const time = new Date(log.timestamp).toLocaleTimeString();
            
            const div = document.createElement('div');
            div.className = `log-entry log-${log.type}`;
            div.innerHTML = `
                <div class="log-time">${time}</div>
                <div class="log-icon" style="color: ${type.color}">
                    <i class="fas fa-${type.icon}"></i>
                </div>
                <div class="log-message">${log.message}</div>
                ${log.data ? `<div class="log-data">${JSON.stringify(log.data)}</div>` : ''}
            `;
            
            return div;
        },
        
        clearLogDisplay() {
            const container = document.getElementById('logsContainer');
            if (container) container.innerHTML = '';
        },
        
        // ===== CHART =====
        initChart() {
            const ctx = document.getElementById('usageChart');
            if (!ctx) return;
            
            if (window.Chart) {
                state.ui.chart = new window.Chart(ctx.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Kapasitas (%)',
                            data: [],
                            borderColor: '#4CAF50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100
                            }
                        }
                    }
                });
            }
        },
        
        updateChart() {
            if (!state.ui.chart) return;
            
            const history = state.db.usageHistory.daily.slice(-50);
            const labels = history.map(h => 
                new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            );
            const data = history.map(h => h.capacity);
            
            state.ui.chart.data.labels = labels;
            state.ui.chart.data.datasets[0].data = data;
            state.ui.chart.update('none');
        },
        
        // ===== NOTIFICATIONS =====
        showNotification(message, type = 'info', duration = 3000) {
            const container = document.getElementById('notificationContainer');
            if (!container) return;
            
            const id = Utils.generateId('notif');
            const notification = document.createElement('div');
            notification.id = id;
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${Logger.logTypes[type].icon}"></i>
                    <span>${message}</span>
                </div>
                <button class="notification-close" onclick="document.getElementById('${id}').remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            container.appendChild(notification);
            
            // Auto-remove
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) element.remove();
            }, duration);
        },
        
        // ===== AUTO REFRESH =====
        toggleAutoRefresh() {
            if (state.timers.autoRefresh) {
                clearInterval(state.timers.autoRefresh);
                state.timers.autoRefresh = null;
            }
            
            if (state.db.settings.autoRefresh) {
                const interval = state.db.settings.autoRefreshInterval || 5000;
                state.timers.autoRefresh = setInterval(() => {
                    this.refreshData();
                }, interval);
            }
        },
        
        // ===== HELPERS =====
        generateSimulatedData() {
            const randomChange = Math.random() > 0.5 ? 1 : -1;
            const changeAmount = Math.floor(Math.random() * 10) * randomChange;
            
            state.db.distance = Math.max(0, Math.min(50, state.db.distance + changeAmount));
            state.db.capacity = Utils.calculateCapacity(state.db.distance);
            state.db.lastUpdate = Date.now();
        },
        
        exportLogs() {
            const exportData = Logger.exportLogs('csv');
            this.downloadFile(exportData.content, exportData.filename, exportData.mimeType);
            Logger.log('Logs diekspor', 'success');
        },
        
        downloadFile(content, filename, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        
        showHelp() {
            const helpHTML = `
                <div class="modal-content">
                    <h3><i class="fas fa-question-circle"></i> Bantuan & Shortcut</h3>
                    <div class="help-grid">
                        <div><kbd>Ctrl</kbd> + <kbd>R</kbd>: Refresh Data</div>
                        <div><kbd>Ctrl</kbd> + <kbd>D</kbd>: Buka/Tutup</div>
                        <div><kbd>Ctrl</kbd> + <kbd>L</kbd>: Clear Logs</div>
                        <div><kbd>Ctrl</kbd> + <kbd>C</kbd>: Connect</div>
                        <div><kbd>Ctrl</kbd> + <kbd>X</kbd>: Disconnect</div>
                        <div><kbd>F1</kbd>: Bantuan ini</div>
                    </div>
                </div>
            `;
            
            this.showModal(helpHTML);
        },
        
        showModal(content) {
            if (state.ui.modalOpen) return;
            
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = content;
            
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.remove();
                    state.ui.modalOpen = false;
                }
            };
            
            document.body.appendChild(modal);
            state.ui.modalOpen = true;
        },
        
        startUpdateScheduler() {
            // Update time every second
            state.timers.intervals.push(setInterval(() => {
                this.scheduleUpdate('time');
            }, 1000));
            
            // Check alerts every 30 seconds
            state.timers.intervals.push(setInterval(() => {
                this.scheduleUpdate('alerts');
            }, 30000));
            
            // Update chart every minute
            state.timers.intervals.push(setInterval(() => {
                this.updateChart();
            }, 60000));
        },
        
        cleanup() {
            // Clear all intervals
            state.timers.intervals.forEach(clearInterval);
            state.timers.intervals = [];
            
            // Clear auto refresh
            if (state.timers.autoRefresh) {
                clearInterval(state.timers.autoRefresh);
            }
            
            // Save state
            Storage.set('db', state.db);
        }
    };
    
    // ================= PUBLIC API =================
    return {
        // Singleton instance
        getInstance() {
            if (!instance) {
                instance = this;
                this.init();
            }
            return instance;
        },
        
        // Initialization
        init() {
            console.log('TongSampahApp v' + state.config.version + ' initializing...');
            
            // Load or create database
            state.db = Storage.get('db', {
                capacity: 0,
                distance: 0,
                status: "TUTUP",
                dailyUsage: 0,
                totalUsage: 0,
                lastActivity: null,
                lastUpdate: Date.now(),
                alertTriggered: false,
                
                settings: Storage.get('settings', {
                    autoRefresh: false,
                    autoRefreshInterval: 5000,
                    alertThreshold: 80,
                    connectionBaud: 115200,
                    chartType: 'day',
                    autoScrollLogs: true
                }),
                
                logs: Storage.get('logs', []),
                usageHistory: Storage.get('history', {
                    daily: [],
                    weekly: {},
                    monthly: {}
                })
            });
            
            // Initialize UI
            UI.init();
            
            // Start auto-refresh if enabled
            if (state.db.settings.autoRefresh) {
                UI.toggleAutoRefresh();
            }
            
            // Initial log
            Logger.log('Sistem monitoring tong sampah dimulai', 'success');
            
            return this;
        },
        
        // Public methods
        connectArduino: () => SerialManager.connect(),
        disconnectArduino: () => SerialManager.disconnect(),
        sendCommand: (cmd) => UI.sendCommand(cmd),
        refreshData: () => UI.refreshData(),
        toggleDoor: () => UI.toggleDoor(),
        clearLogs: () => Logger.clearLogs(),
        exportData: () => UI.exportLogs(),
        simulateData: () => UI.generateSimulatedData(),
        showHelp: () => UI.showHelp(),
        
        // Debug methods
        getState() {
            return Utils.deepClone(state);
        },
        
        getStats() {
            return {
                storage: {
                    size: Storage.getSize(),
                    items: Object.keys(localStorage).filter(k => k.startsWith(state.config.storagePrefix)).length
                },
                logs: state.db.logs.length,
                history: {
                    daily: state.db.usageHistory.daily.length,
                    weekly: Object.keys(state.db.usageHistory.weekly).length,
                    monthly: Object.keys(state.db.usageHistory.monthly).length
                },
                connection: {
                    isConnected: state.serial.isConnected,
                    baudRate: state.serial.baudRate
                },
                performance: {
                    cacheSize: perf.cache.size,
                    lastRender: perf.lastRender
                }
            };
        },
        
        reset() {
            Storage.clear();
            state.db = null;
            location.reload();
        }
    };
})();

// ================= GLOBAL INITIALIZATION =================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize app
    const app = TongSampahApp.getInstance().init();
    
    // Expose to window for debugging
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.TongSampahApp = app;
        console.log('App exposed to window.TongSampahApp');
    }
    
    // Service Worker Registration (if supported)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
});

// ================= GLOBAL ERROR HANDLING =================
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    if (window.TongSampahApp && window.TongSampahApp.getInstance) {
        window.TongSampahApp.getInstance().log('Global error: ' + e.message, 'error');
    }
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

// ================= POLYFILLS (if needed) =================
if (!String.prototype.padStart) {
    String.prototype.padStart = function(maxLength, fillString = ' ') {
        if (this.length >= maxLength) return this;
        
        fillString = String(fillString);
        if (fillString.length === 0) fillString = ' ';
        
        const fillLen = maxLength - this.length;
        let times = Math.ceil(fillLen / fillString.length);
        
        while (times--) fillString += fillString;
        
        return fillString.slice(0, fillLen) + this;
    };
}

// ================= CSS IN JS (minimal) =================
const styles = `
.status-dot.online { background-color: #4CAF50; }
.status-dot.pulse { animation: pulse 0.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.notification { position: fixed; top: 20px; right: 20px; z-index: 1000; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999; }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// ================= EXPORT FOR MODULE USAGE =================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TongSampahApp;
}
