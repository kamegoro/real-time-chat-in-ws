"use strict";

const g_elementCheckboxCamera = document.getElementById("checkbox_camera");
const g_elementCheckboxMicrophone = document.getElementById("checkbox_microphone");

const g_elementVideoLocal = document.getElementById("video_local");

// カメラとマイクのOn/Offのチェックボックスを押すと呼ばれる関数
const onClickCheckbox_CameraMicrophone = () => {
  console.log("UI Event: Camera/Microphone checkbox clicked.");

  let trackCamera_old = null;
  let trackMicrophone_old = null;
  let bCamera_old = false;
  let bMicrophone_old = false;

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
