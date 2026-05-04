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
  
  // 初始化攝影機擷取，增加 callback 確認成功
  video = createCapture(VIDEO, (stream) => {
    console.log("攝影機串流成功啟動");
  });
  video.size(windowWidth * 0.5, windowHeight * 0.5);
  video.hide();

  // 建議：可以在這裡增加錯誤處理，提示使用者檢查攝影機

  // 初始化 facemesh 模型
  faceMesh = ml5.facemesh(video, () => console.log("模型準備就緒！"));

  // 當偵測到臉部時，更新 predictions 變數
  faceMesh.on("predict", results => {
    predictions = results;
  });
}

function draw() {
  // 畫布顏色設定為 e7c6ff
  background('#e7c6ff');

  const displayWidth = width * 0.5;
  const displayHeight = height * 0.5;

  push();
  // 將座標中心移至螢幕中央
  translate(width / 2, height / 2);
  // 左右顛倒 (鏡像效果)
  scale(-1, 1);
  
  // 顯示擷取影像 (置中於當前座標系)
  image(video, -displayWidth / 2, -displayHeight / 2, displayWidth, displayHeight);

  // 如果偵測到臉部關鍵點
  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;
    
    // 設定一次繪圖樣式即可，不需在 drawPath 內重複設定
    stroke(255, 0, 0); 
    strokeWeight(1);   
    noFill();
    
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
  for (let i = 0; i < indices.length - 1; i++) {
    const p1 = points[indices[i]];
    const p2 = points[indices[i + 1]];
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