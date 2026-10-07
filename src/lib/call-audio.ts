import { VOICE_SAMPLE_RATE } from "@/lib/voice-protocol";

/** Streams the microphone as ~100 ms chunks of 24 kHz PCM16 (see public/worklets). */
export async function startMic(onChunk: (pcm: ArrayBuffer) => void) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
  });

  const context = new AudioContext();
  await context.audioWorklet.addModule("/worklets/pcm-capture.js");

  const worklet = new AudioWorkletNode(context, "pcm-capture", {
    processorOptions: { targetRate: VOICE_SAMPLE_RATE },
  });
  worklet.port.onmessage = (event: MessageEvent<ArrayBuffer>) =>
    onChunk(event.data);

  // Routed through a silent gain so the graph stays active in every browser.
  const silent = context.createGain();
  silent.gain.value = 0;
  context.createMediaStreamSource(stream).connect(worklet).connect(silent).connect(context.destination);

  return () => {
    stream.getTracks().forEach((track) => track.stop());
    void context.close();
  };
}

/** Plays streamed PCM16 chunks back to back; `interrupt()` drops what is queued. */
export class PcmPlayer {
  private context = new AudioContext({ sampleRate: VOICE_SAMPLE_RATE });
  private sources = new Set<AudioBufferSourceNode>();
  private nextTime = 0;
  private idleTimer?: ReturnType<typeof setTimeout>;

  constructor(private onSpeakingChange: (speaking: boolean) => void) {}

  enqueue(base64: string) {
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    const pcm = new Int16Array(bytes.buffer, 0, Math.floor(bytes.length / 2));
    const buffer = this.context.createBuffer(1, pcm.length, VOICE_SAMPLE_RATE);
    buffer.copyToChannel(Float32Array.from(pcm, (sample) => sample / 0x8000), 0);

    clearTimeout(this.idleTimer);
    this.onSpeakingChange(true);

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    source.onended = () => {
      this.sources.delete(source);
      // Short grace period so gaps between streamed chunks don't flicker,
      // and the speaker tail is not picked up as the caller.
      if (this.sources.size === 0) {
        this.idleTimer = setTimeout(() => this.onSpeakingChange(false), 400);
      }
    };

    const startAt = Math.max(this.nextTime, this.context.currentTime);
    source.start(startAt);
    this.nextTime = startAt + buffer.duration;
    this.sources.add(source);
  }

  interrupt() {
    for (const source of this.sources) {
      source.onended = null;
      source.stop();
    }
    this.sources.clear();
    this.nextTime = 0;
    clearTimeout(this.idleTimer);
    this.onSpeakingChange(false);
  }

  close() {
    this.interrupt();
    void this.context.close();
  }
}
