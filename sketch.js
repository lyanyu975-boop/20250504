let faceMesh;
let video;
let predictions = [];

// 定義指定的編號路徑
const path1 = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
const path2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];

// 右眼相關編號 (包含 247 與 246 的完整迴圈)
const rightEyeOuter = [130, 247, 30, 29, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25];
const rightEyeInner = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化攝影機擷取，設定為全螢幕寬高的 50%
  video = createCapture(VIDEO);
  video.size(windowWidth * 0.5, windowHeight * 0.5);
  video.hide();

  // 初始化 faceMesh 模型 (注意 M 大寫)
  faceMesh = ml5.faceMesh({ maxFaces: 1, refineLandmarks: true }, () => {
    console.log("模型準備就緒！");
    // 確保模型準備好且影片已啟動後再開始偵測
    faceMesh.detectStart(video, results => {
      predictions = results;
    });
  });
}

function draw() {
  // 畫布顏色設定為 e7c6ff
  background('#e7c6ff');

  let displayWidth = width * 0.5;
  let displayHeight = height * 0.5;

  push();
  // 將座標中心移至螢幕中央
  translate(width / 2, height / 2);
  // 左右顛倒 (鏡像效果)
  scale(-1, 1);
  
  // 顯示擷取影像 (置中於當前座標系)
  image(video, -displayWidth / 2, -displayHeight / 2, displayWidth, displayHeight);

  // 如果偵測到臉部關鍵點
  if (predictions.length > 0) {
    let keypoints = predictions[0].keypoints;
    
    // 繪製路徑 1 與 路徑 2 (紅色，粗細 1)
    drawPath(keypoints, path1, false, -displayWidth / 2, -displayHeight / 2);
    drawPath(keypoints, path2, false, -displayWidth / 2, -displayHeight / 2);
    
    // 繪製右眼外圈 (編號 247)
    drawPath(keypoints, rightEyeOuter, true, -displayWidth / 2, -displayHeight / 2);
    
    // 繪製右眼內圈 (編號 246)
    drawPath(keypoints, rightEyeInner, true, -displayWidth / 2, -displayHeight / 2);
  }
  pop();
}

// 使用 line 指令串接關鍵點的函式
function drawPath(points, indices, isClosed, offsetX, offsetY) {
  stroke(255, 0, 0); // 線條紅色
  strokeWeight(1);   // 粗細為 1
  noFill();

  for (let i = 0; i < indices.length - 1; i++) {
    let p1 = points[indices[i]];
    let p2 = points[indices[i + 1]];
    line(p1.x + offsetX, p1.y + offsetY, p2.x + offsetX, p2.y + offsetY);
  }

  // 如果需要閉合 (成一圈)
  if (isClosed) {
    let pFirst = points[indices[0]];
    let pLast = points[indices[indices.length - 1]];
    line(pLast.x + offsetX, pLast.y + offsetY, pFirst.x + offsetX, pFirst.y + offsetY);
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