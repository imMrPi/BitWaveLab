import { chirp as sources_chirp } from "./sources/chirp";
import { sine as sources_sine } from "./sources/sine";
import { square as sources_square } from "./sources/square";
import { bits as sources_bits } from "./sources/bits";
import { noise as sources_noise } from "./sources/noise";
import { microphone as sources_microphone } from "./sources/microphone";
import { image as sources_image } from "./sources/image";
import { text as sources_text } from "./sources/text";
import { psd as analysis_psd } from "./analysis/psd";
import { correlation as analysis_correlation } from "./analysis/correlation";
import { metrics as analysis_metrics } from "./analysis/metrics";
import { constellation as analysis_constellation } from "./analysis/constellation";
import { eyediagram as analysis_eyediagram } from "./analysis/eyediagram";
import { fft as analysis_fft } from "./analysis/fft";
import { hilbert as analysis_hilbert } from "./analysis/hilbert";
import { scope as analysis_scope } from "./analysis/scope";
import { guide as analysis_guide } from "./analysis/guide";
import { stft as analysis_stft } from "./analysis/stft";
import { interpolate as sampling_interpolate } from "./sampling/interpolate";
import { decimate as sampling_decimate } from "./sampling/decimate";
import { uniform as sampling_uniform } from "./sampling/uniform";
import { antialias as sampling_antialias } from "./sampling/antialias";
import { nonuniform as sampling_nonuniform } from "./sampling/nonuniform";
import { alaw as quantization_alaw } from "./quantization/alaw";
import { mulaw as quantization_mulaw } from "./quantization/mulaw";
import { dpcm as quantization_dpcm } from "./quantization/dpcm";
import { pcm as quantization_pcm } from "./quantization/pcm";
import { uniform as quantization_uniform } from "./quantization/uniform";
import { adpcm as quantization_adpcm } from "./quantization/adpcm";
import { delta as quantization_delta } from "./quantization/delta";
import { arithmetic as source_coding_arithmetic } from "./source-coding/arithmetic";
import { codec as source_coding_codec } from "./source-coding/codec";
import { huffman as source_coding_huffman } from "./source-coding/huffman";
import { lzw as source_coding_lzw } from "./source-coding/lzw";
import { rle as source_coding_rle } from "./source-coding/rle";
import { interleave as channel_coding_interleave } from "./channel-coding/interleave";
import { convolutional as channel_coding_convolutional } from "./channel-coding/convolutional";
import { crc8 as channel_coding_crc8 } from "./channel-coding/crc8";
import { hamming74 as channel_coding_hamming74 } from "./channel-coding/hamming74";
import { checksum as channel_coding_checksum } from "./channel-coding/checksum";
import { ldpc as channel_coding_ldpc } from "./channel-coding/ldpc";
import { parity as channel_coding_parity } from "./channel-coding/parity";
import { reedsolomon as channel_coding_reedsolomon } from "./channel-coding/reedsolomon";
import { turbo as channel_coding_turbo } from "./channel-coding/turbo";
import { ami as line_coding_ami } from "./line-coding/ami";
import { diffmanchester as line_coding_diffmanchester } from "./line-coding/diffmanchester";
import { manchester as line_coding_manchester } from "./line-coding/manchester";
import { mlt3 as line_coding_mlt3 } from "./line-coding/mlt3";
import { nrzi as line_coding_nrzi } from "./line-coding/nrzi";
import { nrzl as line_coding_nrzl } from "./line-coding/nrzl";
import { rz as line_coding_rz } from "./line-coding/rz";
import { pseudoternary as line_coding_pseudoternary } from "./line-coding/pseudoternary";
import { unipolar as line_coding_unipolar } from "./line-coding/unipolar";
import { b8zs as scrambling_b8zs } from "./scrambling/b8zs";
import { hdb3 as scrambling_hdb3 } from "./scrambling/hdb3";
import { lfsr as scrambling_lfsr } from "./scrambling/lfsr";
import { selfsync as scrambling_selfsync } from "./scrambling/selfsync";
import { cdma as multiplexing_cdma } from "./multiplexing/cdma";
import { fdm as multiplexing_fdm } from "./multiplexing/fdm";
import { ofdm as multiplexing_ofdm } from "./multiplexing/ofdm";
import { tdm as multiplexing_tdm } from "./multiplexing/tdm";
import { wdm as multiplexing_wdm } from "./multiplexing/wdm";
import { gaussian as pulse_shaping_gaussian } from "./pulse-shaping/gaussian";
import { raisedcos as pulse_shaping_raisedcos } from "./pulse-shaping/raisedcos";
import { rect as pulse_shaping_rect } from "./pulse-shaping/rect";
import { rrc as pulse_shaping_rrc } from "./pulse-shaping/rrc";
import { attenuation as channel_attenuation } from "./channel/attenuation";
import { multipath as channel_multipath } from "./channel/multipath";
import { awgn as channel_awgn } from "./channel/awgn";
import { cfo as channel_cfo } from "./channel/cfo";
import { clipping as channel_clipping } from "./channel/clipping";
import { impulse as channel_impulse } from "./channel/impulse";
import { phase as channel_phase } from "./channel/phase";
import { rayleigh as channel_rayleigh } from "./channel/rayleigh";
import { rician as channel_rician } from "./channel/rician";
import { agc as synchronization_agc } from "./synchronization/agc";
import { carrier as synchronization_carrier } from "./synchronization/carrier";
import { channel as synchronization_channel } from "./synchronization/channel";
import { clock as synchronization_clock } from "./synchronization/clock";
import { frame as synchronization_frame } from "./synchronization/frame";
import { symbol as synchronization_symbol } from "./synchronization/symbol";
import { ber as receiver_ber } from "./receiver/ber";
import { coherent as receiver_coherent } from "./receiver/coherent";
import { envelope as receiver_envelope } from "./receiver/envelope";
import { map as receiver_map } from "./receiver/map";
import { matched as receiver_matched } from "./receiver/matched";
import { ml as receiver_ml } from "./receiver/ml";
import { equalizer as receiver_equalizer } from "./receiver/equalizer";
import { noncoherent as receiver_noncoherent } from "./receiver/noncoherent";
import { threshold as receiver_threshold } from "./receiver/threshold";
import { zf as receiver_zf } from "./receiver/zf";
import { arithmetic as decoding_arithmetic } from "./decoding/arithmetic";
import { berlekamp as decoding_berlekamp } from "./decoding/berlekamp";
import { deinterleave as decoding_deinterleave } from "./decoding/deinterleave";
import { checksum as decoding_checksum } from "./decoding/checksum";
import { crc as decoding_crc } from "./decoding/crc";
import { hamming as decoding_hamming } from "./decoding/hamming";
import { huffman as decoding_huffman } from "./decoding/huffman";
import { iterative as decoding_iterative } from "./decoding/iterative";
import { ldpc as decoding_ldpc } from "./decoding/ldpc";
import { lzw as decoding_lzw } from "./decoding/lzw";
import { parity as decoding_parity } from "./decoding/parity";
import { descramble as decoding_descramble } from "./decoding/descramble";
import { reedsolomon as decoding_reedsolomon } from "./decoding/reedsolomon";
import { rle as decoding_rle } from "./decoding/rle";
import { source as decoding_source } from "./decoding/source";
import { turbo as decoding_turbo } from "./decoding/turbo";
import { viterbi as decoding_viterbi } from "./decoding/viterbi";
import { audio as reconstruction_audio } from "./reconstruction/audio";
import { dac as reconstruction_dac } from "./reconstruction/dac";
import { lowpass as reconstruction_lowpass } from "./reconstruction/lowpass";
import { smooth as reconstruction_smooth } from "./reconstruction/smooth";
import { audioOutput as reconstruction_audio_output } from "./reconstruction/audio-output";
import { imageOutput as reconstruction_image_output } from "./reconstruction/image-output";
import { textOutput as reconstruction_text_output } from "./reconstruction/text-output";
import { sensor as embedded_sensor } from "./embedded/sensor";
import { dma as embedded_dma } from "./embedded/dma";
import { i2c as embedded_i2c } from "./embedded/i2c";
import { adc as embedded_adc } from "./embedded/adc";
import { pwm as embedded_pwm } from "./embedded/pwm";
import { spi as embedded_spi } from "./embedded/spi";
import { uart as embedded_uart } from "./embedded/uart";

export const catalogAlgorithmPlugins = [
  sources_chirp,
  sources_sine,
  sources_square,
  sources_bits,
  sources_noise,
  sources_microphone,
  sources_image,
  sources_text,
  analysis_psd,
  analysis_correlation,
  analysis_metrics,
  analysis_constellation,
  analysis_eyediagram,
  analysis_fft,
  analysis_hilbert,
  analysis_scope,
  analysis_guide,
  analysis_stft,
  sampling_interpolate,
  sampling_decimate,
  sampling_uniform,
  sampling_antialias,
  sampling_nonuniform,
  quantization_alaw,
  quantization_mulaw,
  quantization_dpcm,
  quantization_pcm,
  quantization_uniform,
  quantization_adpcm,
  quantization_delta,
  source_coding_arithmetic,
  source_coding_codec,
  source_coding_huffman,
  source_coding_lzw,
  source_coding_rle,
  channel_coding_interleave,
  channel_coding_convolutional,
  channel_coding_crc8,
  channel_coding_hamming74,
  channel_coding_checksum,
  channel_coding_ldpc,
  channel_coding_parity,
  channel_coding_reedsolomon,
  channel_coding_turbo,
  line_coding_ami,
  line_coding_diffmanchester,
  line_coding_manchester,
  line_coding_mlt3,
  line_coding_nrzi,
  line_coding_nrzl,
  line_coding_rz,
  line_coding_pseudoternary,
  line_coding_unipolar,
  scrambling_b8zs,
  scrambling_hdb3,
  scrambling_lfsr,
  scrambling_selfsync,
  multiplexing_cdma,
  multiplexing_fdm,
  multiplexing_ofdm,
  multiplexing_tdm,
  multiplexing_wdm,
  pulse_shaping_gaussian,
  pulse_shaping_raisedcos,
  pulse_shaping_rect,
  pulse_shaping_rrc,
  channel_attenuation,
  channel_multipath,
  channel_awgn,
  channel_cfo,
  channel_clipping,
  channel_impulse,
  channel_phase,
  channel_rayleigh,
  channel_rician,
  synchronization_agc,
  synchronization_carrier,
  synchronization_channel,
  synchronization_clock,
  synchronization_frame,
  synchronization_symbol,
  receiver_ber,
  receiver_coherent,
  receiver_envelope,
  receiver_map,
  receiver_matched,
  receiver_ml,
  receiver_equalizer,
  receiver_noncoherent,
  receiver_threshold,
  receiver_zf,
  decoding_arithmetic,
  decoding_berlekamp,
  decoding_deinterleave,
  decoding_checksum,
  decoding_crc,
  decoding_hamming,
  decoding_huffman,
  decoding_iterative,
  decoding_ldpc,
  decoding_lzw,
  decoding_parity,
  decoding_descramble,
  decoding_reedsolomon,
  decoding_rle,
  decoding_source,
  decoding_turbo,
  decoding_viterbi,
  reconstruction_audio,
  reconstruction_dac,
  reconstruction_lowpass,
  reconstruction_smooth,
  reconstruction_audio_output,
  reconstruction_image_output,
  reconstruction_text_output,
  embedded_sensor,
  embedded_dma,
  embedded_i2c,
  embedded_adc,
  embedded_pwm,
  embedded_spi,
  embedded_uart,
] as const;
