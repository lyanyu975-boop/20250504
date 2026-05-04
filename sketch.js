let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

function preload() {
  // 檢查 ml5 是否存在，避免 ReferenceError
  if (typeof ml5 !== 'undefined') {
    faceMesh = ml5.faceMesh(options);
  } else {
    console.error("錯誤：ml5 未定義。請確保 HTML 檔案中已引入 ml5.js 程式庫。");
    alert("ml5.js 載入失敗，請檢查網路連線或 index.html 設定。");
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 建立攝影機擷取
  video = createCapture(VIDEO, (stream) => {
    console.log("攝影機已啟動");
  });
  video.size(640, 480);
  video.hide();

  // 開始偵測臉部
  if (faceMesh) {
    faceMesh.detectStart(video, gotFaces);
  }
}

function draw() {
  background(220);

  // 1. 顯示文字：位於左上方但水平置中
  fill(0);
  noStroke();
  textSize(24);
  textAlign(CENTER, TOP);
  text("414730266留妍瑜", width / 2, 20);

  // 2. 計算影像顯示大小 (全螢幕寬高的 50%)
  let displayW = width * 0.5;
  let displayH = height * 0.5;
  let x = (width - displayW) / 2;
  let y = (height - displayH) / 2;

  // 3. 處理鏡像並繪製影像與臉譜
  push();
  // 移動到顯示區域的右側並反轉 X 軸，以修正左右顛倒問題
  translate(x + displayW, y);
  scale(-1, 1);

  // 繪製攝影機影像
  image(video, 0, 0, displayW, displayH);

  // 繪製臉譜特徵點 - 嘴唇與眼睛 (黑色粗線條)
  if (faces.length > 0) {
    let face = faces[0];
    stroke(0); // 黑色線條
    strokeWeight(15); // 線條粗細 15
    noFill();

    // 定義點位編號陣列
    let lipsOuter = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
    let lipsInner = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
    let lEyeTop = [243, 190, 56, 28, 27, 29, 30, 247, 130, 25, 110, 24, 23, 22, 26, 112];
    let lEyeBottom = [133, 173, 157, 158, 159, 160, 161, 246, 33, 7, 163, 144, 145, 153, 154, 155];
    let rEyeTop = [359, 467, 260, 259, 257, 258, 286, 414, 463, 341, 256, 252, 253, 254, 339, 255];
    let rEyeBottom = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249];

    // 繪製各個部位
    drawPath(face, lipsOuter, displayW, displayH);
    drawPath(face, lipsInner, displayW, displayH);
    drawPath(face, lEyeTop, displayW, displayH);
    drawPath(face, lEyeBottom, displayW, displayH);
    drawPath(face, rEyeTop, displayW, displayH);
    drawPath(face, rEyeBottom, displayW, displayH);
  }
  pop();
}

// 輔助函式：根據點位陣列繪製串接線條
function drawPath(face, indices, dw, dh) {
  let vW = video.width > 0 ? video.width : 640;
  let vH = video.height > 0 ? video.height : 480;
  for (let i = 0; i < indices.length; i++) {
    let p1 = face.keypoints[indices[i]];
    let p2 = face.keypoints[indices[(i + 1) % indices.length]]; // 串接到下一個點，最後一個點接回第一個點
    if (p1 && p2) {
      let x1 = map(p1.x, 0, vW, 0, dw);
      let y1 = map(p1.y, 0, vH, 0, dh);
      let x2 = map(p2.x, 0, vW, 0, dw);
      let y2 = map(p2.y, 0, vH, 0, dh);
      line(x1, y1, x2, y2);
    }
  }
}

function gotFaces(results) {
  faces = results;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
