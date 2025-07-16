class VideoSimulator {
  constructor() {
    // 初期値定数
    this.DEFAULT_VALUES = {
      width: 32,
      height: 32,
      fps: 1,
      duration: 5,
      bits: 1,
      colorMode: 'mono',
      animation: 'bouncing'
    };

    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.isPlaying = false;
    this.currentAnimation = this.DEFAULT_VALUES.animation;
    this.currentColorMode = this.DEFAULT_VALUES.colorMode;
    this.currentUnit = 'byte';
    this.animationId = null;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.animationStartTime = 0;
    
    this.setupEventListeners();
    this.updateCalculation();
  }

  setupEventListeners() {
    // スライダーイベント
    const sliders = ['width', 'height', 'fps', 'duration', 'bits'];
    sliders.forEach(slider => {
      const element = document.getElementById(`${slider}-slider`);
      const valueElement = document.getElementById(`${slider}-value`);
      
      element.addEventListener('input', (e) => {
        valueElement.textContent = e.target.value;
        this.updateCanvasSize();
        this.updateCalculation();
      });
    });

    // カラーモードボタン
    document.querySelectorAll('.btn-color').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentColorMode = e.target.dataset.mode;
        document.querySelectorAll('.btn-color').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const channelCount = this.currentColorMode === 'color' ? '3チャンネル' : '1チャンネル';
        document.getElementById('channel-count').textContent = channelCount;
        
        this.updateCalculation();
      });
    });

    // アニメーションボタン
    document.querySelectorAll('.btn-animation').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentAnimation = e.target.dataset.animation;
        document.querySelectorAll('.btn-animation').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.resetAnimation();
      });
    });

    // 単位ボタン
    document.querySelectorAll('.btn-unit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentUnit = e.target.dataset.unit;
        document.querySelectorAll('.btn-unit').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.updateCalculation();
      });
    });

    // 制御ボタン
    document.getElementById('play-btn').addEventListener('click', () => this.play());
    document.getElementById('pause-btn').addEventListener('click', () => this.pause());
    document.getElementById('reset-btn').addEventListener('click', () => this.resetAllParameters());
  }

  updateCanvasSize() {
    const width = parseInt(document.getElementById('width-slider').value);
    const height = parseInt(document.getElementById('height-slider').value);
    this.canvas.width = width;
    this.canvas.height = height;
  }

  play() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.lastFrameTime = performance.now();
      this.animationStartTime = this.lastFrameTime;
      this.frameCount = 0;
      this.animate();
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  resetAnimation() {
    this.pause();
    this.frameCount = 0;
    this.animationStartTime = 0;
    this.drawFrame();
  }

  resetAllParameters() {
    // アニメーションを停止
    this.pause();
    this.frameCount = 0;
    this.animationStartTime = 0;

    // スライダーを初期値に戻す
    const sliders = ['width', 'height', 'fps', 'duration', 'bits'];
    sliders.forEach(slider => {
      const element = document.getElementById(`${slider}-slider`);
      const valueElement = document.getElementById(`${slider}-value`);
      const defaultValue = this.DEFAULT_VALUES[slider];
      
      element.value = defaultValue;
      valueElement.textContent = defaultValue;
    });

    // カラーモードを初期値に戻す
    this.currentColorMode = this.DEFAULT_VALUES.colorMode;
    document.querySelectorAll('.btn-color').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === this.DEFAULT_VALUES.colorMode);
    });
    const channelCount = this.currentColorMode === 'color' ? '3チャンネル' : '1チャンネル';
    document.getElementById('channel-count').textContent = channelCount;

    // アニメーション種類を初期値に戻す
    this.currentAnimation = this.DEFAULT_VALUES.animation;
    document.querySelectorAll('.btn-animation').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.animation === this.DEFAULT_VALUES.animation);
    });

    // 単位を初期値に戻す
    this.currentUnit = 'byte';
    document.querySelectorAll('.btn-unit').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.unit === 'byte');
    });

    // 画面を更新
    this.updateCanvasSize();
    this.updateCalculation();
    this.drawFrame();
  }

  animate() {
    if (!this.isPlaying) return;

    const currentTime = performance.now();
    const fps = parseInt(document.getElementById('fps-slider').value);
    const duration = parseInt(document.getElementById('duration-slider').value);
    const frameInterval = 1000 / fps;
    
    // 動画時間をチェック
    const elapsedTime = (currentTime - this.animationStartTime) / 1000;
    if (elapsedTime >= duration) {
      this.pause();
      return;
    }

    if (currentTime - this.lastFrameTime >= frameInterval) {
      this.drawFrame();
      this.frameCount++;
      this.lastFrameTime = currentTime;
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  drawFrame() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // アニメーションに応じて背景色を変更
    const backgroundColor = this.getBackgroundColor();
    this.canvas.parentElement.style.backgroundColor = backgroundColor;
    
    // 背景をクリア
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, width, height);

    // 量子化レベルを計算
    const bits = parseInt(document.getElementById('bits-slider').value);
    const levels = Math.pow(2, bits);

    switch (this.currentAnimation) {
      case 'bouncing':
        this.drawBouncingAnimation(width, height, levels);
        break;
      case 'spiral':
        this.drawSpiralAnimation(width, height, levels);
        break;
      case 'waves':
        this.drawWavesAnimation(width, height, levels);
        break;
      case 'particles':
        this.drawParticlesAnimation(width, height, levels);
        break;
    }
  }

  getBackgroundColor() {
    switch (this.currentAnimation) {
      case 'bouncing':
        return '#2c3e50'; // ダークブルー
      case 'spiral':
        return '#1a1a1a'; // ほぼ黒
      case 'waves':
        return '#34495e'; // ダークグレー
      case 'particles':
        return '#0f0f0f'; // 濃い黒
      default:
        return '#000000';
    }
  }

  drawBouncingAnimation(width, height, levels) {
    const time = this.frameCount * 0.1;
    
    // ボールの位置計算（物理的な跳ね返り）
    const gravity = 0.3;
    const bounce = 0.8;
    const ballSize = Math.min(width, height) / 10;
    
    let x = (Math.sin(time * 0.5) * 0.4 + 0.5) * (width - ballSize * 2) + ballSize;
    let y = Math.abs(Math.sin(time * 2)) * (height - ballSize * 2) + ballSize;
    
    // トレイル効果
    this.ctx.globalAlpha = 0.1;
    this.ctx.fillStyle = this.getBackgroundColor();
    this.ctx.fillRect(0, 0, width, height);
    this.ctx.globalAlpha = 1;
    
    let color;
    if (this.currentColorMode === 'color') {
      const r = this.quantize(255 - (y / height) * 255, levels);
      const g = this.quantize(128 + Math.sin(time) * 127, levels);
      const b = this.quantize((x / width) * 255, levels);
      color = `rgb(${r}, ${g}, ${b})`;
    } else {
      const gray = this.quantize(255 - (y / height) * 200 + 55, levels);
      color = `rgb(${gray}, ${gray}, ${gray})`;
    }

    this.ctx.beginPath();
    this.ctx.arc(x, y, ballSize, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    
    // 影効果
    this.ctx.globalAlpha = 0.3;
    this.ctx.beginPath();
    this.ctx.arc(x, height - 5, ballSize * (1 - y / height), 0, Math.PI * 2);
    this.ctx.fillStyle = '#000';
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  }

  drawSpiralAnimation(width, height, levels) {
    const time = this.frameCount * 0.05;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 3;
    
    // スパイラルを複数描画
    for (let i = 0; i < 5; i++) {
      const offset = i * Math.PI * 0.4;
      const radius = (Math.sin(time + offset) * 0.5 + 0.5) * maxRadius;
      const angle = time * 3 + offset;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const size = Math.min(width, height) / 25;
      
      let color;
      if (this.currentColorMode === 'color') {
        const r = this.quantize(128 + Math.sin(angle + i) * 127, levels);
        const g = this.quantize(128 + Math.cos(angle + i) * 127, levels);
        const b = this.quantize(128 + Math.sin(time + i) * 127, levels);
        color = `rgb(${r}, ${g}, ${b})`;
      } else {
        const gray = this.quantize(100 + (radius / maxRadius) * 155, levels);
        color = `rgb(${gray}, ${gray}, ${gray})`;
      }
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
    }
  }

  drawWavesAnimation(width, height, levels) {
    const time = this.frameCount * 0.08;
    const waveHeight = height / 4;
    const waveFreq = 4;
    
    // 複数の波を描画
    for (let wave = 0; wave < 3; wave++) {
      const waveOffset = wave * Math.PI * 0.6;
      const amplitude = waveHeight * (0.5 + wave * 0.3);
      
      this.ctx.beginPath();
      for (let x = 0; x <= width; x += 2) {
        const y = height / 2 + 
                 Math.sin((x / width) * Math.PI * waveFreq + time + waveOffset) * amplitude +
                 Math.sin((x / width) * Math.PI * waveFreq * 2 + time * 1.5 + waveOffset) * amplitude * 0.3;
        
        if (x === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      
      let color;
      if (this.currentColorMode === 'color') {
        const r = this.quantize(100 + wave * 50, levels);
        const g = this.quantize(150 + Math.sin(time + waveOffset) * 100, levels);
        const b = this.quantize(200 + Math.cos(time + waveOffset) * 55, levels);
        color = `rgb(${r}, ${g}, ${b})`;
      } else {
        const gray = this.quantize(120 + wave * 40 + Math.sin(time) * 60, levels);
        color = `rgb(${gray}, ${gray}, ${gray})`;
      }
      
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 3 + wave;
      this.ctx.stroke();
    }
  }

  drawParticlesAnimation(width, height, levels) {
    const time = this.frameCount * 0.06;
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + time;
      const radius = (Math.sin(time * 0.8 + i) * 0.5 + 0.5) * Math.min(width, height) * 0.4;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;
      const size = (Math.sin(time * 2 + i) * 0.5 + 0.5) * Math.min(width, height) / 20 + 2;
      
      // パーティクルのトレイル
      const trailLength = 8;
      for (let t = 0; t < trailLength; t++) {
        const trailAngle = angle - t * 0.1;
        const trailX = width / 2 + Math.cos(trailAngle) * radius;
        const trailY = height / 2 + Math.sin(trailAngle) * radius;
        const trailSize = size * (1 - t / trailLength);
        
        this.ctx.globalAlpha = (1 - t / trailLength) * 0.6;
        
        let color;
        if (this.currentColorMode === 'color') {
          const r = this.quantize(255 - t * 20, levels);
          const g = this.quantize(128 + Math.sin(angle + i) * 127, levels);
          const b = this.quantize(100 + t * 15, levels);
          color = `rgb(${r}, ${g}, ${b})`;
        } else {
          const gray = this.quantize(200 - t * 15, levels);
          color = `rgb(${gray}, ${gray}, ${gray})`;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
      }
      
      this.ctx.globalAlpha = 1;
    }
  }

  quantize(value, levels) {
    const step = 256 / (levels - 1);
    const quantized = Math.round(Math.round(value / step) * step);
    return Math.max(0, Math.min(255, quantized));
  }

  updateCalculation() {
    const width = BigInt(document.getElementById('width-slider').value);
    const height = BigInt(document.getElementById('height-slider').value);
    const fps = BigInt(document.getElementById('fps-slider').value);
    const duration = BigInt(document.getElementById('duration-slider').value);
    const bits = BigInt(document.getElementById('bits-slider').value);
    const channels = this.currentColorMode === 'color' ? 3n : 1n;

    // 1フレームあたりのデータ量（bit単位）
    const framePixels = width * height;
    const frameBits = framePixels * bits * channels;
    
    // 総データ量（bit単位）
    const totalFrames = fps * duration;
    const totalBits = frameBits * totalFrames;

    const formatValue = (bits, unit) => {
      let value = bits;
      let formula = '';
      
      switch (unit) {
        case 'bit':
          formula = '';
          break;
        case 'byte':
          value = bits / 8n;
          formula = ' ÷ 8';
          break;
        case 'kb':
          value = bits / 8n / 1000n;
          formula = ' ÷ 8 ÷ 1000';
          break;
        case 'mb':
          value = bits / 8n / 1000n / 1000n;
          formula = ' ÷ 8 ÷ 1000 ÷ 1000';
          break;
        case 'gb':
          value = bits / 8n / 1000n / 1000n / 1000n;
          formula = ' ÷ 8 ÷ 1000 ÷ 1000 ÷ 1000';
          break;
      }
      
      const unitNames = {
        'bit': 'bit',
        'byte': 'Byte',
        'kb': 'KB',
        'mb': 'MB',
        'gb': 'GB'
      };
      
      if (value === 0n) return { value: '0', unit: unitNames[unit], formula };
      
      const displayValue = Number(value);
      return { 
        value: displayValue >= 1000 ? displayValue.toLocaleString() : displayValue.toFixed(2),
        unit: unitNames[unit],
        formula
      };
    };

    const channelText = this.currentColorMode === 'color' ? '3チャンネル' : '1チャンネル';
    const frameResult = formatValue(frameBits, this.currentUnit);
    const totalResult = formatValue(totalBits, this.currentUnit);
    
    document.getElementById('calculation-result').innerHTML = `
      <h3>1フレームあたりのデータ量</h3>
      <p>${width.toLocaleString()}px × ${height.toLocaleString()}px × ${bits.toLocaleString()}bit × ${channelText}${frameResult.formula} = <span>${frameResult.value} ${frameResult.unit}</span></p>
      
      <h3>総データ量</h3>
      <p>${frameResult.value} ${frameResult.unit} × ${fps.toLocaleString()}fps × ${duration.toLocaleString()}秒 = <span>${totalResult.value} ${totalResult.unit}</span></p>
    `;

    // データ爆発警告（DVDの容量4.7GBを超えた場合）
    const totalBytes = totalBits / 8n;
    const dvdCapacityBytes = 4_700_000_000n; // DVD容量約4.7GB
    const alertBox = document.getElementById('data-explosion-alert');
    alertBox.style.display = totalBytes > dvdCapacityBytes ? 'block' : 'none';
  }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  new VideoSimulator();
});
