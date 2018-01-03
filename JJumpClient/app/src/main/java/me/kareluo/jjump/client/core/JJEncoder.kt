package me.kareluo.jjump.client.core

import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaFormat
import android.os.SystemClock

/**
 * Created by felix on 2017/3/26.
 */

class JJEncoder(private val config: Configure) : Runnable {

    private val bitRate = 6000000

    private val frameRate = 30

    private val iFrameRate = 2

    private var current: Thread? = null

    var callback: EncoderCallback? = null

    private val shooter = JJScreenshot(config)

    private val encoder: MediaCodec = MediaCodec.createEncoderByType("video/avc")

    init {
        println("JJEncoder:init")
        val format = MediaFormat.createVideoFormat("video/avc", config.width, config.height)
        format.setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
        format.setInteger(MediaFormat.KEY_FRAME_RATE, frameRate)
        format.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, iFrameRate)
        format.setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar)
        encoder.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        encoder.start()
        println("JJEncoder:init-end")
    }

    fun start() {
        println("JJEncoder:start")
        if (current?.isAlive == true) stop()
        current = Thread(this)
        current!!.start()
        println("JJEncoder:end")
    }

    fun stop() {
        if (current?.isAlive == true) {
            current?.interrupt()
            current?.join()
        }
    }

    private fun presentationTimeUs(index: Int): Long {
        return 132L + index * 1000000L / frameRate
    }

    override fun run() {
        try {

            println("JJEncoder:run")

            val info = MediaCodec.BufferInfo()
            var millis = SystemClock.uptimeMillis()
            val duration = 1000 / frameRate

            while (true) {

                val bitmap = shooter.shot()

                val yuv = getNV21(bitmap, config.width, config.height)

                var index = 0

                if (yuv.isNotEmpty()) {

                    val inputIndex = encoder.dequeueInputBuffer(0)

                    if (inputIndex >= 0) {
                        val inputBuffer = encoder.inputBuffers[inputIndex]
                        inputBuffer.clear()
                        inputBuffer.put(yuv)
                        encoder.queueInputBuffer(inputIndex, 0, inputBuffer.position(), presentationTimeUs(index++), 0)
                    }

                    var outputIndex = encoder.dequeueOutputBuffer(info, 0)

                    while (outputIndex == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED || outputIndex >= 0) {

                        if (outputIndex >= 0) {
                            if (info.size > 0) {
                                val codes = ByteArray(info.size)
                                encoder.outputBuffers[outputIndex].get(codes)
                                callback?.onEncodeFrame(codes)
                                val d = duration + millis - SystemClock.uptimeMillis()
                                if (d > 1) SystemClock.sleep(d - 1)
                                millis = SystemClock.uptimeMillis()
                            }
                            encoder.releaseOutputBuffer(outputIndex, false)
                        }
                        outputIndex = encoder.dequeueOutputBuffer(info, 0)
                    }
                }
            }
        } catch (e: Exception) {

        }
    }

    interface EncoderCallback {
        fun onEncodeFrame(frame: ByteArray)
    }
}
