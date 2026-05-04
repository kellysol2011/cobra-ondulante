class CobraOndulante {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Posição da cabeça (normalizada 0-1)
        this.posX = 0.5;
        this.posY = 0.5;
        
        // Parâmetros da ondulação
        this.waveAmplitude = 25;  // Amplitude da onda
        this.waveFrequency = 0.02;
        this.time = 0;
        
        // Segmentos da cobra
        this.segments = [];
        this.numSegments = 25;
        this.segmentLength = 18;
        
        // Inicializa segmentos
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
        // Suaviza o movimento
        this.posX = this.posX * 0.85 + targetX * 0.15;
        this.posY = this.posY * 0.85 + targetY * 0.15;
    }
    
    updateWave() {
        this.time += 0.05;
    }
    
    calculateSegmentPositions() {
        // Cabeça em pixels
        const headX = this.posX * this.canvas.width;
        const headY = this.posY * this.canvas.height;
        
        // Direção base (para onde a cobra "olha")
        // A cabeça vai ligeiramente na direção do movimento
        let angle = Math.atan2(
            this.segments[0]?.y - headY || 0,
            this.segments[0]?.x - headX || 0
        );
        
        // Adiciona ondulação sinusoidal ao longo do corpo
        this.segments[0] = { x: headX, y: headY };
        
        for (let i = 1; i < this.numSegments; i++) {
            const prev = this.segments[i - 1];
            
            // Ângulo base (seguindo o segmento anterior)
            let segmentAngle = angle;
            
            // Ondulação: cada segmento oscila lateralmente
            const waveOffset = Math.sin(this.time * 3 + i * this.waveFrequency * 100) * this.waveAmplitude;
            
            // Direção perpendicular para ondular
            const perpX = -Math.sin(segmentAngle);
            const perpY = Math.cos(segmentAngle);
            
            // Posição com ondulação
            let newX = prev.x - Math.cos(segmentAngle) * this.segmentLength;
            let newY = prev.y - Math.sin(segmentAngle) * this.segmentLength;
            
            // Aplica ondulação perpendicular
            newX += perpX * waveOffset * (i / this.numSegments);
            newY += perpY * waveOffset * (i / this.numSegments);
            
            this.segments[i] = { x: newX, y: newY };
            
            // Atualiza ângulo para o próximo segmento
            if (i < this.numSegments - 1) {
                angle = Math.atan2(
                    this.segments[i].y - this.segments[i - 1].y,
                    this.segments[i].x - this.segments[i - 1].x
                );
            }
        }
    }
    
    draw() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenha cada segmento como um círculo conectado
        for (let i = 0; i < this.segments.length; i++) {
            const seg = this.segments[i];
            const size = 18 - (i / this.numSegments) * 6; // Diminui pro rabo
            const gradient = this.ctx.createRadialGradient(seg.x, seg.y, 2, seg.x, seg.y, size);
            
            // Cores: verde escuro na cabeça, mais claro no corpo
            if (i === 0) {
                gradient.addColorStop(0, '#2ecc71');
                gradient.addColorStop(1, '#27ae60');
            } else {
                gradient.addColorStop(0, '#58d68d');
                gradient.addColorStop(1, '#1e8449');
            }
            
            this.ctx.beginPath();
            this.ctx.arc(seg.x, seg.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            this.ctx.strokeStyle = '#145a32';
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();
        }
        
        // Desenha olhos na cabeça
        const head = this.segments[0];
        if (head) {
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(head.x - 6, head.y - 4, 3, 0, Math.PI * 2);
            this.ctx.arc(head.x + 6, head.y - 4, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.arc(head.x - 6.5, head.y - 5, 1.5, 0, Math.PI * 2);
            this.ctx.arc(head.x + 5.5, head.y - 5, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Língua (opcional)
            this.ctx.beginPath();
            this.ctx.moveTo(head.x + 12, head.y);
            this.ctx.lineTo(head.x + 20, head.y - 3);
            this.ctx.lineTo(head.x + 20, head.y + 3);
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fill();
        }
    }
    
    animate() {
        this.updateWave();
        this.calculateSegmentPositions();
        this.draw();
    }
}

// --- Gerencia movimento do celular e inicialização ---
let cobra;
let canvas;

function init() {
    canvas = document.getElementById('snakeCanvas');
    cobra = new CobraOndulante(canvas);
    
    window.addEventListener('resize', () => {
        cobra.resize();
    });
    
    // Animação contínua
    function animateLoop() {
        cobra.animate();
        requestAnimationFrame(animateLoop);
    }
    animateLoop();
}

function handleOrientation(event) {
    if (!cobra) return;
    
    let gamma = event.gamma;  // -90 a 90 (esquerda/direita)
    let beta = event.beta;    // -180 a 180 (frente/trás)
    
    if (gamma === null || beta === null) return;
    
    // Mapeia inclinação para posição na tela (0 a 1)
    let targetX = (gamma + 90) / 180;
    let targetY = (beta + 90) / 180;
    
    // Ajusta limites para não sair completamente da tela
    targetX = Math.min(Math.max(targetX, 0.1), 0.9);
    targetY = Math.min(Math.max(targetY, 0.1), 0.9);
    
    cobra.updatePosition(targetX, targetY);
}

function requestOrientationPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS precisa de permissão explícita
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                    document.getElementById('startBtn').style.display = 'none';
                }
            })
            .catch(err => console.log(err));
    } else {
        // Android e outros
        window.addEventListener('deviceorientation', handleOrientation);
        document.getElementById('startBtn').style.display = 'none';
    }
}

// Inicialização
window.addEventListener('load', () => {
    init();
    
    const startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', () => {
        requestOrientationPermission();
    });
    
    // Vídeo autoplay (alguns navegadores precisam de interação)
    const video = document.getElementById('bgVideo');
    video.play().catch(e => console.log('Toque na tela para iniciar vídeo'));
});