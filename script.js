class VideoSimulator {
  constructor() {
    // 初期値定数
    this.DEFAULT_VALUES = {
      width: 320,
      height: 240,
      fps: 5,
      duration: 5,
      bits: 8,
      colorMode: 'color',
      animation: 'circle'
    };

    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.isPlaying = false;
    this.currentAnimation = this.DEFAULT_VALUES.animation;
    this.currentColorMode = this.DEFAULT_VALUES.colorMode;
    this.animationId = null;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.fpsCounter = 0;
    this.lastFpsTime = 0;
    
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
      this.lastFpsTime = this.lastFrameTime;
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
    this.drawFrame();
  }

  resetAllParameters() {
    // アニメーションを停止
    this.pause();
    this.frameCount = 0;

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

    // 画面を更新
    this.updateCanvasSize();
    this.updateCalculation();
    this.drawFrame();
  }

  animate() {
    if (!this.isPlaying) return;

    const currentTime = performance.now();
    const fps = parseInt(document.getElementById('fps-slider').value);
    const frameInterval = 1000 / fps;

    if (currentTime - this.lastFrameTime >= frameInterval) {
      this.drawFrame();
      this.frameCount++;
      this.lastFrameTime = currentTime;

      // FPS計算
      if (currentTime - this.lastFpsTime >= 1000) {
        this.fpsCounter = Math.round(1000 / (currentTime - this.lastFpsTime) * (this.frameCount));
        document.getElementById('actual-fps').textContent = this.fpsCounter;
        this.lastFpsTime = currentTime;
        this.frameCount = 0;
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  drawFrame() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // 背景をクリア
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, width, height);

    // 量子化レベルを計算
    const bits = parseInt(document.getElementById('bits-slider').value);
    const levels = Math.pow(2, bits);

    switch (this.currentAnimation) {
      case 'circle':
        this.drawCircleAnimation(width, height, levels);
        break;
      case 'color':
        this.drawColorAnimation(width, height, levels);
        break;
      case 'multiple':
        this.drawMultipleAnimation(width, height, levels);
        break;
    }
  }

  drawCircleAnimation(width, height, levels) {
    const time = this.frameCount * 0.1;
    const centerX = width / 2 + Math.sin(time) * width / 4;
    const centerY = height / 2 + Math.cos(time) * height / 4;
    const radius = Math.min(width, height) / 8;

    let color;
    if (this.currentColorMode === 'color') {
      const r = this.quantize(128 + Math.sin(time * 2) * 127, levels);
      const g = this.quantize(128 + Math.sin(time * 2 + 2) * 127, levels);
      const b = this.quantize(128 + Math.sin(time * 2 + 4) * 127, levels);
      color = `rgb(${r}, ${g}, ${b})`;
    } else {
      const gray = this.quantize(128 + Math.sin(time * 2) * 127, levels);
      color = `rgb(${gray}, ${gray}, ${gray})`;
    }

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  drawColorAnimation(width, height, levels) {
    const time = this.frameCount * 0.05;
    
    if (this.currentColorMode === 'color') {
      const r = this.quantize(128 + Math.sin(time) * 127, levels);
      const g = this.quantize(128 + Math.sin(time + 2) * 127, levels);
      const b = this.quantize(128 + Math.sin(time + 4) * 127, levels);
      this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    } else {
      const gray = this.quantize(128 + Math.sin(time) * 127, levels);
      this.ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
    }
    
    this.ctx.fillRect(0, 0, width, height);
  }

  drawMultipleAnimation(width, height, levels) {
    const time = this.frameCount * 0.1;
    const objectCount = 3;

    for (let i = 0; i < objectCount; i++) {
      const angle = (time + i * 2) * Math.PI / 3;
      const x = width / 2 + Math.sin(angle) * width / 4;
      const y = height / 2 + Math.cos(angle) * height / 4;
      const size = Math.min(width, height) / 12;

      let color;
      if (this.currentColorMode === 'color') {
        const r = this.quantize(128 + Math.sin(angle + i) * 127, levels);
        const g = this.quantize(128 + Math.sin(angle + i + 2) * 127, levels);
        const b = this.quantize(128 + Math.sin(angle + i + 4) * 127, levels);
        color = `rgb(${r}, ${g}, ${b})`;
      } else {
        const gray = this.quantize(128 + Math.sin(angle + i) * 127, levels);
        color = `rgb(${gray}, ${gray}, ${gray})`;
      }

      this.ctx.fillStyle = color;
      this.ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }
  }

  quantize(value, levels) {
    const step = 256 / (levels - 1);
    return Math.round(Math.round(value / step) * step);
  }

  updateCalculation() {
    const width = BigInt(document.getElementById('width-slider').value);
    const height = BigInt(document.getElementById('height-slider').value);
    const fps = BigInt(document.getElementById('fps-slider').value);
    const duration = BigInt(document.getElementById('duration-slider').value);
    const bits = BigInt(document.getElementById('bits-slider').value);
    const channels = this.currentColorMode === 'color' ? 3n : 1n;

    // 1フレームあたりのデータ量
    const framePixels = width * height;
    const frameBits = framePixels * bits * channels;
    const frameBytes = frameBits / 8n;

    // 総データ量
    const totalFrames = fps * duration;
    const totalBits = frameBits * totalFrames;
    const totalBytes = totalBits / 8n;

    const formatBytes = (bytes) => {
      if (bytes === 0n) return '0 Bytes';
      const k = 1000n;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      let i = 0;
      let tempBytes = bytes;
      while (tempBytes >= k && i < sizes.length - 1) {
        tempBytes /= k;
        i++;
      }
      const displayValue = Number(bytes) / Math.pow(Number(k), i);
      return `${displayValue.toFixed(2)} ${sizes[i]}`;
    };

    const channelText = this.currentColorMode === 'color' ? '3チャンネル' : '1チャンネル';
    
    document.getElementById('calculation-result').innerHTML = `
      <h3>1フレームあたりのデータ量</h3>
      <p>${width.toLocaleString()}px × ${height.toLocaleString()}px × ${bits.toLocaleString()}bit × ${channelText}</p>
      <p>= <span>${formatBytes(frameBytes)}</span></p>
      
      <h3>総データ量</h3>
      <p>${formatBytes(frameBytes)} × ${fps.toLocaleString()}fps × ${duration.toLocaleString()}秒</p>
      <p>= <span>${formatBytes(totalBytes)}</span></p>
    `;

    document.getElementById('frame-info-content').innerHTML = `
      <p>総フレーム数: ${totalFrames.toLocaleString()}フレーム</p>
      <p>総画素数: ${(framePixels * totalFrames).toLocaleString()}画素</p>
      <p>1秒あたりのデータ量: ${formatBytes(frameBytes * fps)}</p>
    `;

    // データ爆発警告
    const alertBox = document.getElementById('data-explosion-alert');
    alertBox.style.display = totalBytes > 100_000_000n ? 'block' : 'none';
  }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  new VideoSimulator();
});
