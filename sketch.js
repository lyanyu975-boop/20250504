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

  // 繪製臉譜特徵點 (確保影像比例對齊)
  if (faces.length > 0) {
    let face = faces[0];
    fill(0, 255, 0);
    noStroke();
    for (let i = 0; i < face.keypoints.length; i++) {
      let kp = face.keypoints[i];
      let kx = map(kp.x, 0, video.width, 0, displayW);
      let ky = map(kp.y, 0, video.height, 0, displayH);
      circle(kx, ky, 2);
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
