let activeRecorder: MediaRecorder | null = null;
let activeStream: MediaStream | null = null;

export async function startRecording(durationSeconds: number): Promise<Blob> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  activeStream = stream;

  return new Promise((resolve, reject) => {
    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(stream);
    activeRecorder = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      activeRecorder = null;
      activeStream = null;
      resolve(new Blob(chunks, { type: "audio/webm" }));
    };

    recorder.onerror = (e) => {
      stream.getTracks().forEach((t) => t.stop());
      activeRecorder = null;
      activeStream = null;
      reject(e);
    };

    recorder.start();
    setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, durationSeconds * 1000);
  });
}

export function cancelRecording(): void {
  if (activeRecorder && activeRecorder.state === "recording") {
    activeRecorder.ondataavailable = null;
    activeRecorder.onstop = null;
    activeRecorder.stop();
    activeRecorder = null;
  }
  if (activeStream) {
    activeStream.getTracks().forEach((t) => t.stop());
    activeStream = null;
  }
}
