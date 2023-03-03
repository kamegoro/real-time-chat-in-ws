"use strict";

const g_elementCheckboxCamera = document.getElementById("checkbox_camera");
const g_elementCheckboxMicrophone = document.getElementById("checkbox_microphone");
const g_elementTextareaOfferSideOfferSDP = document.getElementById(
  "textarea_offerside_offsersdp"
);
const g_elementTextareaAnswerSideOfferSDP = document.getElementById(
  "textarea_answerside_offsersdp"
);
const g_elementTextareaOfferSideAnswerSDP = document.getElementById(
  "textarea_offerside_answersdp"
);
const g_elementTextareaAnswerSideAnswerSDP = document.getElementById(
  "textarea_answerside_answersdp"
);
const g_elementVideoLocal = document.getElementById("video_local");

let g_rtcPeerConnection = null;

// カメラとマイクのOn/Offのチェックボックスを押すと呼ばれる関数
const onClickCheckbox_CameraMicrophone = () => {
  console.log("UI Event: Camera/Microphone checkbox clicked.");

  let trackCamera_old = null;
  let trackMicrophone_old = null;
  let bCamera_old = false;
  let bMicrophone_old = false;

  let stream = g_elementVideoLocal.srcObject;

  if (stream) {
    trackCamera_old = stream.g_elementVideoTracks()[0];

    if (trackCamera_old) {
      bCamera_old = true;
    }

    trackMicrophone_old = stream.getAudioTracks()[0];
    if (trackMicrophone_old) {
      bMicrophone_old = true;
    }
  }

  let bCamera_new = false;
  if (g_elementCheckboxCamera.checked) {
    bCamera_new = true;
  }

  let bMicrophone_new = false;
  if (g_elementCheckboxMicrophone.checked) {
    bMicrophone_new = true;
  }

  // 状態変化
  console.log("Camera :  %s => %s", bCamera_old, bCamera_new);
  console.log("Microphone : %s = %s", bMicrophone_old, bMicrophone_new);

  if (bCamera_old === bCamera_new && bMicrophone_old === bMicrophone_new) {
    // チェックボックスの状態の変化なし
    return;
  }

  // 古いメディアストリームのトラックの停止（トラックの停止をせず、HTML要素のstreamの解除だけではカメラは停止しない（カメラ動作LEDは点いたまま））
  if (trackCamera_old) {
    console.log("Call: trackCamera_old.stop()");
    trackCamera_old.stop();
  }

  if (trackMicrophone_old) {
    console.log("Call: trackMicrophone_old.stop()");
    trackMicrophone_old.stop();
  }

  // HTML要素のメディアストリームの解除
  console.log("Call : setStreamToElement( Video_Local, null )");
  setStreamToElement(g_elementVideoLocal, null);

  if (!bCamera_new && !bMicrophone_new) {
    // （チェックボックスの状態の変化があり、かつ、）カメラとマイクを両方Offの場合
    return;
  }

  // （チェックボックスの状態の変化があり、かつ、）カメラとマイクのどちらかもしくはどちらもOnの場合
  // 自分のメディアストリームを取得する。
  console.log(
    "Call : navigator.mediaDevices.getUserMedia( video=%s, audio=%s )",
    bCamera_new,
    bMicrophone_new
  );
  navigator.mediaDevices
    .getUserMedia({ video: bCamera_new, audio: bMicrophone_new })
    .then(stream => {
      // HTML要素へのメディアストリームの設定
      console.log("Call : setStreamToElement( Video_Local, stream )");
      setStreamToElement(g_elementVideoLocal, stream);
    })
    .catch(error => {
      // メディアストリームの取得に失敗⇒古いメディアストリームのまま。チェックボックスの状態を戻す。
      console.error("Error : ", error);
      alert("Could not start Camera.");
      g_elementCheckboxCamera.checked = false;
      g_elementCheckboxMicrophone.checked = false;
      return;
    });
};

// HTML要素へのメディアストリームの設定（もしくは解除。および開始）
// HTML要素は、「ローカルもしくはリモート」の「videoもしくはaudio」。
// メディアストリームは、ローカルメディアストリームもしくはリモートメディアストリーム、もしくはnull。
// メディアストリームには、Videoトラック、Audioトラックの両方もしくは片方のみが含まれる。
// メディアストリームに含まれるトラックの種別、設定するHTML要素種別は、呼び出し側で対処する。
const setStreamToElement = (elementMedia, stream) => {
  // メディアストリームを、メディア用のHTML要素のsrcObjに設定する。
  // - 古くは、elementVideo.src = URL.createObjectURL( stream ); のように書いていたが、URL.createObjectURL()は、廃止された。
  //   現在は、elementVideo.srcObject = stream; のように書く。
  elementMedia.srcObject = stream;

  if (!stream) {
    // メディアストリームの設定解除の場合は、ここで処理終了
    return;
  }

  // 音量
  if ("VIDEO" === elementMedia.tagName) {
    // VIDEO：ボリュームゼロ、ミュート
    elementMedia.volume = 0.0;
    elementMedia.muted = true;
  } else if ("AUDIO" === elementMedia.tagName) {
    // AUDIO：ボリュームあり、ミュートでない
    elementMedia.volume = 1.0;
    elementMedia.muted = false;
  } else {
    console.error("Unexpected : Unknown ElementTagName : ", elementMedia.tagName);
  }
};

const onClickButton_CreateOfferSDP = () => {
  console.log("UI Event: 'Create Offer SDP.' button clicked");

  if (g_rtcPeerConnection) {
    alert("Connection object already exists.");
    return;
  }

  console.log("Call: createPeerConnection()");
  let rtcPeerConnection = createPeerConnection(g_elementVideoLocal.srcObject);
  g_rtcPeerConnection = rtcPeerConnection;

  // OfferSDPの作成
  onClickButton_CreateOfferSDP(rtcPeerConnection);
};
