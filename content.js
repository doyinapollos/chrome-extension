console.log("Hi, I have been injected whoopie!!!");

var recorder = null;

function onAccessApproved(stream) {
  recorder = new MediaRecorder(stream);
  let recordedChunks = [];

  recorder.ondataavailable = function (event) {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  recorder.onstop = function () {
    let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
    let url = URL.createObjectURL(recordedBlob);

    let newWindow = window.open("", "_blank");
    let newWindowContent = `
      <html>
      <head>
        <title>Screen Recording</title>
        <style>
          body {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            height: 500px;
          }
          .video-container {
            width: 550px;
            height: 500px;
            margin-right: 20px;
          }
          .other-elements {
            width: 250px;
            height: 400px;
            background-color: gray;
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div class="video-container">
          <video controls width="100%" height="100%">
            <source src="${url}" type="video/webm">
            Your browser does not support the video tag.
          </video>
        </div>
        <div class="other-elements">
          <a href="${url}" download="screen-recording.webm" style="text-decoration: none; color: white;">
            <h3>Download Recording</h3>
          </a>
          <button onclick="sendToEndpoint()" style="margin-top: 20px;">Send to Endpoint</button>
        </div>
      </body>
      </html>
    `;
    newWindow.document.write(newWindowContent);
  };

  recorder.start();

  // setTimeout(function () {
  //   recorder.stop();
  // }, 5000); // Stops recording after 5 seconds (adjust the duration as needed)
}

function sendToEndpoint() {
  // Code to send the recording to an endpoint can be added here
  console.log("Sending recording to endpoint...");
}

// function onAccessApproved(stream) {
//   recorder = new MediaRecorder(stream);
//   let recordedChunks = [];

//   recorder.ondataavailable = function (event) {
//     if (event.data.size > 0) {
//       recordedChunks.push(event.data);
//     }
//   };

//   recorder.onstop = function () {
//     let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
//     let url = URL.createObjectURL(recordedBlob);

//     let newWindow = window.open("", "_blank");
//     newWindow.document.write("<h2>Screen Recording</h2>");

//     // Create a video element for playback
//     let videoElement = document.createElement("video");
//     videoElement.controls = true;
//     videoElement.src = url;

//     let downloadLink = document.createElement("a");
//     downloadLink.href = url;
//     downloadLink.download = "screen-recording.webm";
//     downloadLink.innerText = "Download Recording";

//     let sendButton = document.createElement("button");
//     sendButton.innerText = "Send to Endpoint";
//     sendButton.onclick = function () {
//       // Code to send the recording to an endpoint can be added here
//       console.log("Sending recording to endpoint...");
//     };

//     newWindow.document.body.appendChild(videoElement);
//     newWindow.document.body.appendChild(document.createElement("br"));
//     newWindow.document.body.appendChild(downloadLink);
//     newWindow.document.body.appendChild(document.createElement("br"));
//     newWindow.document.body.appendChild(sendButton);
//   };

//   recorder.start();

//   // setTimeout(function () {
//   //   recorder.stop();
//   // }, 5000);  // Stops recording after 5 seconds (adjust the duration as needed)
// }

// function onAccessApproved(stream) {
//   recorder = new MediaRecorder(stream);

//   recorder.start();

//   recorder.onstop = function () {
//     stream.getTracks().forEach(function (track) {
//       if (track.readyState === "live") {
//         track.stop();
//       }
//     });
//   };

//   recorder.ondataavailable = function (event) {
//     let recordedBlob = event.data;
//     let url = URL.createObjectURL(recordedBlob);

//     let a = document.createElement("a");

//     a.style.display = "none";
//     a.href = url;
//     a.download = "screen-recording.webm";

//     document.body.appendChild(a);
//     a.click();

//     document.body.removeChild(a);

//     URL.revokeObjectURL(url);
//   };
// }

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "request_recording") {
    console.log("requesting recording");

    sendResponse(`processed: ${message.action}`);

    navigator.mediaDevices
      .getDisplayMedia({
        audio: true,
        video: {
          width: 9999999999,
          height: 9999999999,
        },
      })
      .then((stream) => {
        onAccessApproved(stream);
      });
  }

  if (message.action === "stopvideo") {
    console.log("stopping video");
    sendResponse(`processed: ${message.action}`);
    if (!recorder) return console.log("no recorder");

    recorder.stop();
  }
});
