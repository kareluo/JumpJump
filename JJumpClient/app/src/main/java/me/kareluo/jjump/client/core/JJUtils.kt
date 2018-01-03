package me.kareluo.jjump.client.core

import android.graphics.Bitmap
import android.graphics.Color

/**
 * Created by felix on 2018/1/2 下午10:52.
 */

fun getNV21(bitmap: Bitmap?, w: Int, h: Int): ByteArray = if (bitmap != null) {
    val pixels = IntArray(w * h)
    bitmap.getPixels(pixels, 0, w, 0, 0, bitmap.width, bitmap.height)
    bitmap.recycle()
    val yuv = ByteArray(w * h * 3 / 2)
    ARGB2YUV(yuv, pixels, w, h)
    yuv
} else {
    ByteArray(w * h * 3 / 2)
}

fun ARGB2YUV(yuv420sp: ByteArray, argb: IntArray, width: Int, height: Int) {

    var yIndex = 0
    var uvIndex = width * height

    var R: Int
    var G: Int
    var B: Int
    var Y: Int
    var U: Int
    var V: Int
    var index = 0
    for (j in 0 until height) {
        for (i in 0 until width) {

            R = Color.red(argb[index])
            G = Color.green(argb[index])
            B = Color.blue(argb[index])

            // well known RGB to YUV algorithm
            Y = (66 * R + 129 * G + 25 * B + 128 shr 8) + 16
            U = (112 * R - 94 * G - 18 * B + 128 shr 8) + 128
            V = (-38 * R - 74 * G + 112 * B + 128 shr 8) + 128

            // NV21 has a plane of Y and interleaved planes of VU each sampled by a factor of 2
            //    meaning for every 4 Y pixels there are 1 V and 1 U.  Note the sampling is every other
            //    pixel AND every other scanline.
            yuv420sp[yIndex++] = (if (Y < 0) 0 else if (Y > 255) 255 else Y).toByte()
            if (j % 2 == 0 && index % 2 == 0) {
                yuv420sp[uvIndex++] = (if (V < 0) 0 else if (V > 255) 255 else V).toByte()
                yuv420sp[uvIndex++] = (if (U < 0) 0 else if (U > 255) 255 else U).toByte()
            }

            index++
        }
    }
}