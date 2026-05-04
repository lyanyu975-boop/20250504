let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

function preload() {
  // 載入 ml5 faceMesh 模型
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 建立攝影機擷取
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide(); // 隱藏預設的 HTML 影片元件

  // 開始偵測臉部
  faceMesh.detectStart(video, gotFaces);
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

  // 繪製臉譜特徵點
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    for (let j = 0; j < face.keypoints.length; j++) {
      let keypoint = face.keypoints[j];
      fill(0, 255, 0);
      let kx = map(keypoint.x, 0, video.width, 0, displayW);
      let ky = map(keypoint.y, 0, video.height, 0, displayH);
      circle(kx, ky, 3);
    }
  }
  pop();
}

function gotFaces(results) {
  faces = results;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
