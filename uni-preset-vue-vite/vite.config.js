import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [
    uni(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://jpuxbdmaupfk.sealoshzh.site',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/wx-push': {
        target: 'https://wx.xtuis.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wx-push/, ''),
      }
    }
  },
  build: {
    assetsDir: 'static',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const path = assetInfo.name.split('/')
          const fileName = path[path.length - 1]
          const dir = path.slice(0, -1).join('/')
          return `static/${dir}/${fileName}`
        }
      }
    }
  }
})
