class CobraMakuxi {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Posição da cabeça
        this.posX = 0.5;
        this.posY = 0.5;
        
        // Parâmetros da ondulação
        this.waveAmplitude = 35;
        this.waveFrequency = 0.025;
        this.time = 0;
        
        // Segmentos da cobra
        this.segments = [];
        this.numSegments = 30;
        this.segmentLength = 18;
        
        for (let i = 0; i < this.numSegments; i++) {
            this.segments.push({ x: 0, y: 0 });
        }
        
        this.resize();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    updatePosition(targetX, targetY) {
        this.posX = this.posX * 0.85 + targetX * 0.15;
        this.posY = this.posY * 0.85 + targetY * 0.15;
    }
    
    updateWave() {
        this.time += 0.04;
    }
    
    calculateSegmentPositions() {
        const headX = this.posX * this.canvas.width;
        const headY = this.posY * this.canvas.height;
        
        let angle = 0;
        
        this.segments[0] = { x: headX, y: headY };
        
        for (let i = 1; i < this.numSegments; i++) {
            const prev = this.segments[i - 1];
            
            let segmentAngle = angle;
            
            const waveOffset = Math.sin(this.time * 2.5 + i * this.waveFrequency * 120) * this.waveAmplitude * (1 - i / this.numSegments);
            
            const perpX = -Math.sin(segmentAngle);
            const perpY = Math.cos(segmentAngle);
            
            let newX = prev.x - Math.cos(segmentAngle) * this.segmentLength;
            let newY = prev.y - Math.sin(segmentAngle) * this.segmentLength;
            
            newX += perpX * waveOffset;
            newY += perpY * waveOffset;
            
            this.segments[i] = { x: newX, y: newY };
            
            if (i < this.numSegments - 1) {
                angle = Math.atan2(
                    this.segments[i].y - this.segments[i - 1].y,
                    this.segments[i].x - this.segments[i - 1].x
                );
            }
        }
    }
    
    drawMakuxiPattern(x, y, size, isHead = false, index = 0) {
        if (isHead) {
            // CABEÇA
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, size * 0.9, size * 0.7, 0, 0, Math.PI * 2);
            this.ctx.fillStyle = '#8B0000';
            this.ctx.fill();
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Olhos
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(x - size * 0.3, y - size * 0.15, size * 0.2, 0, Math.PI * 2);
            this.ctx.arc(x + size * 0.3, y - size * 0.15, size * 0.2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Pupilas
            this.ctx.fillStyle = '#000000';
            this.ctx.beginPath();
            this.ctx.ellipse(x - size * 0.3, y - size * 0.15, size * 0.08, size * 0.15, 0, 0, Math.PI * 2);
            this.ctx.ellipse(x + size * 0.3, y - size * 0.15, size * 0.08, size * 0.15, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Língua
            this.ctx.beginPath();
            this.ctx.moveTo(x + size * 0.5, y);
            this.ctx.lineTo(x + size * 0.8, y - 4);
            this.ctx.lineTo(x + size * 0.8, y + 4);
            this.ctx.fillStyle = '#FF4444';
            this.ctx.fill();
            
            return;
        }
        
        // CORPO com padrão Makuxi
        const gradient = this.ctx.createLinearGradient(x - size, y - size, x + size, y + size);
        gradient.addColorStop(0, '#2F4F2F');
        gradient.addColorStop(0.5, '#8B0000');
        gradient.addColorStop(1, '#DAA520');
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
        
        // Padrão de losango
        const patternSize = size * 0.6;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - patternSize * 0.5);
        this.ctx.lineTo(x + patternSize * 0.4, y);
        this.ctx.lineTo(x, y + patternSize * 0.5);
        this.ctx.lineTo(x - patternSize * 0.4, y);
        this.ctx.closePath();
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fill();
        this.ctx.stroke();
        
        // Pontos brancos
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.07, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.2, y + size * 0.2, size * 0.07, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    draw() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.segments.length - 1; i >= 0; i--) {
            const seg = this.segments[i];
            if (!seg) continue;
            
            let size;
            let isHead = false;
            
            if (i === 0) {
                size = Math.min(this.canvas.width, this.canvas.height) * 0.045;
                isHead = true;
            } else {
                const proportion = 1 - (i / this.numSegments) * 0.4;
                size = Math.min(this.canvas.width, this.canvas.height) * 0.028 * proportion;
            }
            
            this.drawMakuxiPattern(seg.x, seg.y, size, isHead, i);
        }
    }
    
    animate() {
        this.updateWave();
        this.calculateSegmentPositions();
        this.draw();
    }
}

// --- Inicialização da câmera e movimento ---
let cobra;
let canvas;

async function iniciarCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment'  // Câmera traseira
            } 
        });
        
        const videoFeed = document.getElementById('cameraFeed');
        videoFeed.srcObject = stream;
        await videoFeed.play();
        
        return true;
    } catch (err) {
        console.error('Erro ao acessar câmera:', err);
        alert('Não foi possível acessar a câmera. Verifique as permissões.');
        return false;
    }
}

function init() {
    canvas = document.getElementById('snakeCanvas');
    cobra = new CobraMakuxi(canvas);
    
    window.addEventListener('resize', () => {
        cobra.resize();
    });
    
    function animateLoop() {
        cobra.animate();
        requestAnimationFrame(animateLoop);
    }
    animateLoop();
}

function handleOrientation(event) {
    if (!cobra) return;
    
    let gamma = event.gamma;
    let beta = event.beta;
    
    if (gamma === null || beta === null) return;
    
    let targetX = (gamma + 90) / 180;
    let targetY = (beta + 90) / 180;
    
    targetX = Math.min(Math.max(targetX, 0.08), 0.92);
    targetY = Math.min(Math.max(targetY, 0.08), 0.92);
    
    cobra.updatePosition(targetX, targetY);
}

function requestOrientationPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            })
            .catch(err => console.log(err));
    } else {
        window.addEventListener('deviceorientation', handleOrientation);
    }
}

// Botão principal: ativa câmera E movimento
window.addEventListener('load', () => {
    init();
    
    const startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', async () => {
        startBtn.textContent = '📷 INICIANDO...';
        startBtn.disabled = true;
        
        // Ativa câmera
        const cameraOk = await iniciarCamera();
        
        if (cameraOk) {
            // Ativa movimento do celular
            requestOrientationPermission();
            startBtn.style.display = 'none';
        } else {
            startBtn.textContent = '❌ ERRO NA CÂMERA - TENTE NOVAMENTE';
            startBtn.disabled = false;
            setTimeout(() => {
                startBtn.textContent = '🎥 ATIVAR CÂMERA E MOVIMENTO';
            }, 3000);
        }
    });
});