package me.kareluo.jjump.client.core

import android.annotation.SuppressLint
import android.graphics.Bitmap
import java.lang.reflect.Method

/**
 * Created by felix on 2017/3/5.
 */

class JJScreenshot(config: Configure) {

    private var method: Method? = null

    private val configure: Configure = config

    init {
        @SuppressLint("PrivateApi")
        method = try {
            val clazz = Class.forName("android.view.SurfaceControl")
            clazz?.getDeclaredMethod("screenshot", Integer.TYPE, Integer.TYPE)
        } catch (e: ClassNotFoundException) {
            null
        }
    }

    fun shot(): Bitmap? {
        return method?.invoke(null, configure.width, configure.height) as Bitmap?
    }
}

data class Configure(val width: Int = 720, val height: Int = 1080) {
    var quality: Int = 90
}