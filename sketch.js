let faceMesh;
let video;
let predictions = [];
let webcamError = false; // 新增變數來追蹤攝影機錯誤
let stars = []; // 儲存星星座標

// 定義指定的編號路徑
const path1 = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
const path2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];

// 右眼相關編號
const rightEyeOuter = [130, 247, 30, 29, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25];
const rightEyeInner = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];

// 左眼相關編號
const leftEyeOuter = [463, 341, 256, 252, 253, 254, 339, 255, 359, 467, 260, 259, 257, 258, 286, 414];
const leftEyeInner = [466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249, 263];

// 臉部最外層輪廓 (Silhouette) 編號
const faceSilhouette = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 
  400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 
  54, 103, 67, 109
];

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化攝影機擷取，增加 callback 確認成功
  video = createCapture({
    video: true,
    audio: false
  }, (stream) => { 
    console.log("攝影機串流成功啟動");
    // 攝影機成功啟動後，再初始化 facemesh 模型
    faceMesh = ml5.facemesh(video, () => {
      console.log("模型準備就緒！");
      // 當偵測到臉部時，更新 predictions 變數
      faceMesh.on("predict", results => {
        predictions = results;
      });
    });
  });
  // 延遲一秒檢查攝影機是否成功啟動，如果 video.elt.srcObject 為 null，則表示失敗
  setTimeout(() => {
    if (!video || !video.elt || !video.elt.srcObject) {
      console.error("攝影機未找到或無法啟動。請檢查攝影機權限和連接。");
      webcamError = true;
    }
  }, 1000); // 給予攝影機啟動時間
  video.size(windowWidth * 0.5, windowHeight * 0.5);
  video.hide();

  // 初始化星星
  for (let i = 0; i < 200; i++) {
    stars.push({ x: random(width), y: random(height), size: random(1, 3) });
  }
}

function draw() {
  // 畫布顏色設定為 e7c6ff
  background('#e7c6ff');

  const displayWidth = width * 0.5;
  const displayHeight = height * 0.5;

  // 繪製背景星星
  fill(255);
  noStroke();
  for (let s of stars) {
    ellipse(s.x, s.y, s.size);
  }

  push();
  translate(width / 2, height / 2);
  scale(-1, 1);
  
  if (webcamError) {
    // 如果攝影機錯誤，顯示錯誤訊息
    fill(0);
    rect(-width / 2, -height / 2, width, height); // 覆蓋整個畫布
    fill(255, 0, 0); // 紅色文字
    textAlign(CENTER, CENTER);
    textSize(24);
    text("錯誤：未找到攝影機或無法啟動。\n請檢查攝影機權限和連接。", 0, 0);
  } else if (faceMesh && predictions.length > 0) {
    // 攝影機正常且偵測到臉部
    // 1. 繪製擷取影像
    image(video, -displayWidth / 2, -displayHeight / 2, displayWidth, displayHeight);

    const keypoints = predictions[0].scaledMesh;
    const offsetX = -displayWidth / 2;
    const offsetY = -displayHeight / 2;
    
    // 2. 繪製臉外黑色遮罩 (挖空臉部)
    fill(0);
    noStroke();
    beginShape();
    // 外部大框 (覆蓋整個畫布)
    vertex(-width, -height);
    vertex(width, -height);
    vertex(width, height);
    vertex(-width, height);
    // 內部挖空 (臉部輪廓)
    beginContour();
    for (let i = 0; i < faceSilhouette.length; i++) {
      const p = keypoints[faceSilhouette[i]];
      vertex(p[0] + offsetX, p[1] + offsetY);
    }
    endContour();
    endShape(CLOSE);

    // 3. 設定霓虹發光效果 (僅對後續線條有效)
    drawingContext.shadowBlur = 25; // 增加光暈強度
    drawingContext.shadowColor = color(255, 0, 0);

    // 4. 繪製紅色路徑與眼睛
    stroke(255, 0, 0); 
    strokeWeight(1);   
    noFill();
    
    // 指定路徑 1 & 2
    drawPath(keypoints, path1, false, offsetX, offsetY);
    drawPath(keypoints, path2, false, offsetX, offsetY);
    
    // 繪製右眼與左眼
    drawPath(keypoints, rightEyeOuter, true, offsetX, offsetY);
    drawPath(keypoints, rightEyeInner, true, offsetX, offsetY);
    drawPath(keypoints, leftEyeOuter, true, offsetX, offsetY);
    drawPath(keypoints, leftEyeInner, true, offsetX, offsetY);

    // 繪製臉部外輪廓線 (增加霓虹感)
    strokeWeight(2); // 輪廓線稍微粗一點
    drawPath(keypoints, faceSilhouette, true, offsetX, offsetY);
    strokeWeight(1);
    
    // 重設發光效果，避免影響其他繪圖
    drawingContext.shadowBlur = 0;
  } else {
    // 若攝影機正常但沒偵測到臉，則全畫面漆黑 (除了星星)
    fill(0);
    rect(-width / 2, -height / 2, width, height);
    // 提示模型正在加載或等待臉部
    if (faceMesh) { // 如果 facemesh 模型已經初始化
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(20);
        text("載入臉部辨識模型中或等待臉部...", 0, 0);
    } else { // 如果 facemesh 模型還未初始化 (可能在等待攝影機)
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(20);
        text("啟動攝影機中...", 0, 0);
    }
  }
  pop();
}

function drawPath(points, indices, isClosed, offsetX, offsetY) {
  for (let i = 0; i < indices.length - 1; i++) {
    let idx1 = indices[i];
    let idx2 = indices[i+1];
    const p1 = points[idx1];
    const p2 = points[idx2];
    line(p1[0] + offsetX, p1[1] + offsetY, p2[0] + offsetX, p2[1] + offsetY);
  }

  // 如果需要閉合 (成一圈)
  if (isClosed) {
    let pFirst = points[indices[0]];
    let pLast = points[indices[indices.length - 1]];
    line(pLast[0] + offsetX, pLast[1] + offsetY, pFirst[0] + offsetX, pFirst[1] + offsetY);
  }
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
  // 同步更新攝影機預覽大小
  if (video) {
    video.size(width * 0.5, height * 0.5);
  }
}