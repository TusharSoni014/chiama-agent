/**
 * Captures microphone audio, downsamples it to `targetRate` (mono) and posts
 * 16-bit PCM chunks to the main thread. Loaded by `startMic` in `src/lib/call-audio.ts`.
 */
class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();

    const { targetRate = 16000, chunkMs = 100 } =
      options.processorOptions ?? {};

    // `sampleRate` is the AudioContext rate (usually 44.1 or 48 kHz).
    this.ratio = sampleRate / targetRate;
    this.chunkSize = Math.round((targetRate * chunkMs) / 1000);
    this.chunk = new Int16Array(this.chunkSize);
    this.chunkLength = 0;

    // Box-filter downsampling state.
    this.sum = 0;
    this.count = 0;
    this.phase = 0;
  }

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) return true;

    for (let i = 0; i < channel.length; i++) {
      this.sum += channel[i];
      this.count += 1;
      this.phase += 1;

      if (this.phase >= this.ratio) {
        const sample = Math.max(-1, Math.min(1, this.sum / this.count));
        this.chunk[this.chunkLength++] =
          sample < 0 ? sample * 0x8000 : sample * 0x7fff;

        this.sum = 0;
        this.count = 0;
        this.phase -= this.ratio;

        if (this.chunkLength === this.chunkSize) {
          this.port.postMessage(this.chunk.buffer, [this.chunk.buffer]);
          this.chunk = new Int16Array(this.chunkSize);
          this.chunkLength = 0;
        }
      }
    }

    return true;
  }
}

registerProcessor("pcm-capture", PcmCaptureProcessor);
