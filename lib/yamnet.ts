import { SoundCategory } from "@/types";

// Maps YAMNet class name keywords → our 9 categories
const KEYWORD_MAP: [string[], SoundCategory][] = [
  [["traffic", "car", "truck", "vehicle", "engine", "horn", "motorcycle", "bus", "road"], "traffic"],
  [["construction", "jackhammer", "drill", "hammer", "sawing", "power tool", "chopping"], "construction"],
  [["siren", "ambulance", "alarm", "emergency", "fire", "police"], "siren"],
  [["crowd", "cheering", "applause", "chatter", "speech", "people", "conversation", "shout"], "crowd"],
  [["music", "singing", "song", "instrument", "guitar", "piano", "drum", "beat"], "music"],
  [["wind", "rain", "bird", "water", "nature", "thunder", "animal", "insect", "frog", "cricket"], "nature"],
  [["inside", "indoor", "room", "echo", "reverb", "air conditioning", "hvac", "fan"], "indoor"],
  [["silence", "quiet", "ambient", "hum", "low noise"], "quiet"],
];

function classNameToCategory(className: string): SoundCategory {
  const lower = className.toLowerCase();
  for (const [keywords, cat] of KEYWORD_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return "unknown";
}

let modelPromise: Promise<unknown> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tf: any = null;

async function loadTF() {
  if (!tf) tf = await import("@tensorflow/tfjs");
  return tf;
}

async function getModel() {
  if (!modelPromise) {
    const _tf = await loadTF();
    modelPromise = _tf.loadGraphModel(
      "https://tfhub.dev/google/tfjs-model/yamnet/tfjs/1",
      { fromTFHub: true }
    );
  }
  return modelPromise;
}

async function resampleTo16kHz(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  // Decode at native rate
  const nativeCtx = new AudioContext();
  const nativeBuffer = await nativeCtx.decodeAudioData(arrayBuffer);
  nativeCtx.close();

  const TARGET_RATE = 16000;
  if (nativeBuffer.sampleRate === TARGET_RATE) {
    return nativeBuffer.getChannelData(0);
  }

  // Resample via OfflineAudioContext
  const duration = nativeBuffer.duration;
  const offlineCtx = new OfflineAudioContext(
    1,
    Math.ceil(TARGET_RATE * duration),
    TARGET_RATE
  );
  const source = offlineCtx.createBufferSource();
  source.buffer = nativeBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);
  const resampled = await offlineCtx.startRendering();
  return resampled.getChannelData(0);
}

export interface ClassificationResult {
  category: SoundCategory;
  confidence: number; // 0–1
  label: string;      // raw YAMNet class name
}

// YAMNet class names (521 total — we embed the most relevant subset)
// Full list: https://github.com/tensorflow/models/blob/master/research/audioset/yamnet/yamnet_class_map.csv
const YAMNET_CLASSES: Record<number, string> = {
  0: "Speech", 1: "Male speech, man speaking", 2: "Female speech, woman speaking",
  3: "Child speech, kid speaking", 4: "Conversation", 5: "Narration, monologue",
  6: "Babbling", 7: "Speech synthesizer", 8: "Shout", 9: "Bellow",
  10: "Whoop", 11: "Yell", 12: "Children shouting", 13: "Screaming",
  14: "Whispering", 15: "Laughter", 20: "Crying, sobbing", 30: "Applause",
  31: "Chatter", 32: "Crowd", 33: "Hubbub, speech noise, speech babble",
  40: "Music", 41: "Musical instrument", 42: "Plucked string instrument",
  70: "Singing", 72: "Choir", 80: "Drum", 90: "Piano", 100: "Guitar",
  110: "Brass instrument", 120: "Wind instrument",
  130: "Vehicle", 131: "Car", 132: "Car alarm", 133: "Power windows",
  134: "Skidding", 135: "Tire squeal", 136: "Car passing by",
  137: "Race car, auto racing", 138: "Truck", 139: "Air brakes",
  140: "Air horn, truck horn", 141: "Reversing beeps", 142: "Ice cream truck",
  143: "Bus", 144: "Emergency vehicle", 145: "Police car (siren)",
  146: "Ambulance (siren)", 147: "Fire engine, fire truck (siren)",
  148: "Motorcycle", 149: "Traffic noise, roadway noise",
  150: "Rail transport", 151: "Train", 152: "Train whistle",
  153: "Train horn", 154: "Railroad car, train wagon",
  155: "Train wheels squealing", 156: "Subway, metro, underground",
  160: "Aircraft", 161: "Aircraft engine", 162: "Jet engine",
  163: "Propeller, airscrew", 164: "Helicopter",
  165: "Fixed-wing aircraft, airplane", 166: "Bicycle bell",
  170: "Jackhammer", 171: "Drill", 172: "Power tool",
  173: "Pneumatic drill", 174: "Chainsaw", 175: "Mechanical fan",
  176: "Air conditioning", 177: "HVAC", 178: "Lawn mower",
  179: "Blender", 180: "Beeper, pager", 181: "Alarm clock",
  182: "Smoke detector, smoke alarm", 183: "Fire alarm",
  184: "Foghorn", 185: "Buzzer", 186: "Alarm", 187: "Telephone",
  200: "Bell", 210: "Dog", 211: "Dog bark", 212: "Bow-wow",
  220: "Cat", 221: "Meow", 230: "Bird", 231: "Bird vocalization",
  232: "Bird song", 233: "Chirp, tweet", 240: "Frog", 250: "Insect",
  251: "Cricket", 260: "Wind", 261: "Rustling leaves", 262: "Wind noise",
  270: "Rain", 271: "Raindrop", 272: "Rain on surface",
  273: "Stream", 274: "Waterfall", 275: "Ocean", 276: "Water",
  280: "Thunder", 281: "Thunderstorm",
  290: "Silence", 291: "Inside, small room", 292: "Inside, large room",
  293: "Inside, public space", 294: "Outside, urban or manmade",
  295: "Outside, rural or natural", 296: "Reverberation",
  297: "Noise", 298: "Environmental noise", 299: "Static",
  300: "Mains hum", 301: "Mechanical", 302: "Engine", 303: "Motor",
};

export async function classifyAudio(blob: Blob): Promise<ClassificationResult> {
  const _tf = await loadTF();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = await getModel() as any;

  const samples = await resampleTo16kHz(blob);
  const waveform = _tf.tensor1d(samples);

  // YAMNet returns [scores, embeddings, spectrogram]
  const [scores] = model.predict(waveform) as [unknown];
  waveform.dispose();

  // Average scores across all frames
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meanScores = (scores as any).mean(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scoresArray: number[] = await (meanScores as any).data();
  meanScores.dispose();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (scores as any).dispose();

  // Find top class
  let topIdx = 0;
  let topScore = -Infinity;
  for (let i = 0; i < scoresArray.length; i++) {
    if (scoresArray[i] > topScore) { topScore = scoresArray[i]; topIdx = i; }
  }

  const label = YAMNET_CLASSES[topIdx] ?? `Class ${topIdx}`;
  const category = classNameToCategory(label);

  return { category, confidence: Math.min(topScore, 1), label };
}

export function isYamnetAvailable(): boolean {
  return typeof window !== "undefined" && typeof AudioContext !== "undefined";
}
