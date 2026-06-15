import { LoudnessResult } from "@/types";

export async function analyzeLoudness(audioBlob: Blob): Promise<LoudnessResult> {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  await audioContext.close();

  const channelData = audioBuffer.getChannelData(0);
  let sumSquares = 0;
  let peak = 0;

  for (let i = 0; i < channelData.length; i++) {
    const sample = channelData[i];
    sumSquares += sample * sample;
    const abs = Math.abs(sample);
    if (abs > peak) peak = abs;
  }

  const rms = Math.sqrt(sumSquares / channelData.length);
  const safeRms = rms > 0 ? rms : 1e-10;
  const dbfs = 20 * Math.log10(safeRms);
  const loudnessScore = Math.min(100, Math.max(0, ((dbfs + 60) / 60) * 100));

  return { rms, peak, dbfs, loudnessScore };
}
