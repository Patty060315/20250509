// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY;
let circleRadius = 50; // 半徑為 50，直徑為 100
let prevCircleX, prevCircleY; // 儲存圓的前一個位置
let isDragging = false; // 判斷是否正在拖動圓
let thumbPrevX, thumbPrevY; // 儲存大拇指的前一個位置
let isThumbDragging = false; // 判斷是否正在用大拇指拖動圓

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480); // 產生一個 640x480 的畫布
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 初始化圓的位置在畫布中央
  circleX = width / 2;
  circleY = height / 2;
  prevCircleX = circleX;
  prevCircleY = circleY;
  thumbPrevX = null;
  thumbPrevY = null;

  // 開始偵測手部
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  // 如果正在拖動圓，繪製圓心的紅色軌跡
  if (isDragging) {
    stroke(255, 0, 0); // 紅色線條
    strokeWeight(2);
    line(prevCircleX, prevCircleY, circleX, circleY);
  }

  // 如果正在用大拇指拖動圓，繪製大拇指的綠色軌跡
  if (isThumbDragging && thumbPrevX !== null && thumbPrevY !== null) {
    stroke(0, 255, 0); // 綠色線條
    strokeWeight(2);
    line(thumbPrevX, thumbPrevY, circleX, circleY);
  }

  // 繪製圓
  fill(0, 0, 255, 150); // 半透明藍色
  noStroke();
  circle(circleX, circleY, circleRadius * 2);

  // 確保至少有一隻手被偵測到
  if (hands.length > 0) {
    let isTouching = false; // 判斷是否有手指碰觸圓
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 繪製手部關鍵點
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 根據左右手設定顏色
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }

        // 檢查食指（keypoints[8]）與大拇指（keypoints[4]）是否同時碰觸圓的邊緣
        let indexFinger = hand.keypoints[8];
        let thumb = hand.keypoints[4];
        let dIndex = dist(indexFinger.x, indexFinger.y, circleX, circleY);
        let dThumb = dist(thumb.x, thumb.y, circleX, circleY);

        if (dIndex < circleRadius && dThumb < circleRadius) {
          // 如果食指與大拇指同時碰觸到圓，讓圓跟隨食指與大拇指的中點移動
          prevCircleX = circleX;
          prevCircleY = circleY;
          circleX = (indexFinger.x + thumb.x) / 2;
          circleY = (indexFinger.y + thumb.y) / 2;
          isTouching = true;
          isDragging = true;
        }

        // 檢查大拇指（keypoints[4]）是否碰觸圓
        if (dThumb < circleRadius) {
          // 如果大拇指碰觸到圓，讓圓跟隨大拇指移動
          thumbPrevX = circleX;
          thumbPrevY = circleY;
          circleX = thumb.x;
          circleY = thumb.y;
          isThumbDragging = true;
        }
      }
    }

    // 如果沒有手指碰觸圓，停止繪製軌跡
    if (!isTouching) {
      isDragging = false;
    }

    // 如果沒有大拇指碰觸圓，停止繪製大拇指的軌跡
    if (!isThumbDragging) {
      thumbPrevX = null;
      thumbPrevY = null;
    }
  }
}
